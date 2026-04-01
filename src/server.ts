import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import admin from "./routes/admin";
import auth from "./routes/auth";
import cron from "./routes/cron";
import form from "./routes/form";
import notFound from "./routes/not-found";

const app = new Hono();

// Ignored on Vercel — static assets are served from public/ via CDN
app.use("/*", serveStatic({ root: "./public" }));

app.get("/favicon.ico", (c) => c.redirect("/favicon.svg", 301));

app.route("/admin", admin);
app.route("/auth", auth);
app.route("/cron", cron);
app.route("/", form);

app.notFound(notFound);

export default app;
