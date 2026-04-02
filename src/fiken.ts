import { config } from "./config";
import { get } from "@vercel/blob";

const FIKEN_BASE = "https://api.fiken.no/api/v2";
const COMPANY_SLUG = "foreningen-boosterkonferansen";

interface PurchaseDraftLine {
  text: string;
  vatType: string;
  incomeAccount: string;
  net: number;
  gross: number;
}

interface PurchaseDraft {
  cash: boolean;
  paid: boolean;
  contactId: number;
  lines: PurchaseDraftLine[];
  invoiceIssueDate?: string;
  currency?: string;
}

async function fikenFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${FIKEN_BASE}/companies/${COMPANY_SLUG}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.FIKEN_TOKEN}`,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fiken API ${res.status}: ${body}`);
  }

  return res;
}

async function createPurchaseDraft(draft: PurchaseDraft): Promise<number> {
  const res = await fikenFetch("/purchases/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });

  const location = res.headers.get("Location");
  if (!location) throw new Error("No Location header in response");

  return Number(location.split("/").pop());
}

async function addAttachmentToDraft(draftId: number, filename: string, blob: Blob): Promise<void> {
  const form = new FormData();
  form.append("filename", filename);
  form.append("file", blob, filename);

  await fikenFetch(`/purchases/drafts/${draftId}/attachments`, {
    method: "POST",
    body: form,
  });
}

interface SubmitReceiptParams {
  contactId: number;
  incomeAccount: string;
  description: string;
  grossAmount: number;
  receiptUrl: string;
}

/** Create a Fiken purchase draft with the receipt attached. Returns the draft ID. */
export async function submitReceipt(params: SubmitReceiptParams): Promise<number> {
  const draftId = await createPurchaseDraft({
    cash: false,
    paid: false,
    contactId: params.contactId,
    invoiceIssueDate: new Date().toISOString().split("T")[0],
    lines: [
      {
        text: (params.description || "Receipt").slice(0, 199),
        vatType: "NONE",
        incomeAccount: params.incomeAccount,
        net: params.grossAmount,
        gross: params.grossAmount,
      },
    ],
  });

  // Download the receipt from Vercel Blob (private store requires token)
  const result = await get(params.receiptUrl, { access: "private" });
  if (!result || result.statusCode !== 200) throw new Error("Failed to fetch receipt from blob store");

  const blob = await new Response(result.stream).blob();
  const filename = result.blob.pathname.split("/").pop() || "receipt.jpg";

  await addAttachmentToDraft(draftId, filename, blob);

  return draftId;
}
