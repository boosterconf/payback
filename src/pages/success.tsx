import type { FC } from "hono/jsx";
import type { User } from "../types";
import { Layout } from "./layout";

export const SuccessPage: FC<{ user: User }> = ({ user }) => (
  <Layout user={user}>
    <img src="/powerball.gif" alt="Money" />
    <a href="/" class="btn btn-outline">
      Submit another
    </a>
  </Layout>
);
