import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

console.log("expense_types schema:");
const cols1 = await sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'expense_types' ORDER BY ordinal_position`;
console.table(cols1);

console.log("related_to_options schema:");
const cols2 = await sql`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'related_to_options' ORDER BY ordinal_position`;
console.table(cols2);

console.log("expense_types data:");
const data1 = await sql`SELECT * FROM expense_types ORDER BY sort_order`;
console.table(data1);

console.log("related_to_options data:");
const data2 = await sql`SELECT * FROM related_to_options ORDER BY sort_order`;
console.table(data2);
