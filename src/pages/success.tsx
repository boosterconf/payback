import type { FC } from "hono/jsx";
import type { User } from "../types";
import { Layout } from "./layout";

export const SuccessPage: FC<{ user: User }> = ({ user }) => (
  <Layout user={user}>
    <img src="/powerball.gif" alt="Money" class="login-gif" />
    <a href="/" class="btn btn-outline login-gif">
      Submit another
    </a>
  </Layout>
);
