import type { FC, PropsWithChildren } from "hono/jsx";
import type { User } from "./middleware";

export const Layout: FC<PropsWithChildren> = ({ children }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Booster Payback</title>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="preload" href="/powerball.gif" as="image" />
      <link rel="preload" href="/money.gif" as="image" />
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <div class="container">{children}</div>
      <script src="/script.js" defer />
    </body>
  </html>
);

const Card: FC<PropsWithChildren<{ user?: User }>> = ({ user, children }) => (
  <div class="card">
    {children}
    {user && (
      <div class="card-footer">
        <div class="user-info">
          <img src={user.avatar} alt="" class="avatar" />
          <span class="text-muted">{user.name}</span>
        </div>
        <a href="/auth/logout" class="btn btn-ghost btn-sm">
          Sign out
        </a>
      </div>
    )}
  </div>
);

export const LoginPage: FC = () => (
  <Layout>
    <img src="/money.gif" alt="Money" class="login-gif" />
    <a href="/auth/login" class="btn btn-github">
      <img src="/github.svg" alt="" aria-hidden="true" />
      Sign in with GitHub
    </a>
  </Layout>
);

export const FormPage: FC<{
  user: User;
  sections: ReadonlyArray<{ id: string; name: string }>;
  expenseTypes: ReadonlyArray<{ id: string; name: string }>;
}> = ({ user, sections, expenseTypes }) => (
  <Layout>
    <Card user={user}>
      <div class="card-header">
        <h1>Submit Receipt</h1>
        <p class="text-muted">Upload a receipt to get reimbursed for expenses. If you paid with a Booster VISA card then ignore this and e-mail the reciept to <a href="mailto:foreningen-boosterkonferansen@bilag.fiken.no">foreningen-boosterkonferansen@bilag.fiken.no</a>.</p>
      </div>

      <form method="post" action="/submit" enctype="multipart/form-data">
        <div class="form-group">
          <label for="section">Section</label>
          <select id="section" name="section" required>
            <option value="" disabled selected>
              Select a section…
            </option>
            {sections.map((s) => (
              <option value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div class="form-group">
          <label for="expense-type">Expense type</label>
          <select id="expense-type" name="expenseType" required>
            <option value="" disabled selected>
              Select an expense type…
            </option>
            {expenseTypes.map((t) => (
              <option value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="What was the expense for? (optional)"
            maxlength={150}
          />
        </div>

        <div class="form-group">
          <label for="receipt">Receipt</label>
          <input
            id="receipt"
            name="receipt"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block">
          Submit receipt
        </button>
      </form>
    </Card>
  </Layout>
);

export const SuccessPage: FC<{ user: User }> = ({ user }) => (
  <Layout>
    <Card user={user}>
      <div class="feedback">
        <img src="/powerball.gif" alt="Money" class="feedback-gif" />
        <a href="/" class="btn btn-outline feedback-btn">
          Submit another
        </a>
      </div>
    </Card>
  </Layout>
);

export const NotFoundPage: FC = () => (
  <Layout>
    <img src="/notfound.gif" alt="Not found" class="login-gif" />
    <a href="/" class="btn btn-outline" style="max-width:250px;width:100%">
      Go home
    </a>
  </Layout>
);

export const ErrorPage: FC<{ message: string; user?: User }> = ({ message, user }) => (
  <Layout>
    <Card user={user}>
      <div class="feedback">
        <div class="feedback-icon feedback-icon--error">!</div>
        <h2>Something went wrong</h2>
        <p>{message}</p>
        <a href="/" class="btn btn-outline">
          Try again
        </a>
      </div>
    </Card>
  </Layout>
);
