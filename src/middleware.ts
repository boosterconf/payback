import { getSignedCookie } from "hono/cookie";
import type { MiddlewareHandler } from "hono";
import { config } from "./config";

export type User = { name: string; avatar: string };
export type Env = { Variables: { user: User } };

export async function getSessionUser(c: Parameters<MiddlewareHandler>[0]): Promise<User | null> {
  const raw = await getSignedCookie(c, config.COOKIE_SECRET, "session");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export const requireUser: MiddlewareHandler<Env> = async (c, next) => {
  const user = await getSessionUser(c);
  if (!user) return c.redirect("/auth");
  c.set("user", user);
  return next();
};
