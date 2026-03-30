import { Hono } from "hono";
import { handleUpload } from "@vercel/blob/client";
import { sections, expenseTypes } from "./sections";
import { FormPage, SuccessPage, ErrorPage } from "./pages";
import { requireUser, type Env } from "./middleware";

const form = new Hono<Env>();

form.get("/", requireUser, (c) => {
  return c.html(<FormPage user={c.get("user")} sections={sections} expenseTypes={expenseTypes} />);
});

form.get("/success", requireUser, (c) => {
  return c.html(<SuccessPage user={c.get("user")} />);
});

form.get("/error", requireUser, (c) => {
  const message = c.req.query("message") || "Something went wrong.";
  return c.html(<ErrorPage message={message} user={c.get("user")} />);
});

form.post("/upload/handle", requireUser, async (c) => {
  const body = await c.req.json();

  const jsonResponse = await handleUpload({
    body,
    request: c.req.raw,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ["image/jpeg", "image/png", "application/pdf"],
      maximumSizeInBytes: 5 * 1024 * 1024,
    }),
    onUploadCompleted: async () => {},
  });

  return c.json(jsonResponse);
});

form.post("/submit", requireUser, async (c) => {
  const user = c.get("user");

  const body = await c.req.json();
  const { section, expenseType, description, receiptUrl } = body as Record<string, string>;

  const validSectionIds: readonly string[] = sections.map((s) => s.id);
  const validExpenseTypeIds: readonly string[] = expenseTypes.map((t) => t.id);

  const error =
    typeof section !== "string" || typeof expenseType !== "string" || typeof receiptUrl !== "string"
      ? "All fields are required."
      : !validSectionIds.includes(section)
        ? "Invalid section."
        : !validExpenseTypeIds.includes(expenseType)
          ? "Invalid expense type."
          : !receiptUrl.includes(".blob.vercel-storage.com/")
            ? "Invalid receipt URL."
            : null;

  if (error) {
    return c.json({ error }, 400);
  }

  console.log("Receipt submitted:", {
    user: user.name,
    section,
    expenseType,
    description: description || "",
    receiptUrl,
  });

  await new Promise((r) => setTimeout(r, 2000));

  return c.json({ ok: true });
});

export default form;
