import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

await sql`
  CREATE TABLE IF NOT EXISTS related_to_options (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS expense_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  )
`;

// Seed related_to_options (excluding "other" — that's hardcoded)
const relatedTo = [
  { id: "booster-meetings", name: "Comitee meetings", sort: 0 },
  { id: "social", name: "Social gatherings", sort: 1 },
  { id: "conference-dinner", name: "Conference dinner", sort: 2 },
  { id: "speakers-dinner", name: "Speakers dinner", sort: 3 },
  { id: "afterparty", name: "Afterparty", sort: 4 },
  { id: "booster-conference", name: "Main Conference", sort: 5 },
  { id: "booster-kids", name: "Booster Kids", sort: 6 },
];

for (const r of relatedTo) {
  await sql`
    INSERT INTO related_to_options (id, name, sort_order)
    VALUES (${r.id}, ${r.name}, ${r.sort})
    ON CONFLICT (id) DO NOTHING
  `;
}

// Seed expense_types (excluding "other" — that's hardcoded)
const expenseTypes = [
  { id: "transport", name: "Taxi / Transport", sort: 0 },
  { id: "food", name: "Drinks, snacks, food...", sort: 1 },
  { id: "office", name: "Office supplies", sort: 2 },
  { id: "hardware", name: "Hardware", sort: 3 },
  { id: "software", name: "Software", sort: 4 },
];

for (const e of expenseTypes) {
  await sql`
    INSERT INTO expense_types (id, name, sort_order)
    VALUES (${e.id}, ${e.name}, ${e.sort})
    ON CONFLICT (id) DO NOTHING
  `;
}

console.log("Migration complete.");
