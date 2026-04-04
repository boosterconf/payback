import { $ } from "bun";

await $`vercel env pull --yes`;
await $`bun --hot src/server.ts`.env({ ...process.env, DEV_USER: "true" });
