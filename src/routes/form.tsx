import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { handleUpload } from "@vercel/blob/client";
import relatedToOptions from "../data/related-to-options.json";
import expenseTypes from "../data/expense-types.json";
import { submitReceipt } from "../services/fiken";
import { FormPage, SuccessPage, ErrorPage } from "../pages";
import { requireUser } from "../middleware";
import type { Env } from "../types";

const form = new Hono<Env>();

form.get("/", requireUser, (c) => {
  return c.html(<FormPage user={c.get("user")} relatedToOptions={relatedToOptions} expenseTypes={expenseTypes} />);
});

form.get("/success", requireUser, (c) => {
  return c.html(<SuccessPage user={c.get("user")} />);
});

form.get("/error", requireUser, (c) => {
  return c.html(<ErrorPage user={c.get("user")} />);
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
  });

  return c.json(jsonResponse);
});

form.post("/submit", requireUser, async (c) => {
  const user = c.get("user");

  const body = await c.req.json();
  const { relatedTo, expenseType, description, amount, receiptUrl } = body as Record<string, string>;

  const validRelatedToIds = relatedToOptions.map((s) => String(s.id));
  const validExpenseTypeIds = expenseTypes.map((t) => String(t.id));

  if (typeof relatedTo !== "string" || typeof expenseType !== "string" || typeof receiptUrl !== "string") {
    throw new HTTPException(400, { message: "All fields are required." });
  }
  if (!validRelatedToIds.includes(relatedTo)) {
    throw new HTTPException(400, { message: "Invalid selection." });
  }
  if (!validExpenseTypeIds.includes(expenseType)) {
    throw new HTTPException(400, { message: "Invalid expense type." });
  }
  if (!receiptUrl.includes(".blob.vercel-storage.com/")) {
    throw new HTTPException(400, { message: "Invalid receipt URL." });
  }

  const selectedExpenseType = expenseTypes.find((t) => String(t.id) === expenseType);
  const parsedAmount = parseFloat(amount || "");
  const grossAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? Math.round(parsedAmount * 100) : 0;

  const draftId = await submitReceipt({
    contactId: user.fikenContactId,
    incomeAccount: selectedExpenseType!.incomeAccount || "7799",
    description: `${selectedExpenseType!.descriptionPrefix}: ${description || ""}`.trim(),
    grossAmount,
    receiptUrl,
  });

  console.log("Receipt submitted:", {
    user: user.name,
    fikenContactId: user.fikenContactId,
    fikenDraftId: draftId,
    relatedTo,
    expenseType,
    description: description || "",
    receiptUrl,
  });

  return c.json({ ok: true });
});

export { form };
