import { Hono } from "hono";
import { config } from "./config";
import auth from "./auth";
import cron from "./cron";
import form from "./form";
import notFound from "./notFound";

const app = new Hono();

app.get("/favicon.ico", (c) => c.redirect("/favicon.svg", 301));
app.get("/admin", (c) => c.redirect(`https://console.neon.tech/app/projects/${config.NEON_PROJECT_ID}`));

app.route("/auth", auth);
app.route("/cron", cron);
app.route("/", form);

app.notFound(notFound);

export default app;
