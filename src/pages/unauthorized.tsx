import type { FC } from "hono/jsx";
import { Layout } from "./layout";

export const UnauthorizedPage: FC = () => (
  <Layout>
    <img src="/nope.gif" alt="Nope" class="login-gif" />
    <p class="text-muted" style="margin-bottom: 1rem; text-align: center;">You're not on the list. Ask for access in <a href="https://boosterconf.slack.com/archives/C20BUHH1V">#penger</a>.</p>
    <a href="/auth" class="btn btn-outline login-gif">Try again</a>
  </Layout>
);
