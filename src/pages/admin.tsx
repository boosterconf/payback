import type { FC } from "hono/jsx";
import type { User } from "../types";
import { Layout } from "./layout";

export const AdminPage: FC<{ user: User; vercelUrl: string; expenseTypesUrl: string; relatedToOptionsUrl: string }> = ({ user, vercelUrl, expenseTypesUrl, relatedToOptionsUrl }) => (
  <Layout user={user}>
    <img src="/admin.gif" alt="Admin" />
    <a href={vercelUrl} class="btn btn-outline" target="_blank" rel="noopener">Vercel Dashboard</a>
    <a href={expenseTypesUrl} class="btn btn-outline" target="_blank" rel="noopener">Edit Expense Types</a>
    <a href={relatedToOptionsUrl} class="btn btn-outline" target="_blank" rel="noopener">Edit Related-to Options</a>
  </Layout>
);
