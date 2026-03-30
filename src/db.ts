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

export async function getRelatedToOptions(): Promise<Option[]> {
  const rows = await sql()`SELECT id, name FROM related_to_options ORDER BY sort_order`;
  return [...(rows as Option[]), OTHER_RELATED_TO];
}

export async function getExpenseTypes(): Promise<Option[]> {
  const rows = await sql()`SELECT id, name FROM expense_types ORDER BY sort_order`;
  return [...(rows as Option[]), OTHER_EXPENSE_TYPE];
}
