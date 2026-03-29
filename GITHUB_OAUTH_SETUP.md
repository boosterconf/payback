# GitHub OAuth App Setup

You need a **separate GitHub OAuth App** for each environment, because the callback URL must match exactly.

## Environments

| Environment | Base URL | Branch |
|-------------|----------|--------|
| Local | `http://localhost:3000` | — |
| Staging | `https://<project>-<branch>-<team>.vercel.app` (or custom alias) | `staging` / preview |
| Production | `https://your-domain.vercel.app` | `main` |

> **Tip:** Vercel gives each branch a stable preview URL like `<project>-git-<branch>-<team>.vercel.app`. You can also assign a custom domain to preview deployments in your project settings.

## 1. Create an OAuth App (repeat per environment)

1. Go to https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** `Booster Payback (<env>)` — e.g. `Booster Payback (local)`
   - **Homepage URL:** the base URL for that environment
   - **Authorization callback URL:** `<base URL>/auth/login`
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"** and copy it immediately (shown once)

## 2. Set environment variables

Each environment needs these four variables:

```
GITHUB_ID=<client id for that environment>
GITHUB_SECRET=<client secret for that environment>
COOKIE_SECRET=<run: openssl rand -base64 32>
GITHUB_ORG=boosterconf
```

### Local development

Add to `.env.local` (gitignored):

```
GITHUB_ID=<local app client id>
GITHUB_SECRET=<local app client secret>
COOKIE_SECRET=<any random string>
GITHUB_ORG=boosterconf
```

Callback URL: `http://localhost:3000/auth/login`

### Staging / Preview

In Vercel project settings (Settings → Environment Variables), set the variables for the **Preview** environment. Use the credentials from the staging OAuth App.

Callback URL: `https://<your-preview-url>/auth/login`

### Production

In Vercel project settings, set the variables for the **Production** environment. Use the credentials from the production OAuth App.

Callback URL: `https://your-domain.vercel.app/auth/login`
