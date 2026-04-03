import { getSignedCookie, setSignedCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";
import { config } from "./config";
import type { User } from "./types";

const COOKIE_NAME = "session";
const COOKIE_OPTIONS = { path: "/" } as const;

export async function getSessionUser(c: Context): Promise<User | null> {
  const raw = await getSignedCookie(c, config.COOKIE_SECRET, COOKIE_NAME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function setSessionUser(c: Context, user: User): Promise<void> {
  await setSignedCookie(c, COOKIE_NAME, JSON.stringify(user), config.COOKIE_SECRET, {
    httpOnly: true,
    secure: c.req.url.startsWith("https"),
    sameSite: "Lax",
    maxAge: 60 * 60 * 24 * 7,
    ...COOKIE_OPTIONS,
  });
}

export function clearSession(c: Context): void {
  deleteCookie(c, COOKIE_NAME, COOKIE_OPTIONS);
}
