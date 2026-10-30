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
| Shared | Signed-in groups and people the owner picks |

Admins manage groups under **Admin → Groups**: create, rename or delete a group, and add or remove members by username or email.

- Picking **Shared** expands a "Share with" box. Type to add any number of groups and people (people are matched by username). Each one is set to **Can view** or **Can edit**.
- Admins can share with any group. Other users can share only with groups they belong to, and with any person.
- Signed-in users have a **Shared** tab next to Private and Public (`/group/snippets`). It lists snippets shared with them, directly or through a group, and the ones they share. The Public tab shows public snippets only.
- Adding an email that has no account yet creates an **invite**. That person may sign in with Google even while registration is closed, and joins the group on first sign-in (the email must be verified by the provider).
- Deleting a group or user removes their shares. A snippet left with nobody to share with becomes private.
- Making a snippet public or private removes its shares.

Shares are stored in the `snippet_shares` table (one row per group or user, with `view` or `edit`). Upgrading migrates each existing group-only snippet to a share with its group: **Can edit** if it used the old "Group members" edit option, otherwise **Can view**.

## Who can edit

| Who | Can edit the content |
| --- | --- |
| Owner | Yes, unless the snippet is locked |
| Groups and people with **Can edit** | Yes, unless the snippet is locked. They change the title, description, categories and files; visibility, sharing, locking and deleting stay with the owner. |
| Groups and people with **Can view** | No |

**Lock editing** (in the Shared box) stops everyone, the owner included, from editing until the owner unticks it.

## MCP

The MCP endpoint (`/mcp`, authenticated with an API key) follows the same rules:

- `list_snippets` takes `scope: "shared"` to list public snippets plus snippets shared with you (default `"mine"`).
- `create_snippet` / `update_snippet` take `visibility` (`private`, `public`, `protected`) and `share_with`, a list of `{ "type": "group" | "user", "id" or "username", "permission": "view" | "edit" }`. On update, `share_with` replaces the list; leave it out to keep the current shares. `is_public` and a single `group_id` still work.
- `list_groups` lists the groups you can share with (all groups for admins); `find_users` finds people by username.
- `edit_permission` is `owner` (default) or `readonly` (locked).
- `update_snippet` follows the rules above; `delete_snippet` only works on your own snippets.
