import unittest


class ImportSnippetsTests(unittest.TestCase):
    def test_checks_empty_collection_then_creates_and_verifies_each_snippet(self):
        try:
            from scripts.import_bytestash import import_snippets
        except ImportError:
            self.fail("API importer module is missing")

        snippet = {
            "title": "List files",
            "description": "",
            "categories": ["folder:shell", "source:snippetslab"],
            "fragments": [
                {
                    "file_name": "list.sh",
                    "code": "ls -la",
                    "language": "bash",
                    "position": 0,
                }
            ],
            "is_public": 0,
            "is_pinned": 0,
            "is_favorite": 0,
        }
        calls = []
        created = []

        def request(method, path, api_key, payload=None):
            calls.append((method, path, api_key, payload))
            if method == "GET" and path == "/api/snippets?limit=1&offset=0":
                return {"data": [], "pagination": {"total": len(created)}}
            if method == "POST" and path == "/api/snippets":
                result = {**payload, "id": 7}
                created.append(result)
                return result
            if method == "GET" and path == "/api/snippets/7":
                return created[0]
            raise AssertionError(f"Unexpected request: {method} {path}")

        result = import_snippets(
            {"version": "1.0", "snippets": [snippet]},
            "http://127.0.0.1:5050",
            "temporary-key",
            request=request,
        )

        self.assertEqual(result, {"created": 1, "created_ids": [7]})
        self.assertEqual(
            [(method, path) for method, path, _, _ in calls],
            [
                ("GET", "/api/snippets?limit=1&offset=0"),
                ("POST", "/api/snippets"),
                ("GET", "/api/snippets/7"),
                ("GET", "/api/snippets?limit=1&offset=0"),
            ],
        )


if __name__ == "__main__":
    unittest.main()
