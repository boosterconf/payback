import { Hono } from "hono";
import { getSignedCookie, setSignedCookie, deleteCookie } from "hono/cookie";
import { githubAuth } from "@hono/oauth-providers/github";
import type { Context } from "hono";
import { projects } from "./projects";
import { LoginPage, FormPage, SuccessPage, ErrorPage } from "./pages";

const COOKIE_SECRET = process.env.COOKIE_SECRET || "dev-secret-change-me";
const GITHUB_ORG = process.env.GITHUB_ORG || "boosterconf";

const app = new Hono();

async function getUser(c: Context) {
  return (await getSignedCookie(c, COOKIE_SECRET, "session")) || null;
}

// Main page
app.get("/", async (c) => {
  const error = c.req.query("error");
  if (error === "access-denied") {
    return c.html(
      <ErrorPage message="You must be a member of the boosterconf GitHub organization." />,
    );
  }

  const user = await getUser(c);
  if (!user) return c.html(<LoginPage />);

  if (c.req.query("success") !== undefined) {
    return c.html(<SuccessPage />);
  }

  return c.html(<FormPage user={user} projects={projects} />);
});

// GitHub OAuth login
app.get(
  "/auth/login",
  githubAuth({
    client_id: process.env.GITHUB_ID,
    client_secret: process.env.GITHUB_SECRET,
    scope: ["read:org"],
    oauthApp: true,
  }),
  async (c) => {
    const token = c.get("token");
    const githubUser = c.get("user-github");

    if (!githubUser || !token) {
      return c.html(<ErrorPage message="GitHub authentication failed." />);
    }

    const orgRes = await fetch(
      `https://api.github.com/user/memberships/orgs/${GITHUB_ORG}`,
      { headers: { Authorization: `Bearer ${token.token}` } },
    );

    if (!orgRes.ok) {
      return c.redirect("/?error=access-denied");
    }

    const name = githubUser.name || githubUser.login || "unknown";
    await setSignedCookie(c, "session", name, COOKIE_SECRET, {
      httpOnly: true,
      secure: c.req.url.startsWith("https"),
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return c.redirect("/");
  },
);

// Logout
app.get("/auth/logout", (c) => {
  deleteCookie(c, "session", { path: "/" });
  return c.redirect("/");
});

// Submit receipt
app.post("/submit", async (c) => {
  const user = await getUser(c);
  if (!user) return c.redirect("/");

  const body = await c.req.parseBody();
  const project = body["project"];
  const description = body["description"];
  const receipt = body["receipt"];

  const validProjectIds: readonly string[] = projects.map((p) => p.id);
  const allowedFileTypes = ["image/jpeg", "image/png", "image/heic", "application/pdf"];

  const error =
    typeof project !== "string" || typeof description !== "string" || !(receipt instanceof File)
      ? "All fields are required."
      : !validProjectIds.includes(project)
        ? "Invalid project."
        : !allowedFileTypes.includes(receipt.type)
          ? "Invalid file type. Use JPEG, PNG, HEIC, or PDF."
          : null;

  if (error) {
    return c.html(<FormPage user={user} projects={projects} error={error} />);
  }

  const file = receipt as File;

  console.log("Receipt submitted:", {
    project,
    description,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

  return c.redirect("/?success");
});

export default app;