# Booster Payback

Receipt submission app for Booster conferences.

## Local development

**Prerequisites:** [Bun](https://bun.sh), [Vercel CLI](https://vercel.com/docs/cli)

First, log in to Vercel and link the project (one-time setup):

```sh
vercel login
vercel link
```

Then install dependencies and start the dev server:

```sh
bun install
bun run dev
```

`bun run dev` will:
1. Pull environment variables from Vercel into `.env.local`
2. Build the Vercel Blob client
3. Start the server with hot reload at `http://localhost:3000`

Local development bypasses Slack login and signs you in automatically as a hardcoded dev user. Slack OAuth doesn't support `http` on `localhost` callback URLs, unlike sensible companies.

Environment variables are managed via Vercel. After linking the project (`vercel link`), `bun run dev` pulls them automatically.
