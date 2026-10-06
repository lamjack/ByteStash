# ByteStash

A self-hosted code snippet manager with a React web UI, REST API, and MCP server.

This image is built from the fork https://github.com/lamjack/ByteStash (upstream: https://github.com/jordan-dalby/ByteStash).

![ByteStash screenshot](https://raw.githubusercontent.com/jordan-dalby/ByteStash/refs/heads/main/media/app-image.png)

## Tags

- `latest` — most recent stable build
- `<semver>` — release builds, e.g. `1.0.1`
- `<YYYY.MM.DD>` — dated builds, e.g. `2026.10.06`

Platforms: `linux/amd64`, `linux/arm64`.

## Quick start

```bash
docker run -d --name bytestash -p 5000:5000 -v /your/snippet/path:/data/snippets -e JWT_SECRET=change-me wizmacaucom/bytestash:latest
```

Then open http://localhost:5000/ and create an account.

## Docker Compose

```yaml
services:
  bytestash:
    image: "wizmacaucom/bytestash:latest"
    restart: always
    volumes:
      - /your/snippet/path:/data/snippets
    ports:
      - "5000:5000"
    environment:
      # See https://github.com/jordan-dalby/ByteStash/wiki/FAQ#environment-variables
      BASE_PATH: ""
      JWT_SECRET: your-secret
      TOKEN_EXPIRY: 24h
      ALLOW_NEW_ACCOUNTS: "true"
      DEBUG: "true"
      DISABLE_ACCOUNTS: "false"
      DISABLE_INTERNAL_ACCOUNTS: "false"

      # See https://github.com/jordan-dalby/ByteStash/wiki/Single-Sign%E2%80%90on-Setup for more info
      OIDC_ENABLED: "false"
      OIDC_DISPLAY_NAME: ""
      OIDC_ISSUER_URL: ""
      OIDC_CLIENT_ID: ""
      OIDC_CLIENT_SECRET: ""
      OIDC_SCOPES: ""
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `your-secret-key` | Secret used to sign JWT auth tokens. Set a strong value in production. |
| `JWT_SECRET_FILE` | unset | Path to a file containing the JWT secret; overrides `JWT_SECRET` when set. |
| `TOKEN_EXPIRY` | `24h` | JWT token lifetime. |
| `ALLOW_NEW_ACCOUNTS` | `false` | Allow registration of new accounts when set to `true`. |
| `ALLOW_PASSWORD_CHANGES` | `false` | Allow users to change their password when set to `true`. |
| `DISABLE_ACCOUNTS` | `false` | Disable account login entirely when set to `true`. |
| `DISABLE_INTERNAL_ACCOUNTS` | `false` | Disable local username/password accounts (e.g. when using OIDC only). |
| `ADMIN_USERNAMES` | unset | Comma-separated list of usernames granted admin rights. |
| `BASE_PATH` | `` (empty) | URL path prefix the app is served under, e.g. `/bytestash`. |
| `DEBUG` | `false` | Enable debug logging when set to `true`. |
| `OIDC_ENABLED` | `false` | Enable OpenID Connect single sign-on when set to `true`. |
| `OIDC_DISPLAY_NAME` | `Single Sign-On` | Label shown on the SSO login button. |
| `OIDC_ISSUER_URL` | unset | OIDC issuer/discovery URL. |
| `OIDC_CLIENT_ID` | unset | OIDC client ID. |
| `OIDC_CLIENT_SECRET` | unset | OIDC client secret. |
| `OIDC_SCOPES` | `openid profile email` | Space-separated OIDC scopes. |

## Volumes

- `/data/snippets` — SQLite database and all persistent data.

## API and MCP

- REST API with Swagger UI at `/api-docs` (or `<BASE_PATH>/api-docs` when `BASE_PATH` is set).
- MCP server endpoint at `/mcp` (or `<BASE_PATH>/mcp`), authenticated with an API key generated in the app (passed as `x-api-key` header or `key` query parameter). Connect a client to `<base-url>/mcp`.
- Documentation wiki: https://github.com/jordan-dalby/ByteStash/wiki

## Source and license

- Source (fork): https://github.com/lamjack/ByteStash
- Upstream: https://github.com/jordan-dalby/ByteStash
- License: GPL-3.0
