import { getContactIdByEmail } from "../src/services/fiken";

const email = process.argv[2];
if (!email) {
  console.error("Usage: bun scripts/lookup-fiken-contact.ts <email>");
  process.exit(1);
}

const contactId = await getContactIdByEmail(email);
if (contactId === null) {
  console.log(`No Fiken contact found for ${email}`);
} else {
  console.log(`Contact ID for ${email}: ${contactId}`);
}
