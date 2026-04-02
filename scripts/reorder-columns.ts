import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// ─── Recreate expense_types with id as first column ─────

await sql`CREATE TABLE expense_types_new (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  income_account TEXT NOT NULL,
  description_prefix TEXT NOT NULL,
  sort_order INTEGER NOT NULL
)`;
await sql`INSERT INTO expense_types_new SELECT id, name, income_account, description_prefix, sort_order FROM expense_types`;
await sql`DROP TABLE expense_types`;
await sql`ALTER TABLE expense_types_new RENAME TO expense_types`;

// ─── Recreate related_to_options with id as first column ─

await sql`CREATE TABLE related_to_options_new (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  project_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL
)`;
await sql`INSERT INTO related_to_options_new SELECT id, name, project_id, sort_order FROM related_to_options`;
await sql`DROP TABLE related_to_options`;
await sql`ALTER TABLE related_to_options_new RENAME TO related_to_options`;

// ─── Verify ─────────────────────────────────────────────

console.log("expense_types:");
console.table(await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'expense_types' ORDER BY ordinal_position`);
console.log("related_to_options:");
console.table(await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'related_to_options' ORDER BY ordinal_position`);
console.log("Done!");
