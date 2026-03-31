import { Hono } from "hono";
import admin from "./admin";
import auth from "./auth";
import cron from "./cron";
import form from "./form";
import notFound from "./notFound";

const app = new Hono();

app.get("/favicon.ico", (c) => c.redirect("/favicon.svg", 301));

app.route("/admin", admin);
app.route("/auth", auth);
app.route("/cron", cron);
app.route("/", form);

app.notFound(notFound);

export default app;
