import { Hono } from "hono";
import auth from "./auth";
import form from "./form";
import { notFound } from "./notFound";

const app = new Hono();

app.route("/auth", auth);
app.route("/", form);

app.notFound(notFound);

export default app;
