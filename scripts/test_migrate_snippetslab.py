import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


class ConvertLibraryTests(unittest.TestCase):
    def test_preserves_folder_path_tags_language_and_notes(self):
        try:
            from scripts.migrate_snippetslab import convert_library
        except ImportError:
            self.fail("converter module is missing")

        source = {
            "date": "2026-09-07T00:00:00Z",
            "contents": {
                "folders": [
                    {
                        "title": "DevOps",
                        "uuid": "folder-root",
                        "children": [
                            {"title": "Docker", "uuid": "folder-docker", "children": []}
                        ],
                    }
                ],
                "tags": [{"title": "CLI", "uuid": "tag-cli"}],
                "snippets": [
                    {
                        "title": "Start service",
                        "folder": "folder-docker",
                        "tags": ["tag-cli"],
                        "fragments": [
                            {
                                "title": "compose.md",
                                "content": "docker compose up -d",
                                "language": "MarkdownLexer",
                                "note": "Starts the local service.",
                            }
                        ],
                    }
                ],
            },
        }

        converted, report = convert_library(source)

        self.assertEqual(converted["version"], "1.0")
        self.assertEqual(converted["exported_at"], "2026-09-07T00:00:00Z")
        self.assertEqual(len(converted["snippets"]), 1)
        snippet = converted["snippets"][0]
        self.assertEqual(snippet["categories"], ["folder:devops/docker", "cli", "source:snippetslab"])
        self.assertEqual(snippet["description"], "Starts the local service.")
        self.assertEqual(
            snippet["fragments"],
            [
                {
                    "file_name": "compose.md",
                    "code": "docker compose up -d",
                    "language": "markdown",
                    "position": 0,
                }
            ],
        )
        self.assertEqual(report["snippets"], 1)
        self.assertEqual(report["fragments"], 1)
        self.assertEqual(report["unknown_languages"], [])

    def test_rejects_unknown_folder_reference(self):
        from scripts.migrate_snippetslab import convert_library

        source = {
            "contents": {
                "folders": [],
                "tags": [],
                "snippets": [
                    {
                        "title": "Broken reference",
                        "folder": "missing-folder",
                        "tags": [],
                        "fragments": [
                            {
                                "title": "broken.txt",
                                "content": "content",
                                "language": "MarkdownLexer",
                            }
                        ],
                    }
                ],
            }
        }

        with self.assertRaisesRegex(ValueError, "unknown folder missing-folder"):
            convert_library(source)

    def test_cli_writes_import_and_report_files(self):
        source = {
            "date": "2026-09-07T00:00:00Z",
            "contents": {
                "folders": [{"title": "Shell", "uuid": "folder-shell", "children": []}],
                "tags": [],
                "snippets": [
                    {
                        "title": "List files",
                        "folder": "folder-shell",
                        "tags": [],
                        "fragments": [
                            {
                                "title": "list.sh",
                                "content": "ls -la",
                                "language": "BashLexer",
                                "note": "",
                            }
                        ],
                    }
                ],
            },
        }

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source_path = root / "snippetslab.json"
            output_path = root / "bytestash.json"
            report_path = root / "report.json"
            source_path.write_text(json.dumps(source), encoding="utf-8")

            result = subprocess.run(
                [
                    sys.executable,
                    str(Path(__file__).with_name("migrate_snippetslab.py")),
                    str(source_path),
                    str(output_path),
                    "--report",
                    str(report_path),
                ],
                capture_output=True,
                text=True,
                check=False,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue(output_path.is_file())
            self.assertTrue(report_path.is_file())
            self.assertEqual(output_path.stat().st_mode & 0o777, 0o600)
            self.assertEqual(report_path.stat().st_mode & 0o777, 0o600)
            converted = json.loads(output_path.read_text(encoding="utf-8"))
            report = json.loads(report_path.read_text(encoding="utf-8"))
            self.assertEqual(converted["snippets"][0]["fragments"][0]["language"], "bash")
            self.assertEqual(report["language_counts"], {"bash": 1})


if __name__ == "__main__":
    unittest.main()
