import type { FC } from "hono/jsx";
import { Layout } from "./layout";

export const LoggedOutPage: FC = () => (
  <Layout>
    <img src="/bye.gif" alt="Bye" class="login-gif" />
    <a href="/auth" class="btn btn-outline login-gif">Sign in again</a>
  </Layout>
);
