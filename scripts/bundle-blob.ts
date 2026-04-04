const result = await Bun.build({
  entrypoints: ["node_modules/@vercel/blob/dist/client.js"],
  outdir: "public",
  naming: "blob-client.js",
  minify: true
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
