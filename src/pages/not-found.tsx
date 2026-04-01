import type { FC } from "hono/jsx";
import type { User } from "../middleware";
import { Layout } from "./layout";

export const NotFoundPage: FC<{ user?: User | null }> = ({ user }) => (
  <Layout user={user ?? undefined}>
    <img src="/notfound.gif" alt="Not found" class="login-gif" />
    <a href="/" class="btn btn-outline login-gif">
      Go home
    </a>
  </Layout>
);
