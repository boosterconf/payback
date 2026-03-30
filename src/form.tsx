import { Hono } from "hono";
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

form.post("/submit", requireUser, async (c) => {
  const user = c.get("user");

  const body = await c.req.parseBody();
  const section = body["section"];
  const expenseType = body["expenseType"];
  const description = body["description"];
  const receipt = body["receipt"];

  const validSectionIds: readonly string[] = sections.map((s) => s.id);
  const validExpenseTypeIds: readonly string[] = expenseTypes.map((t) => t.id);
  const allowedFileTypes = ["image/jpeg", "image/png", "application/pdf"];
  const maxFileSize = 5 * 1024 * 1024;

  const error =
    typeof section !== "string" || typeof expenseType !== "string" || !(receipt instanceof File)
      ? "All fields are required."
      : !validSectionIds.includes(section)
        ? "Invalid section."
        : !validExpenseTypeIds.includes(expenseType)
          ? "Invalid expense type."
          : !allowedFileTypes.includes((receipt as File).type)
            ? "Invalid file type. Use JPEG, PNG, or PDF."
            : (receipt as File).size > maxFileSize
              ? "File is too large. Maximum size is 5 MB."
              : null;

  if (error) {
    return c.html(<ErrorPage message={error} user={user} />);
  }

  const file = receipt as File;

  console.log("Receipt submitted:", {
    user: user.name,
    section,
    expenseType,
    description,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

  return c.redirect("/success", 303);
});

export default form;
