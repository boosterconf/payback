import { HTTPException } from "hono/http-exception";
import type { ErrorHandler } from "hono";
import { ErrorPage } from "../pages";

export const onError: ErrorHandler = (err, c) => {
  const status = err instanceof HTTPException ? err.status : 500;
  const message = err instanceof HTTPException ? err.message : "Something went wrong.";

  if (status >= 500) console.error("Unhandled error:", err);

  if (c.req.header("content-type")?.includes("application/json")) {
    return c.json({ error: message }, status);
  }
  return c.html(<ErrorPage message={message} />, status);
};
