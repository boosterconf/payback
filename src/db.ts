import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { config } from "./config";

let instance: NeonQueryFunction<false, false> | null = null;
const sql = () => (instance ??= neon(config.DATABASE_URL));

// Wake up Neon DB on cold start (autosuspends after 5 min of inactivity)
sql()`SELECT 1`.catch(() => {});

export type RelatedToOption = { id: number; name: string; projectId: number };
export type ExpenseType = { id: number; name: string; incomeAccount: string; descriptionPrefix: string };

const OTHER_RELATED_TO: RelatedToOption = {
  id: -1,
  name: "Not sure / whatever / leave me alone...",
  projectId: 0,
};

const OTHER_EXPENSE_TYPE: ExpenseType = {
  id: -1,
  name: "Other... Whatever... Papasan?",
  incomeAccount: "7799",
  descriptionPrefix: "Other",
};

export async function getFormOptions() {
  const [relatedToRows, expenseTypeRows] = await sql().transaction([
    sql()`SELECT id, name, project_id AS "projectId" FROM related_to_options ORDER BY sort_order`,
    sql()`SELECT id, name, income_account AS "incomeAccount", description_prefix AS "descriptionPrefix" FROM expense_types ORDER BY sort_order`,
  ]);
  return {
    relatedToOptions: [...(relatedToRows as RelatedToOption[]), OTHER_RELATED_TO],
    expenseTypes: [...(expenseTypeRows as ExpenseType[]), OTHER_EXPENSE_TYPE],
  };
}

export async function getFikenContactId(githubUserId: number): Promise<string | null> {
  const rows = await sql()`
    SELECT fiken_contact_id FROM user_fiken_mapping WHERE github_user_id = ${githubUserId}
  `;
  return rows.length > 0 ? (rows[0] as { fiken_contact_id: string }).fiken_contact_id : null;
}
