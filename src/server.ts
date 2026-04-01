import { Hono } from "hono";
import admin from "./routes/admin";
import auth from "./routes/auth";
import cron from "./routes/cron";
import form from "./routes/form";
import notFound from "./routes/not-found";

const app = new Hono();

app.get("/favicon.ico", (c) => c.redirect("/favicon.svg", 301));

app.route("/admin", admin);
app.route("/auth", auth);
app.route("/cron", cron);
app.route("/", form);

app.notFound(notFound);

export default app;
