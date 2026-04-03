import type { MiddlewareHandler } from "hono";
import { getSessionUser } from "../session";
import type { Env } from "../types";

export const requireUser: MiddlewareHandler<Env> = async (c, next) => {
  const user = await getSessionUser(c);
  if (!user) return c.redirect("/auth");
  c.set("user", user);
  return next();
};
