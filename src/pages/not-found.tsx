import type { FC } from "hono/jsx";
import type { User } from "../types";
import { Layout } from "./layout";

export const NotFoundPage: FC<{ user?: User }> = ({ user }) => (
  <Layout user={user}>
    <img src="/notfound.gif" alt="Not found" />
    <a href="/" class="btn btn-outline">
      Go home
    </a>
  </Layout>
);
