import type { FC, PropsWithChildren } from "hono/jsx";

export const Layout: FC<PropsWithChildren> = ({ children }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Booster Payback</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <div class="container">{children}</div>
      <script src="/script.js" defer />
    </body>
  </html>
);

export const LoginPage: FC = () => (
  <Layout>
    <a href="/auth/login" class="btn btn-github">
      <img src="/github.svg" alt="" aria-hidden="true" />
      Sign in with GitHub
    </a>
  </Layout>
);

export const FormPage: FC<{
  user: string;
  projects: ReadonlyArray<{ id: string; name: string }>;
  error?: string;
}> = ({ user, projects, error }) => (
  <Layout>
    <div class="card">
      <div class="card-header">
        <h1>Submit Receipt</h1>
        <div class="card-header-actions">
          <span class="text-muted">{user}</span>
          <a href="/auth/logout" class="btn btn-ghost btn-sm">
            Sign out
          </a>
        </div>
      </div>

      {error && <p class="error-text">{error}</p>}

      <form method="post" action="/submit" enctype="multipart/form-data">
        <div class="form-group">
          <label for="project">Project</label>
          <select id="project" name="project" required>
            <option value="" disabled selected>
              Select a project…
            </option>
            {projects.map((p) => (
              <option value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="What was the expense for?"
            maxlength={150}
            required
          />
        </div>

        <div class="form-group">
          <label for="receipt">Receipt</label>
          <input
            id="receipt"
            name="receipt"
            type="file"
            accept=".jpg,.jpeg,.png,.heic,.pdf"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block">
          Submit receipt
        </button>
      </form>
    </div>
  </Layout>
);

export const SuccessPage: FC = () => (
  <Layout>
    <div class="card">
      <div class="feedback">
        <div class="feedback-icon feedback-icon--success">✓</div>
        <h2>Receipt submitted</h2>
        <p>Your receipt has been submitted successfully.</p>
        <a href="/" class="btn btn-outline">
          Submit another
        </a>
      </div>
    </div>
  </Layout>
);

export const ErrorPage: FC<{ message: string }> = ({ message }) => (
  <Layout>
    <div class="card">
      <div class="feedback">
        <div class="feedback-icon feedback-icon--error">!</div>
        <h2>Something went wrong</h2>
        <p>{message}</p>
        <a href="/" class="btn btn-outline">
          Try again
        </a>
      </div>
    </div>
  </Layout>
);
