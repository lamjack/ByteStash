# Google sign-in, groups and registration control

## Sign in with Google

Google works through the existing OIDC support. Create an OAuth client (type **Web application**) in Google Cloud Console with the redirect URI `https://<your-host><BASE_PATH>/api/auth/oidc/callback`, then set:

```yaml
OIDC_ENABLED: "true"
OIDC_DISPLAY_NAME: "Google"
OIDC_ISSUER_URL: "https://accounts.google.com"
OIDC_CLIENT_ID: "<client id>.apps.googleusercontent.com"
OIDC_CLIENT_SECRET: "<client secret>"
OIDC_SCOPES: "openid profile email"
ADMIN_USERNAMES: "tim"          # see below
DISABLE_INTERNAL_ACCOUNTS: "false"  # "true" for Google-only login
```

A Google user's ByteStash username is the part of their email before `@`, lowercased with dots and symbols removed (`tim.chan@gmail.com` becomes `timchan`). Put that name in `ADMIN_USERNAMES` to make the account an admin. The first account ever created can always sign up.

## Closing registration

`ALLOW_NEW_ACCOUNTS` is now only the default. Admins can open or close sign-up at any time under **Admin → Users → Allow new registrations**; the choice is stored in the database. It applies to both password sign-up and Google/OIDC sign-in: with registration closed, an unknown Google account is sent back to the login page, while existing users can still sign in.

## Groups and snippet visibility

Every snippet has one of three visibilities, chosen in the edit dialog:

| Visibility | Who can view |
| --- | --- |
| Private | Only the owner |
| Public | Anyone, without signing in |
| Group only | Signed-in members of one group |

Admins manage groups under **Admin → Groups**: create, rename or delete a group, and add or remove members by username or email.

- Admins can publish to any group. Other users can publish only to groups they belong to.
- Signed-in users have a **Group** tab next to Private and Public (`/group/snippets`). It lists group-only snippets of their groups and the ones they published to a group. The Public tab shows public snippets only.
- Adding an email that has no account yet creates an **invite**. That person may sign in with Google even while registration is closed, and joins the group on first sign-in (the email must be verified by the provider).
- Deleting a group turns its snippets back to private.

## Who can edit

When a snippet is "Group only", the edit dialog expands so the owner can pick the group and who can edit it. Private and public snippets can only be edited by their owner.

| Edit permission | Who can edit |
| --- | --- |
| Only me (default) | The owner |
| Group members | The owner and members of the snippet's group. Only for group-only snippets. Members can change the title, description, categories and files; visibility, edit permission, sharing and deleting stay with the owner. |
| Locked | Nobody, including the owner. The owner can switch to another option to unlock it. |

## MCP

The MCP endpoint (`/mcp`, authenticated with an API key) follows the same rules:

- `list_snippets` takes `scope: "shared"` to list public snippets plus your groups' snippets (default `"mine"`).
- `create_snippet` / `update_snippet` take `visibility` (`private`, `public`, `protected`) and `group_id`; `is_public` still works.
- `list_groups` lists the groups you can publish to (all groups for admins).
- `create_snippet` / `update_snippet` take `edit_permission` (`owner`, `group`, `readonly`).
- `update_snippet` follows the edit permission above; `delete_snippet` only works on your own snippets.
