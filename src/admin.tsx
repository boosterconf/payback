import { Hono } from "hono";
import { config } from "./config";
import { Layout, Card } from "./pages";
import { requireUser, type Env } from "./middleware";

const admin = new Hono<Env>();

admin.use(requireUser);

admin.get("/", (c) => {
  const user = c.get("user");
  return c.html(
    <Layout>
      <Card user={user}>
        <div class="feedback">
          <img src="/admin.gif" alt="Admin" class="feedback-gif" />
          <a href={`https://vercel.com/${config.VERCEL_TEAM_SLUG}/${config.VERCEL_PROJECT_NAME}`} class="btn btn-outline feedback-btn">Vercel Dashboard</a>
          <a href={`https://console.neon.tech/app/projects/${config.NEON_PROJECT_ID}`} class="btn btn-outline feedback-btn">Neon Console</a>
        </div>
      </Card>
    </Layout>
  );
});

export default admin;
