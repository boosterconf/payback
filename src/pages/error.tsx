import type { FC } from "hono/jsx";
import type { User } from "../middleware";
import { Layout } from "./layout";

export const ErrorPage: FC<{ message: string; user?: User }> = ({ message, user }) => (
  <Layout user={user}>
    <img src="/error.gif" alt="Error" class="login-gif" />
    <p class="text-muted" style="margin-bottom: 1rem; text-align: center;">{message}</p>
    <a href="/" class="btn btn-outline login-gif">
      Try again
    </a>
  </Layout>
);
