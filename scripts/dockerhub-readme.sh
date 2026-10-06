#!/usr/bin/env bash
# Push docs/dockerhub-README.md to Docker Hub as the repository's full_description.
#
# Required env:
#   DOCKERHUB_USERNAME   Docker Hub username
#   DOCKERHUB_TOKEN      Docker Hub personal access token or password
# Optional env:
#   DOCKERHUB_REPO       default "wizmacaucom/bytestash"
#   README_FILE          default "<repo-root>/docs/dockerhub-README.md"
#   SHORT_DESCRIPTION    default "Code snippet manager with REST API and MCP server (fork of jordan-dalby/ByteStash)" (<=100 chars)
set -euo pipefail

if [[ -z "${DOCKERHUB_USERNAME:-}" ]]; then
  echo "error: DOCKERHUB_USERNAME is required" >&2
  exit 1
fi
if [[ -z "${DOCKERHUB_TOKEN:-}" ]]; then
  echo "error: DOCKERHUB_TOKEN is required" >&2
  exit 1
fi

DOCKERHUB_REPO="${DOCKERHUB_REPO:-wizmacaucom/bytestash}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
README_FILE="${README_FILE:-$REPO_ROOT/docs/dockerhub-README.md}"
SHORT_DESCRIPTION="${SHORT_DESCRIPTION:-Code snippet manager with REST API and MCP server (fork of jordan-dalby/ByteStash)}"

if [[ ! -f "$README_FILE" ]]; then
  echo "error: README file not found: $README_FILE" >&2
  exit 1
fi

readme_size=$(wc -c < "$README_FILE" | tr -d ' ')
if (( readme_size > 25000 )); then
  echo "error: $README_FILE is $readme_size bytes; Docker Hub full_description limit is 25000" >&2
  exit 1
fi

if (( ${#SHORT_DESCRIPTION} > 100 )); then
  echo "error: SHORT_DESCRIPTION is ${#SHORT_DESCRIPTION} chars; must be <= 100" >&2
  exit 1
fi

echo "Logging in to Docker Hub as $DOCKERHUB_USERNAME ..."
login_payload=$(DOCKERHUB_USERNAME="$DOCKERHUB_USERNAME" DOCKERHUB_TOKEN="$DOCKERHUB_TOKEN" python3 -c '
import json, os
print(json.dumps({"username": os.environ["DOCKERHUB_USERNAME"], "password": os.environ["DOCKERHUB_TOKEN"]}))
')

login_body=$(mktemp)
login_code=$(curl -sS -o "$login_body" -w '%{http_code}' \
  -X POST https://hub.docker.com/v2/users/login \
  -H 'Content-Type: application/json' \
  -d "$login_payload")

if [[ "$login_code" != "200" ]]; then
  echo "error: Docker Hub login failed (HTTP $login_code)" >&2
  cat "$login_body" >&2
  rm -f "$login_body"
  exit 1
fi

token=$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["token"])' "$login_body")
rm -f "$login_body"
if [[ -z "$token" ]]; then
  echo "error: could not extract token from login response" >&2
  exit 1
fi

echo "Updating full_description for $DOCKERHUB_REPO ..."
patch_payload=$(README_FILE="$README_FILE" SHORT_DESCRIPTION="$SHORT_DESCRIPTION" python3 -c '
import json, os
print(json.dumps({
    "full_description": open(os.environ["README_FILE"]).read(),
    "description": os.environ["SHORT_DESCRIPTION"],
}))
')

patch_body=$(mktemp)
patch_code=$(curl -sS -o "$patch_body" -w '%{http_code}' \
  -X PATCH "https://hub.docker.com/v2/repositories/${DOCKERHUB_REPO}/" \
  -H "Authorization: JWT $token" \
  -H 'Content-Type: application/json' \
  -d "$patch_payload")

echo "PATCH status: $patch_code"
if [[ "$patch_code" -lt 200 || "$patch_code" -ge 300 ]]; then
  echo "error: update failed" >&2
  cat "$patch_body" >&2
  rm -f "$patch_body"
  exit 1
fi
rm -f "$patch_body"
echo "Done: $DOCKERHUB_REPO description updated ($readme_size bytes)."
