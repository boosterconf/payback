import app from "./server";
import { serveStatic } from "hono/bun";

app.use("/*", serveStatic({ root: "./public" }));

export default {
  port: 3000,
  fetch: app.fetch,
};
