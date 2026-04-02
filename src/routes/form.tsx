import { Hono } from "hono";
import { handleUpload } from "@vercel/blob/client";
import { getFormOptions, getFikenContactId } from "../db";
import { submitReceipt } from "../fiken";
import { FormPage, SuccessPage, ErrorPage } from "../pages";
import { requireUser, type Env } from "../middleware";

const form = new Hono<Env>();

form.get("/", requireUser, async (c) => {
  const { relatedToOptions, expenseTypes } = await getFormOptions();
  return c.html(<FormPage user={c.get("user")} relatedToOptions={relatedToOptions} expenseTypes={expenseTypes} />);
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
      maximumSizeInBytes: 25 * 1024 * 1024,
      addRandomSuffix: true,
    }),
    onUploadCompleted: async () => {},
  });

  return c.json(jsonResponse);
});

form.post("/submit", requireUser, async (c) => {
  const user = c.get("user");

  const body = await c.req.json();
  const { relatedTo, expenseType, description, amount, receiptUrl } = body as Record<string, string>;

  const { relatedToOptions, expenseTypes } = await getFormOptions();
  const fikenContactId = await getFikenContactId(user.id);
  const validRelatedToIds = relatedToOptions.map((s) => String(s.id));
  const validExpenseTypeIds = expenseTypes.map((t) => String(t.id));

  const error =
    typeof relatedTo !== "string" || typeof expenseType !== "string" || typeof receiptUrl !== "string"
      ? "All fields are required."
      : !validRelatedToIds.includes(relatedTo)
        ? "Invalid selection."
        : !validExpenseTypeIds.includes(expenseType)
          ? "Invalid expense type."
          : !receiptUrl.includes(".blob.vercel-storage.com/")
            ? "Invalid receipt URL."
            : null;

  if (error) {
    return c.json({ error }, 400);
  }

  const selectedExpenseType = expenseTypes.find((t) => String(t.id) === expenseType);

  const draftId = await submitReceipt({
    contactId: Number(fikenContactId),
    incomeAccount: selectedExpenseType!.incomeAccount || "7799",
    description: `${selectedExpenseType!.descriptionPrefix}: ${description || ""}`.trim(),
    grossAmount: amount ? Math.round(parseFloat(amount) * 100) : 0,
    receiptUrl: receiptUrl!,
  });

  console.log("Receipt submitted:", {
    user: user.name,
    fikenContactId,
    fikenDraftId: draftId,
    relatedTo,
    expenseType,
    description: description || "",
    receiptUrl,
  });

  return c.json({ ok: true });
});

export default form;
