import { Hono } from "hono";
import { list, del } from "@vercel/blob";
import { config } from "../config";

const cron = new Hono();

cron.get("/cleanup", async (c) => {
  const secret = c.req.header("authorization");
  if (secret !== `Bearer ${config.CRON_SECRET}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    const cutoff = new Date(Date.now() - maxAge);
    const toDelete: string[] = [];

    let cursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const result = await list({ cursor });
      for (const blob of result.blobs) {
        if (blob.uploadedAt < cutoff) {
          toDelete.push(blob.url);
        }
      }
      hasMore = result.hasMore;
      cursor = result.cursor;
    }

    if (toDelete.length > 0) {
      await del(toDelete);
    }

    console.log(`Cleanup: deleted ${toDelete.length} blobs older than ${cutoff.toISOString()}`);
    return c.json({ deleted: toDelete.length });
  } catch (err) {
    console.error("Blob cleanup failed:", err);
    return c.json({ error: "Cleanup failed" }, 500);
  }
});

export { cron };
