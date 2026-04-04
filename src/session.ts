import { getSignedCookie, setSignedCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";
import { config } from "./config";
import type { User } from "./types";

const COOKIE_NAME = "session";
const OAUTH_STATE_COOKIE = "oauth_state";
const COOKIE_OPTIONS = { path: "/" } as const;

export async function getSessionUser(c: Context): Promise<User | undefined> {
  const raw = await getSignedCookie(c, config.COOKIE_SECRET, COOKIE_NAME);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return undefined;
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

export async function getOAuthState(c: Context): Promise<string | null> {
  const state = await getSignedCookie(c, config.COOKIE_SECRET, OAUTH_STATE_COOKIE);
  return typeof state === "string" ? state : null;
}

export async function setOAuthState(c: Context, state: string): Promise<void> {
  await setSignedCookie(c, OAUTH_STATE_COOKIE, state, config.COOKIE_SECRET, {
    httpOnly: true,
    secure: c.req.url.startsWith("https"),
    sameSite: "Lax",
    maxAge: 600,
    path: "/",
  });
}

export function clearOAuthState(c: Context): void {
  deleteCookie(c, OAUTH_STATE_COOKIE, COOKIE_OPTIONS);
}
