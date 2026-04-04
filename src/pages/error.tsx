import type { FC } from "hono/jsx";
import type { User } from "../types";
import { Layout } from "./layout";

export const ErrorPage: FC<{ message?: string; user?: User }> = ({ message, user }) => (
  <Layout user={user}>
    <img src="/error.gif" alt="Error" />
    <p class="text-muted">{message || "Something went wrong."}</p>
    <a href="/" class="btn btn-outline">
      Try again
    </a>
  </Layout>
);
