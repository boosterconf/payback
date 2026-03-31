# Plan: Add Slack Sign-In + Rewrite GitHub OAuth

## Overview
Drop `@hono/oauth-providers` dependency. Implement both GitHub and Slack OAuth manually with the same pattern. Update User type and DB schema to support both providers.

## User Type Change

```ts
// middleware.ts
type User = {
  provider: "github" | "slack";
  providerId: string;  // GitHub numeric ID as string, or Slack user ID like "U123ABC456"
  name: string;
  avatar: string;
};
```

## Auth Rewrite (auth.tsx)

### Shared Helper
Extract a `setSession(c, user)` helper that writes the signed cookie — used by both providers.

### GitHub Flow (manual, replacing @hono/oauth-providers)
- `GET /auth/github` → redirect to `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=.../auth/github/callback&scope=read:user`
- `GET /auth/github/callback` → exchange `code` at `https://github.com/login/oauth/access_token` → fetch `https://api.github.com/user` with token → set session cookie with `{ provider: "github", providerId: String(user.id), name, avatar }`

### Slack Flow (new)
- `GET /auth/slack` → redirect to `https://slack.com/openid/connect/authorize?response_type=code&client_id=...&redirect_uri=.../auth/slack/callback&scope=openid%20profile%20email&nonce=...`
- `GET /auth/slack/callback` → exchange `code` at `https://slack.com/api/openid.connect.token` (POST, client_secret_post) → decode JWT `id_token` for `name`, `picture`, `sub` (Slack user ID) → set session cookie with `{ provider: "slack", providerId: sub, name, avatar }`

### Login Page
- Keep `GET /auth/` — show login page with both buttons
- Keep `GET /auth/logout` — clear cookie

## Config Changes (config.ts)

Add:
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`

Keep:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

## DB Schema Change (scripts/migrate.ts)

Current `user_fiken_mapping` table:
```
github_user_id INTEGER PRIMARY KEY
fiken_contact_id TEXT
```

New `user_fiken_mapping` table:
```
github_user_id INTEGER  (nullable, unique)
slack_user_id  TEXT     (nullable, unique)
fiken_contact_id INTEGER NOT NULL
```

Note: `fiken_contact_id` changes from TEXT to INTEGER.

Need a migration script or ALTER TABLE:
```sql
ALTER TABLE user_fiken_mapping ADD COLUMN slack_user_id TEXT UNIQUE;
ALTER TABLE user_fiken_mapping ALTER COLUMN fiken_contact_id TYPE INTEGER USING fiken_contact_id::integer;
ALTER TABLE user_fiken_mapping DROP CONSTRAINT user_fiken_mapping_pkey;
ALTER TABLE user_fiken_mapping ADD COLUMN id SERIAL PRIMARY KEY;
ALTER TABLE user_fiken_mapping ALTER COLUMN github_user_id DROP NOT NULL;
```

## DB Query Change (db.ts)

```ts
export async function getFikenContactId(provider: string, providerId: string): Promise<number | null> {
  const column = provider === "github" ? "github_user_id" : "slack_user_id";
  const value = provider === "github" ? Number(providerId) : providerId;
  const rows = await sql()`
    SELECT fiken_contact_id FROM user_fiken_mapping WHERE ${sql().unsafe(column)} = ${value}
  `;
  return rows.length > 0 ? (rows[0] as { fiken_contact_id: number }).fiken_contact_id : null;
}
```

Note: May need to use two separate queries instead of dynamic column to avoid SQL injection concerns with unsafe interpolation.

## Form Changes (form.tsx)

- `user.id` → `user.providerId`
- `getFikenContactId(user.id)` → `getFikenContactId(user.provider, user.providerId)`
- `data-username` on form uses `user.name` (unchanged)

## Pages Changes (pages.tsx)

LoginPage: Add "Sign in with Slack" button below GitHub button.

```tsx
<a href="/auth/github" class="btn btn-github">
  <img src="/github.svg" alt="" aria-hidden="true" />
  Sign in with GitHub
</a>
<a href="/auth/slack" class="btn btn-slack">
  <img src="/slack.svg" alt="" aria-hidden="true" />
  Sign in with Slack
</a>
```

## CSS Changes (styles.css)

Add `.btn-slack` styling (white background, dark text, matching Slack brand guidelines).

## New Assets

- `public/slack.svg` — Slack logo

## Package Changes

- Remove `@hono/oauth-providers` from dependencies

## Env Vars to Add (Vercel)

- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`

## Slack App Setup (Manual)

1. Create Slack app at https://api.slack.com/apps
2. Enable "Sign in with Slack"
3. Add redirect URL: `https://<domain>/auth/slack/callback`
4. Note client ID and secret
5. Request scopes: `openid`, `profile`, `email`

## Files Touched (Summary)

| File | Change |
|---|---|
| `src/auth.tsx` | Full rewrite — manual GitHub + Slack OAuth |
| `src/middleware.ts` | `User` type: `id: number` → `provider + providerId: string` |
| `src/config.ts` | Add `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET` |
| `src/pages.tsx` | Add Slack button to LoginPage |
| `src/db.ts` | `getFikenContactId()` accepts provider + providerId |
| `src/form.tsx` | Update `user.id` refs to `user.providerId` |
| `scripts/migrate.ts` | Add `slack_user_id` column, fix `fiken_contact_id` type |
| `public/styles.css` | Add `.btn-slack` |
| `public/slack.svg` | New file |
| `package.json` | Remove `@hono/oauth-providers` |
