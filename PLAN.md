# Plan: Receipt Submission Web App

## TL;DR
Vercel CDN serves the React SPA. Hono API (`src/server.ts`) handles GitHub OAuth and `POST /api/submit`. SPA boots → checks `/api/auth/me` → shows "Sign in with GitHub" or the receipt form. Two local dev modes: `bun run dev` (frontend-only, HMR, all API calls auto-mocked) and `vercel dev` (full-stack with Hono). Fiken integration later.

## Principles
- **Readability over performance.** Favor clear, obvious code. No clever tricks, no premature optimization.

## Tech Stack
- **Server:** Hono (auth API + submit endpoint only — no HTML serving)
- **Runtime/PM:** Bun
- **Frontend:** React 19 + TypeScript, served by Vercel CDN
- **UI:** Hand-crafted CSS with GitHub/shadcn aesthetic (CSS variables, no framework)
- **Auth:** `@hono/oauth-providers` for GitHub OAuth flow + signed cookie (`hono/cookie`) for session. SPA checks auth via `GET /api/auth/me`.
- **File upload:** react-dropzone with FileReader preview
- **Hosting:** Vercel (CDN for SPA + serverless Hono function for API)
- **No meta-framework, no ESLint, no database**

## Project Structure
```
├── src/
│   ├── server.ts             ← Hono app (auth routes + submit, Vercel auto-detected)
│   └── client/
│       ├── index.html       ← SPA shell (entry for both dev and prod build)
│       ├── main.tsx         ← React root mount
│       ├── App.tsx          ← Main component (login/form/success/error)
│       ├── api.ts           ← API calls — auto-mocked when no backend
│       ├── styles.css       ← GitHub/shadcn-inspired CSS (variables + styles)
│       ├── lib/
│       │   └── projects.ts  ← Hardcoded project list
│       └── components/
│           └── receipt-dropzone.tsx
├── public/                  ← Built SPA (gitignored, served by Vercel CDN)
├── tsconfig.json
├── vercel.json
├── .env.example
├── .env.local               ← Local env vars (gitignored)
├── .gitignore
└── package.json
```

## Dev vs Prod

| | `bun run dev` | `vercel dev` | **Production** |
|---|---|---|---|
| **Frontend** | Bun dev server + HMR | Built to `public/`, served by Vercel dev server | Built to `public/`, served by Vercel CDN |
| **Auth** | Mocked — `/api/auth/me` fails → skip to form | Hono (`BYPASS_AUTH=true` or real GitHub) | Hono + GitHub OAuth |
| **Submit** | Mocked — `/api/submit` fails → fake success | Real `POST /api/submit` to Hono | Real `POST /api/submit` to Hono |
| **Use for** | UI development | Integration testing | Production |

## Steps

### Phase 1: Project Setup
1. `bun add hono @hono/oauth-providers react react-dom react-dropzone` + `bun add -d @types/react @types/react-dom`
2. Configure `tsconfig.json` — JSX, DOM lib, strict
3. Create `.gitignore` — `public/`, `node_modules/`, `.env*`, `.vercel/`
4. Create `src/client/index.html` — SPA shell (`<div id="root">`, `<script src="./main.tsx">`, `<link href="./styles.css">`)
6. Create `src/client/styles.css` — GitHub/shadcn-inspired CSS:
    - CSS variables at `:root`: neutral grays (shadcn zinc), radius, ring, shadows
    - System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", ...`)
    - Color tokens: `--background`, `--foreground`, `--muted`, `--border`, `--input`, `--ring`, `--primary`, `--destructive`, `--success`
    - Dark mode via `@media (prefers-color-scheme: dark)` overriding same variables
    - Styles: reset, centered layout, card, form inputs, dropzone, buttons, login, success/error, spinner
7. Create `package.json` scripts:
    - `"dev": "bun src/client/index.html"` — frontend-only, Bun dev server + HMR
    - `"build": "bun build src/client/index.html --outdir public --minify"` — build SPA to `public/`

### Phase 2: UI (develop with `bun run dev`)
8. Create `src/client/main.tsx` — `createRoot(...).render(<App />)`
9. Create `src/client/api.ts`:
    - `checkAuth(): Promise<{name: string} | null>` — `fetch('/api/auth/me')`. If 200 → return user. If 401 → return `null`. If fetch fails (no backend) → return `{ name: 'dev' }` (mock).
    - `submitReceipt(formData: FormData): Promise<{success: boolean}>` — `fetch('/api/submit', ...)`. If response ok → return JSON. If fetch fails (no backend) → `await sleep(500); return { success: true }` (mock).
    - Works automatically: with backend → real API. Without backend → mocked.
10. Create `src/client/App.tsx`:
    - `user` state: `undefined` (loading) | `null` (not authenticated) | `{name}`
    - `view` state: `form` | `success` | `error`
    - On mount: call `checkAuth()` → set `user`
    - **Loading** (`user === undefined`): brief spinner
    - **Login** (`user === null`): centered card with "Sign in with GitHub" button → navigates to `/api/auth/login`
    - **Form** (`user` exists): card with project select + description input (max 150 chars) + receipt dropzone + submit button. Header shows user name + sign out link (`/api/auth/logout`).
    - **Access denied**: on mount, checks `?error=access-denied` URL param → shows error view. Cleans URL with `replaceState`.
    - **Success**: checkmark + "Submit another" button
    - **Error**: error message + "Try again" button
11. Create `src/client/lib/projects.ts` — hardcoded `{ id: string, name: string }[]`
12. Create `src/client/components/receipt-dropzone.tsx` — react-dropzone, image preview, PDF filename

### Phase 3: Hono API
14. Create `src/server.ts`:
    - `app.basePath('/api')` — all routes prefixed with `/api`
    - `GET /api/auth/me` — reads signed cookie. If valid → return `{ name }`. If `BYPASS_AUTH=true` → return `{ name: "dev" }`. Otherwise → 401.
    - `GET /api/auth/login` — uses `githubAuth()` middleware from `@hono/oauth-providers/github`. First visit → redirects to GitHub. GitHub redirects back with code → middleware exchanges code + fetches user → handler runs. Handler checks org membership via `GET /user/memberships/orgs/{org}` using the token from `c.get('token')`. If denied → redirects to `/?error=access-denied`. If ok → sets signed session cookie with user name from `c.get('user-github')`, redirects to `/`.
    - `GET /api/auth/logout` — delete cookie, redirect to `/`
    - `POST /api/submit` — check signed cookie (or `BYPASS_AUTH`), parse multipart, validate, noop `console.log`, return `{ success: true }`
    - `export default app` — Vercel auto-detects Hono at `src/server.ts`

### Phase 4: Deploy Config
15. Create `vercel.json`:
    ```json
    {
      "buildCommand": "bun run build"
    }
    ```
    Vercel auto-detects Hono at `src/server.ts` and routes to it. `public/` served by CDN.
16. Create `.env.example`

## Relevant Files
- `src/server.ts` — Hono app (auth routes + submit, Vercel auto-detected)
- `src/client/index.html` — SPA shell (used by both `bun run dev` and `bun run build`)
- `src/client/main.tsx` — React entry
- `src/client/App.tsx` — Main component (login/form/success/error)
- `src/client/api.ts` — `checkAuth()` + `submitReceipt()` — auto-mocked when no backend
- `src/client/styles.css` — GitHub/shadcn-inspired CSS
- `src/client/lib/projects.ts` — Hardcoded project list
- `src/client/components/receipt-dropzone.tsx` — File upload with preview
- `vercel.json` — Vercel config (build command only)
- `.env.example` — Env var template
- `.env.local` — Local env vars (gitignored, `BYPASS_AUTH=true`)

## Verification

### Frontend-only (`bun run dev`)
1. `bun run dev` starts Bun dev server with HMR
2. Auth check fails → mock user → form renders directly
3. Editing React/CSS triggers instant browser update
4. Submit → mocked → success state

### Full-stack (`vercel dev`)
5. `bun run build` then `vercel dev`
6. With `BYPASS_AUTH=true`: `/api/auth/me` returns `{ name: "dev" }` → form loads
7. Without bypass: `/api/auth/me` returns 401 → "Sign in with GitHub" button → login flow
8. GitHub login works (org check, rejection for non-members)
9. Submit → server logs data → success state
10. Sign out works

### Production
11. `vercel deploy` succeeds
12. Visit `/` → CDN serves SPA → auth check → login button or form
13. Full login → submit → success flow works

## Decisions
- **Readability over performance** — favor clear, obvious code everywhere. No clever tricks, no premature optimization, no micro-optimizations.
- **CDN-first architecture** — Vercel CDN serves the entire SPA (HTML + JS + CSS). Hono is a pure API server — no HTML serving, no rewrites for `/`, no `serveStatic`. Clean separation: CDN = frontend, `/api/*` = backend.
- **SPA-driven auth** — SPA calls `GET /api/auth/me` on mount. If 401 → shows "Sign in with GitHub" button. If authenticated → shows form. Users see a brief spinner then either a login button or the form.
- **"Sign in with GitHub" button** — explicit user action, not an auto-redirect. Button navigates to `/api/auth/login` which redirects to GitHub OAuth.
- **`@hono/oauth-providers`** — `githubAuth()` middleware handles the full OAuth flow (state, redirect, code exchange, user fetch) in a single route. No manual `/auth/callback`. Handler only needs org check + set session cookie.
- **`src/server.ts` convention** — Vercel auto-detects Hono at `src/server.ts`. No `api/` directory, no `handle()` wrapper, no rewrites. Just `export default app`.
- **Two dev modes** — `bun run dev` for UI work (Bun dev server, HMR, all API auto-mocked). `vercel dev` for integration testing (full Hono, auth, real submit). Production on Vercel CDN.
- **Auto-mocking `api.ts`** — `checkAuth()` and `submitReceipt()` try real API calls. If fetch fails (no backend running), they return mock data. No build flags, no env vars — works automatically.
- **Same `index.html` everywhere** — `src/client/index.html` is the entry for both `bun run dev` (Bun resolves it at dev time) and `build.ts` (outputs to `public/`). One source of truth.
- **`/api/*` prefix** — all Hono routes under `/api/` via `app.basePath('/api')`. Vercel auto-detects the Hono app at `src/server.ts` — no rewrites, no `api/` directory, no `handle()` wrapper.
- **Signed cookies (`hono/cookie`)** — `setSignedCookie` / `getSignedCookie` with HMAC SHA-256. Stores `{name}` as JSON. No JWT. Cookie `maxAge` handles expiry. `deleteCookie` for logout.
- **`BYPASS_AUTH=true`** — `/api/auth/me` returns fake user, `/api/submit` skips cookie check. For `vercel dev` without GitHub OAuth setup.
- **Org membership check** — after `githubAuth()` completes, handler uses `c.get('token')` to call `GET /user/memberships/orgs/{org}`. Rejects non-members with redirect to `/?error=access-denied` (SPA handles display).
- **`Bun.build()` with HTML entry** — builds `src/client/index.html` → `public/` (HTML + JS + CSS). Bun resolves `<script>` and `<link>` tags.
- **Hand-crafted CSS, GitHub/shadcn aesthetic** — CSS variables with shadcn zinc palette, system font stack, subtle borders + shadows, focus rings, auto dark mode via `prefers-color-scheme`. No Tailwind, no framework.
- **No client-side routing** — single page, states managed with `useState`.
- **Noop API** — `POST /api/submit` logs and returns success. Fiken integration deferred.
- **File types:** JPEG, PNG, HEIC, PDF. Single file per submission.

## Fiken Integration (Deferred)

[Fiken](https://fiken.no) is a Norwegian cloud accounting platform. The goal is to submit receipts as **purchase drafts** via their API, so the accountant can review and approve them.

**API overview:**
- Base URL: `https://api.fiken.no/api/v2`
- Auth: Bearer token (personal API token from Fiken settings)
- Docs: https://api.fiken.no/api/v2/docs

**Two-step submission flow:**
1. **Create purchase draft:** `POST /companies/{slug}/purchases/drafts`
   - Body: `{ cash: false, invoiceIssueDate: "yyyy-MM-dd", dueDate: "yyyy-MM-dd", currency: "NOK", lines: [{ text, vatType, grossAmount, incomeAccount }], projectId }`
   - Amounts in cents (øre): 150 NOK → `15000`
   - `vatType`: e.g. `"HIGH"` (25%), `"MEDIUM"` (15%), `"LOW"` (12%), `"EXEMPT"`, `"OUTSIDE"`, `"NONE"`
   - `incomeAccount`: 4-digit Norwegian standard chart of accounts code (e.g. `7140` for travel expenses)
   - Returns `Location` header with draft URL including draft ID
2. **Attach receipt file:** `POST /companies/{slug}/purchases/drafts/{draftId}/attachments`
   - Multipart: `filename` + `attachFile` (the receipt image/PDF)

**Rate limits:** Max 1 concurrent request, max 4 requests/second.

**What the form will need (when integrated):**
- Amount field (currently missing from form — add later)
- VAT type could be a dropdown or hardcoded default (`HIGH` for most expenses)
- Account code could be derived from project or hardcoded
- Dates: invoice date (receipt date) + due date (same or +30 days)

**What stays as-is:**
- Project → maps to Fiken `projectId` (could later fetch project list from `GET /companies/{slug}/projects`)
- Description → maps to `lines[0].text`
- Receipt file → attachment upload

## Future Considerations
1. Add amount + VAT type fields to form when Fiken integration is built.
2. Fetch project list from Fiken API (`GET /companies/{slug}/projects`) instead of hardcoding.
3. Handle Fiken rate limits (queue/retry with backoff).
4. Consider Fiken webhook or polling to show draft approval status.
