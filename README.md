# Booster Payback

Receipt submission app for Booster conferences.

## Setup

```sh
cp .env.example .env.local  # fill in values
bun install
bunx --bun vercel dev
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `GITHUB_CLIENT_ID` | GitHub App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub App client secret |
| `COOKIE_SECRET` | Cookie signing secret (`openssl rand -base64 32`) |
