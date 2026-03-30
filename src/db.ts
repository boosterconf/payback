import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { config } from "./config";

let instance: NeonQueryFunction<false, false> | null = null;
const sql = () => (instance ??= neon(config.DATABASE_URL));

export type Option = { id: string; name: string };

const OTHER_RELATED_TO: Option = {
  id: "other",
  name: "Not sure / whatever / leave me alone...",
};

const OTHER_EXPENSE_TYPE: Option = {
  id: "other",
  name: "Other... Whatever... Papasan?",
};

export async function getFormOptions() {
  const [relatedToRows, expenseTypeRows] = await sql().transaction([
    sql()`SELECT id, name FROM related_to_options ORDER BY sort_order`,
    sql()`SELECT id, name FROM expense_types ORDER BY sort_order`,
  ]);
  return {
    relatedToOptions: [...(relatedToRows as Option[]), OTHER_RELATED_TO],
    expenseTypes: [...(expenseTypeRows as Option[]), OTHER_EXPENSE_TYPE],
  };
}

export async function getFikenContactId(githubUserId: number): Promise<string | null> {
  const rows = await sql()`
    SELECT fiken_contact_id FROM user_fiken_mapping WHERE github_user_id = ${githubUserId}
  `;
  return rows.length > 0 ? (rows[0] as { fiken_contact_id: string }).fiken_contact_id : null;
}
