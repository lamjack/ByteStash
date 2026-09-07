import argparse
import json
import os
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen


class ImportFailed(RuntimeError):
    def __init__(self, message, created_ids=None):
        super().__init__(message)
        self.created_ids = list(created_ids or [])


def _ensure_loopback(base_url):
    parsed = urlparse(base_url)
    if parsed.scheme not in {"http", "https"}:
        raise ValueError("Base URL must use http or https")
    if parsed.hostname not in {"127.0.0.1", "localhost", "::1"}:
        raise ValueError("Base URL must target a loopback host")
    return base_url.rstrip("/")


def _request_json(base_url, method, path, api_key, payload=None):
    body = None
    headers = {
        "Accept": "application/json",
        "x-api-key": api_key,
    }
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    request = Request(f"{base_url}{path}", data=body, headers=headers, method=method)
    try:
        with urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        raise RuntimeError(f"HTTP {error.code} from {method} {path}") from error
    except URLError as error:
        raise RuntimeError(f"Connection failed for {method} {path}") from error
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Invalid JSON from {method} {path}") from error


def _canonical_snippet(snippet):
    fragments = snippet.get("fragments") or []
    return {
        "title": snippet.get("title", ""),
        "description": snippet.get("description", ""),
        "categories": sorted(category.lower() for category in snippet.get("categories") or []),
        "fragments": [
            {
                "file_name": fragment.get("file_name", ""),
                "code": fragment.get("code", ""),
                "language": fragment.get("language", "plaintext"),
                "position": fragment.get("position", position),
            }
            for position, fragment in enumerate(fragments)
        ],
        "is_public": int(bool(snippet.get("is_public", 0))),
    }


def import_snippets(import_data, base_url, api_key, request=None):
    base_url = _ensure_loopback(base_url)
    if not isinstance(api_key, str) or not api_key:
        raise ValueError("BYTESTASH_API_KEY is required")
    if not isinstance(import_data, dict) or not isinstance(import_data.get("version"), str):
        raise ValueError("Import file must contain a string version")
    snippets = import_data.get("snippets")
    if not isinstance(snippets, list) or not snippets:
        raise ValueError("Import file must contain at least one snippet")

    if request is None:
        request = lambda method, path, key, payload=None: _request_json(
            base_url, method, path, key, payload
        )

    initial = request("GET", "/api/snippets?limit=1&offset=0", api_key)
    initial_total = initial.get("pagination", {}).get("total")
    if initial_total != 0:
        raise ImportFailed(f"Expected an empty ByteStash library, found {initial_total} snippets")

    created_ids = []
    for index, snippet in enumerate(snippets, start=1):
        try:
            created = request("POST", "/api/snippets", api_key, snippet)
            snippet_id = created.get("id")
            if snippet_id is None:
                raise RuntimeError("Create response did not include an id")
            created_ids.append(snippet_id)
            fetched = request("GET", f"/api/snippets/{snippet_id}", api_key)
            if _canonical_snippet(fetched) != _canonical_snippet(snippet):
                raise RuntimeError("Read-back did not match the import payload")
        except Exception as error:
            raise ImportFailed(f"Import stopped at snippet index {index}: {error}", created_ids) from error

    final = request("GET", "/api/snippets?limit=1&offset=0", api_key)
    final_total = final.get("pagination", {}).get("total")
    if final_total != len(snippets):
        raise ImportFailed(
            f"Final snippet count mismatch: expected {len(snippets)}, found {final_total}",
            created_ids,
        )

    return {"created": len(created_ids), "created_ids": created_ids}


def _write_report(path, report):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    path.chmod(0o600)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Import ByteStash JSON through its local REST API.")
    parser.add_argument("import_file", type=Path)
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--report", required=True, type=Path)
    args = parser.parse_args(argv)

    report = {"status": "failed", "created": 0, "created_ids": []}
    try:
        import_data = json.loads(args.import_file.read_text(encoding="utf-8"))
        result = import_snippets(
            import_data,
            args.base_url,
            os.environ.get("BYTESTASH_API_KEY", ""),
        )
        report = {"status": "completed", **result}
    except ImportFailed as error:
        report["created"] = len(error.created_ids)
        report["created_ids"] = error.created_ids
        report["error"] = str(error)
        _write_report(args.report, report)
        print(str(error), file=sys.stderr)
        return 1
    except (OSError, json.JSONDecodeError, ValueError) as error:
        report["error"] = str(error)
        _write_report(args.report, report)
        print(str(error), file=sys.stderr)
        return 1

    _write_report(args.report, report)
    print(json.dumps(report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
