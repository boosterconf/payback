import { Hono } from "hono";
import { config } from "./config";
import { Layout } from "./pages";
import { requireUser, type Env } from "./middleware";

const admin = new Hono<Env>();

admin.use(requireUser);

admin.get("/", (c) => {
  const user = c.get("user");
  return c.html(
    <Layout user={user}>
      <img src="/admin.gif" alt="Admin" class="login-gif" />
      <a href={`https://vercel.com/${config.VERCEL_TEAM_SLUG}/${config.VERCEL_PROJECT_NAME}`} class="btn btn-outline login-gif">Vercel Dashboard</a>
      <a href={`https://console.neon.tech/app/projects/${config.NEON_PROJECT_ID}`} class="btn btn-outline login-gif">Neon Console</a>
    </Layout>
  );
});

export default admin;
