import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// ─── expense_types ──────────────────────────────────────
// Current: id (text PK), name (text), sort_order (integer)
// Target:  id (integer PK, = sort_order), name (text), income_account (text), description_prefix (text), sort_order (integer)

await sql`ALTER TABLE expense_types ADD COLUMN income_account TEXT`;
await sql`ALTER TABLE expense_types ADD COLUMN description_prefix TEXT`;

// Set income_account and description_prefix (placeholder values — update later)
await sql`UPDATE expense_types SET income_account = '7140', description_prefix = 'Taxi/Transport' WHERE id = '7140'`;
await sql`UPDATE expense_types SET income_account = '7140', description_prefix = 'Food' WHERE id = 'food'`;
await sql`UPDATE expense_types SET income_account = '7140', description_prefix = 'Office' WHERE id = 'office'`;
await sql`UPDATE expense_types SET income_account = '7140', description_prefix = 'Hardware' WHERE id = 'hardware'`;
await sql`UPDATE expense_types SET income_account = '7140', description_prefix = 'Software' WHERE id = 'software'`;

await sql`ALTER TABLE expense_types ALTER COLUMN income_account SET NOT NULL`;
await sql`ALTER TABLE expense_types ALTER COLUMN description_prefix SET NOT NULL`;

// Convert id from text to integer (using sort_order as new id)
await sql`ALTER TABLE expense_types ADD COLUMN new_id INTEGER`;
await sql`UPDATE expense_types SET new_id = sort_order`;
await sql`ALTER TABLE expense_types DROP CONSTRAINT expense_types_pkey`;
await sql`ALTER TABLE expense_types DROP COLUMN id`;
await sql`ALTER TABLE expense_types RENAME COLUMN new_id TO id`;
await sql`ALTER TABLE expense_types ADD PRIMARY KEY (id)`;
await sql`ALTER TABLE expense_types ALTER COLUMN id SET NOT NULL`;

// ─── related_to_options ─────────────────────────────────
// Current: id (text PK), name (text), sort_order (integer)
// Target:  id (integer PK, = sort_order), project_id (integer), name (text), sort_order (integer)

await sql`ALTER TABLE related_to_options ADD COLUMN project_id INTEGER`;

// Placeholder project IDs (update with real Fiken project IDs later)
await sql`UPDATE related_to_options SET project_id = 0`;

await sql`ALTER TABLE related_to_options ALTER COLUMN project_id SET NOT NULL`;

// Convert id from text to integer (using sort_order as new id)
await sql`ALTER TABLE related_to_options ADD COLUMN new_id INTEGER`;
await sql`UPDATE related_to_options SET new_id = sort_order`;
await sql`ALTER TABLE related_to_options DROP CONSTRAINT related_to_options_pkey`;
await sql`ALTER TABLE related_to_options DROP COLUMN id`;
await sql`ALTER TABLE related_to_options RENAME COLUMN new_id TO id`;
await sql`ALTER TABLE related_to_options ADD PRIMARY KEY (id)`;
await sql`ALTER TABLE related_to_options ALTER COLUMN id SET NOT NULL`;

// ─── Verify ─────────────────────────────────────────────

console.log("expense_types after migration:");
const et = await sql`SELECT * FROM expense_types ORDER BY sort_order`;
console.table(et);

console.log("related_to_options after migration:");
const rto = await sql`SELECT * FROM related_to_options ORDER BY sort_order`;
console.table(rto);

console.log("Migration complete!");
