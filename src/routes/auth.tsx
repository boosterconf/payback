import { Hono } from "hono";
import { config } from "../config";
import { LoginPage, UnauthorizedPage, LoggedOutPage } from "../pages";
import { getContactIdByEmail } from "../services/fiken";
import { setSessionUser, clearSession, getOAuthState, setOAuthState, clearOAuthState } from "../session";
import { type Env, type SlackTokenResponse, type SlackIdTokenPayload } from "../types";

const auth = new Hono<Env>();

function decodeJwtPayload<T>(jwt: string): T {
  const payload = jwt.split(".")[1];
  if (!payload) throw new Error("Invalid id_token payload");
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return JSON.parse(atob(padded)) as T;
}

auth.get("/", (c) => {
  clearSession(c);
  return c.html(<LoginPage />);
});

auth.get("/login", async (c) => {

  if (process.env.DEV_USER) {
    const devUser = {
      "id": "dev",
      "name": "Development User",
      "avatar": "/fallback-profile.png",
      "fikenContactId": 11854322793
    };
    await setSessionUser(c, devUser);
    return c.redirect("/");
  }

  const state = crypto.randomUUID();
  const redirectUri = new URL("/auth/callback", c.req.url).href.replace("http://", "https://");

  await setOAuthState(c, state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.SLACK_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "openid profile email",
    state,
    nonce: state,
    team: config.SLACK_TEAM_ID,
  });

  return c.redirect(`https://slack.com/openid/connect/authorize?${params}`);
});

auth.get("/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const storedState = await getOAuthState(c);

  if (!code || !state || !storedState || state !== storedState) {
    return c.redirect("/auth/unauthorized");
  }

  clearOAuthState(c);

  const redirectUri = new URL("/auth/callback", c.req.url).href.replace("http://", "https://");

  const tokenRes = await fetch("https://slack.com/api/openid.connect.token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.SLACK_CLIENT_ID,
      client_secret: config.SLACK_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenBody = (await tokenRes.json()) as SlackTokenResponse;
  if (!tokenRes.ok || !tokenBody.ok || !tokenBody.id_token) {
    console.error("Slack token exchange failed:", tokenBody.error || tokenRes.statusText);
    return c.redirect("/auth/unauthorized");
  }

  const slackUser = decodeJwtPayload<SlackIdTokenPayload>(tokenBody.id_token);
  if (slackUser.nonce !== state || !slackUser.sub || !slackUser.email) {
    return c.redirect("/auth/unauthorized");
  }

  const fikenContactId = await getContactIdByEmail(slackUser.email);
  if (!fikenContactId) {
    return c.redirect("/auth/unauthorized");
  }

  await setSessionUser(c, {
    id: slackUser.sub,
    name: slackUser.name || "unknown",
    avatar: slackUser.picture || "/fallback-profile.png",
    fikenContactId,
  });

  return c.redirect("/");
});

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
