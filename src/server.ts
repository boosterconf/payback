import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { admin, auth, cron, form } from "./routes";
import { notFound, onError } from "./middleware";

const app = new Hono();

// Ignored on Vercel — static assets are served from public/ via CDN
app.use("/*", serveStatic({ root: "./public" }));

app.get("/favicon.ico", (c) => c.redirect("/favicon.svg", 301));

app.route("/admin", admin);
app.route("/auth", auth);
app.route("/cron", cron);
app.route("/", form);

app.notFound(notFound);
app.onError(onError);

export default app;
