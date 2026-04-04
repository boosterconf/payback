import type { FC } from "hono/jsx";
import { Layout } from "./layout";

export const LoggedOutPage: FC = () => (
  <Layout>
    <img src="/bye.gif" alt="Bye" />
    <a href="/auth" class="btn btn-outline">Sign in again</a>
  </Layout>
);
