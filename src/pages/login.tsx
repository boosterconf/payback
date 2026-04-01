import type { FC } from "hono/jsx";
import { Layout } from "./layout";

export const LoginPage: FC = () => (
  <Layout>
    <img src="/money.gif" alt="Money" class="login-gif" />
    <a href="/auth/login" class="btn btn-github">
      <img src="/github.svg" alt="" aria-hidden="true" />
      Sign in with GitHub
    </a>
  </Layout>
);
