import type { FC, PropsWithChildren } from "hono/jsx";
import type { User } from "./middleware";

export const Layout: FC<PropsWithChildren<{ user?: User }>> = ({ user, children }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Booster Payback</title>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <div class="container">{children}</div>
      {user && (
        <div class="user-bubble">
          <img src={user.avatar} alt="" class="avatar" />
          <span>{user.name}</span>
          <span class="user-bubble-divider" />
          <a href="/auth/logout" class="user-bubble-signout">Sign out</a>
        </div>
      )}
      <script src="/script.js" defer />
    </body>
  </html>
);

export const Card: FC<PropsWithChildren> = ({ children }) => (
  <div class="card">
    {children}
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

export const LoggedOutPage: FC = () => (
  <Layout>
    <img src="/bye.gif" alt="Bye" class="login-gif" />
    <a href="/auth" class="btn btn-outline login-gif">Sign in again</a>
  </Layout>
);

export const UnauthorizedPage: FC = () => (
  <Layout>
    <img src="/nope.gif" alt="Nope" class="login-gif" />
    <p class="text-muted" style="margin-bottom: 1rem; text-align: center;">You're not on the list. Ask for access in <a href="https://boosterconf.slack.com/archives/C20BUHH1V">#penger</a>.</p>
    <a href="/auth" class="btn btn-outline login-gif">Try again</a>
  </Layout>
);

export const FormPage: FC<{
  user: User;
  relatedToOptions: ReadonlyArray<{ id: string; name: string }>;
  expenseTypes: ReadonlyArray<{ id: string; name: string }>;
}> = ({ user, relatedToOptions, expenseTypes }) => (
  <Layout user={user}>
    <Card>
      <div class="card-header">
        <h1>Submit Receipt</h1>
        <p class="text-muted">Upload a receipt to get reimbursed for expenses. If you paid with a Booster VISA card then ignore this and e-mail the reciept to <a href="mailto:foreningen-boosterkonferansen@bilag.fiken.no">foreningen-boosterkonferansen@bilag.fiken.no</a>.</p>
      </div>

      <form id="receipt-form" data-username={user.name}>
        <div class="form-group">
          <label for="related-to">Related to</label>
          <select id="related-to" name="relatedTo" required>
            <option value="" disabled selected>
              Select…
            </option>
            {relatedToOptions.map((s) => (
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
  <Layout user={user}>
    <img src="/powerball.gif" alt="Money" class="login-gif" />
    <a href="/" class="btn btn-outline login-gif">
      Submit another
    </a>
  </Layout>
);

export const NotFoundPage: FC<{ user?: User | null }> = ({ user }) => (
  <Layout user={user ?? undefined}>
    <img src="/notfound.gif" alt="Not found" class="login-gif" />
    <a href="/" class="btn btn-outline login-gif">
      Go home
    </a>
  </Layout>
);

export const ErrorPage: FC<{ message: string; user?: User }> = ({ message, user }) => (
  <Layout user={user}>
    <img src="/error.gif" alt="Error" class="login-gif" />
    <p class="text-muted" style="margin-bottom: 1rem; text-align: center;">{message}</p>
    <a href="/" class="btn btn-outline login-gif">
      Try again
    </a>
  </Layout>
);
