import { Hono } from "hono";
import { githubAuth } from "@hono/oauth-providers/github";
import { config } from "../config";
import { LoginPage, UnauthorizedPage, LoggedOutPage } from "../pages";
import { getFikenContactId } from "../services/db";
import { setSessionUser, clearSession } from "../session";
import { type Env } from "../types";

const auth = new Hono<Env>();

auth.get("/", (c) => {
  clearSession(c);
  return c.html(<LoginPage />);
});

auth.get("/login", githubAuth({
    client_id: config.GITHUB_CLIENT_ID,
    client_secret: config.GITHUB_CLIENT_SECRET,
  }),
  async (c) => {
    const githubUser = c.get("user-github");

    if (!githubUser || !githubUser.id) {
      throw new Error("GitHub authentication failed.");
    }

    const id = githubUser.id;
    const name = githubUser.name || githubUser.login || "unknown";
    const avatar = githubUser.avatar_url || "";

    const fikenContactId = await getFikenContactId(id);
    if (!fikenContactId) {
      return c.redirect("/auth/unauthorized");
    }

    await setSessionUser(c, { id, name, avatar, fikenContactId: Number(fikenContactId) });

    return c.redirect("/");
  },
);

auth.get("/unauthorized", (c) => {
  return c.html(<UnauthorizedPage />);
});

auth.get("/logout", (c) => {
  clearSession(c);
  return c.redirect("/auth/logged-out");
});

auth.get("/logged-out", (c) => {
  return c.html(<LoggedOutPage />);
});

export { auth };
