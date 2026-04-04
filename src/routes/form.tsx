import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { handleUpload } from "@vercel/blob/client";
import { relatedToOptions } from "../data/related-to-options";
import { expenseTypes } from "../data/expense-types";
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

  if (typeof relatedTo !== "string" || typeof expenseType !== "string" || typeof receiptUrl !== "string") {
    throw new HTTPException(400, { message: "All fields are required." });
  }

  const relatedToIndex = parseInt(relatedTo);
  const expenseTypeIndex = parseInt(expenseType);

  if (!Number.isInteger(relatedToIndex) || relatedToIndex < 0 || relatedToIndex >= relatedToOptions.length) {
    throw new HTTPException(400, { message: "Invalid selection." });
  }
  if (!Number.isInteger(expenseTypeIndex) || expenseTypeIndex < 0 || expenseTypeIndex >= expenseTypes.length) {
    throw new HTTPException(400, { message: "Invalid expense type." });
  }
  try {
    const receiptHost = new URL(receiptUrl).hostname;
    if (!receiptHost.endsWith(".blob.vercel-storage.com")) {
      throw new HTTPException(400, { message: "Invalid receipt URL." });
    }
  } catch (e) {
    if (e instanceof HTTPException) throw e;
    throw new HTTPException(400, { message: "Invalid receipt URL." });
  }

  const selectedRelatedTo = relatedToOptions[relatedToIndex]!;
  const selectedExpenseType = expenseTypes[expenseTypeIndex]!;
  const parsedAmount = parseFloat(amount || "");
  const grossAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? Math.round(parsedAmount * 100) : 0;

  const draftId = await submitReceipt({
    contactId: user.fikenContactId,
    projectId: selectedRelatedTo.projectId,
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
