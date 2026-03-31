import { Hono } from "hono";
import { setSignedCookie, deleteCookie } from "hono/cookie";
import { githubAuth } from "@hono/oauth-providers/github";
import { config } from "./config";
import { LoginPage, ErrorPage, UnauthorizedPage } from "./pages";
import { getFikenContactId } from "./db";
import { getSessionUser, type Env } from "./middleware";

const auth = new Hono<Env>();

auth.get("/", async (c) => {
  const user = await getSessionUser(c);
  if (user) return c.redirect("/");
  return c.html(<LoginPage />);
});

auth.get("/login", githubAuth({
    client_id: config.GITHUB_CLIENT_ID,
    client_secret: config.GITHUB_CLIENT_SECRET,
  }),
  async (c) => {
    const githubUser = c.get("user-github");

    if (!githubUser) {
      return c.html(<ErrorPage message="GitHub authentication failed." />);
    }

    const id = githubUser.id!;
    const name = githubUser.name || githubUser.login || "unknown";
    const avatar = githubUser.avatar_url || "";

    const fikenContactId = await getFikenContactId(id);
    if (!fikenContactId) {
      return c.redirect("/auth/unauthorized");
    }

    await setSignedCookie(c, "session", JSON.stringify({ id, name, avatar }), config.COOKIE_SECRET, {
      httpOnly: true,
      secure: c.req.url.startsWith("https"),
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return c.redirect("/");
  },
);

auth.get("/unauthorized", (c) => {
  return c.html(<UnauthorizedPage />);
});

auth.get("/logout", (c) => {
  deleteCookie(c, "session", { path: "/" });
  return c.redirect("/");
});

export default auth;
