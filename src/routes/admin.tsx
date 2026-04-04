import { Hono } from "hono";
import { config } from "../config";
import { AdminPage } from "../pages";
import { requireUser } from "../middleware";
import type { Env } from "../types";

const admin = new Hono<Env>();

admin.use(requireUser);

admin.get("/", (c) => {
  const user = c.get("user");
  const vercelUrl = `https://vercel.com/${config.VERCEL_TEAM_SLUG}/${config.VERCEL_PROJECT_NAME}`;
  const ghBase = "https://github.com/boosterconf/payback/edit/main";
  const expenseTypesUrl = `${ghBase}/src/data/expense-types.ts`;
  const relatedToOptionsUrl = `${ghBase}/src/data/related-to-options.ts`;
  return c.html(<AdminPage
    user={user}
    vercelUrl={vercelUrl}
    expenseTypesUrl={expenseTypesUrl}
    relatedToOptionsUrl={relatedToOptionsUrl}
  />);
});

export { admin };
