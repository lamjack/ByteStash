import argparse
import json
import sys
from collections import Counter
from pathlib import Path


LANGUAGE_MAP = {
    "BashLexer": "bash",
    "MarkdownLexer": "markdown",
}


def _folder_paths(folders):
    paths = {}

    def visit(folder, parents):
        if not isinstance(folder, dict):
            raise ValueError("Folder entries must be objects")
        folder_id = folder.get("uuid")
        title = folder.get("title")
        if not isinstance(folder_id, str) or not folder_id:
            raise ValueError("Every folder must have a UUID")
        if not isinstance(title, str) or not title.strip():
            raise ValueError(f"Folder {folder_id} must have a title")
        if folder_id in paths:
            raise ValueError(f"Duplicate folder UUID: {folder_id}")
        parts = [*parents, title.strip()]
        paths[folder_id] = "/".join(parts)
        children = folder.get("children") or []
        if not isinstance(children, list):
            raise ValueError(f"Folder {folder_id} children must be an array")
        for child in children:
            visit(child, parts)

    if not isinstance(folders, list):
        raise ValueError("contents.folders must be an array")
    for folder in folders:
        visit(folder, [])
    return paths


def _tag_names(tags):
    names = {}
    if not isinstance(tags, list):
        raise ValueError("contents.tags must be an array")
    for tag in tags:
        if not isinstance(tag, dict):
            raise ValueError("Tag entries must be objects")
        tag_id = tag.get("uuid")
        title = tag.get("title")
        if not isinstance(tag_id, str) or not tag_id:
            raise ValueError("Every tag must have a UUID")
        if not isinstance(title, str) or not title.strip():
            raise ValueError(f"Tag {tag_id} must have a title")
        if tag_id in names:
            raise ValueError(f"Duplicate tag UUID: {tag_id}")
        names[tag_id] = title.strip()
    return names


def _unique_categories(values):
    result = []
    seen = set()
    for value in values:
        normalized = value.strip().lower()
        if normalized and normalized not in seen:
            seen.add(normalized)
            result.append(normalized)
    return result


def _description(fragments):
    notes = []
    for fragment in fragments:
        note = fragment.get("note")
        if isinstance(note, str) and note.strip():
            notes.append((fragment.get("title") or "Fragment", note.strip()))
    if len(notes) == 1:
        return notes[0][1]
    return "\n\n".join(f"## {title}\n\n{note}" for title, note in notes)


def convert_library(source):
    if not isinstance(source, dict):
        raise ValueError("SnippetsLab export root must be an object")
    contents = source.get("contents")
    if not isinstance(contents, dict):
        raise ValueError("SnippetsLab export must contain a contents object")

    folder_paths = _folder_paths(contents.get("folders", []))
    tag_names = _tag_names(contents.get("tags", []))
    snippets = contents.get("snippets")
    if not isinstance(snippets, list):
        raise ValueError("contents.snippets must be an array")

    converted_snippets = []
    language_counts = Counter()
    unknown_languages = set()
    fragment_count = 0

    for index, snippet in enumerate(snippets, start=1):
        if not isinstance(snippet, dict):
            raise ValueError(f"Snippet {index} must be an object")
        title = snippet.get("title")
        if not isinstance(title, str) or not title.strip():
            raise ValueError(f"Snippet {index} must have a title")

        categories = []
        folder_id = snippet.get("folder")
        if folder_id:
            if folder_id not in folder_paths:
                raise ValueError(f"Snippet {title} references unknown folder {folder_id}")
            categories.append(f"folder:{folder_paths[folder_id]}")

        snippet_tags = snippet.get("tags") or []
        if not isinstance(snippet_tags, list):
            raise ValueError(f"Snippet {title} tags must be an array")
        for tag_id in snippet_tags:
            if tag_id not in tag_names:
                raise ValueError(f"Snippet {title} references unknown tag {tag_id}")
            categories.append(tag_names[tag_id])
        categories.append("source:snippetslab")

        fragments = snippet.get("fragments")
        if not isinstance(fragments, list) or not fragments:
            raise ValueError(f"Snippet {title} must have at least one fragment")

        converted_fragments = []
        for position, fragment in enumerate(fragments):
            if not isinstance(fragment, dict):
                raise ValueError(f"Snippet {title} contains a non-object fragment")
            content = fragment.get("content")
            if not isinstance(content, str):
                raise ValueError(f"Snippet {title} fragment {position + 1} must have string content")
            fragment_title = fragment.get("title")
            file_name = fragment_title.strip() if isinstance(fragment_title, str) and fragment_title.strip() else f"fragment-{position + 1}"
            source_language = fragment.get("language")
            language = LANGUAGE_MAP.get(source_language, "plaintext")
            if source_language not in LANGUAGE_MAP:
                unknown_languages.add(str(source_language))
            language_counts[language] += 1
            fragment_count += 1
            converted_fragments.append(
                {
                    "file_name": file_name,
                    "code": content,
                    "language": language,
                    "position": position,
                }
            )

        converted_snippets.append(
            {
                "title": title.strip(),
                "description": _description(fragments),
                "categories": _unique_categories(categories),
                "fragments": converted_fragments,
                "is_public": 0,
                "is_pinned": 0,
                "is_favorite": 0,
            }
        )

    exported_at = source.get("date") or source.get("modified") or ""
    if not isinstance(exported_at, str):
        exported_at = ""

    converted = {
        "version": "1.0",
        "exported_at": exported_at,
        "snippets": converted_snippets,
    }
    report = {
        "snippets": len(converted_snippets),
        "fragments": fragment_count,
        "folders": len(folder_paths),
        "tags": len(tag_names),
        "language_counts": dict(sorted(language_counts.items())),
        "unknown_languages": sorted(unknown_languages),
    }
    return converted, report


def _write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    path.chmod(0o600)


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Convert a SnippetsLab JSON export into ByteStash import JSON."
    )
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--report", required=True, type=Path)
    args = parser.parse_args(argv)

    try:
        source = json.loads(args.source.read_text(encoding="utf-8"))
        converted, report = convert_library(source)
        report = {
            **report,
            "source": str(args.source),
            "output": str(args.output),
        }
        _write_json(args.output, converted)
        _write_json(args.report, report)
    except (OSError, json.JSONDecodeError, ValueError) as error:
        print(f"Migration failed: {error}", file=sys.stderr)
        return 1

    print(json.dumps(report, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
