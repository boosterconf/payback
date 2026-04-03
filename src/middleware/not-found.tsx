import type { NotFoundHandler } from "hono";
import { getSessionUser } from "../session";
import { NotFoundPage } from "../pages";

export const notFound: NotFoundHandler = async (c) => {
  const user = await getSessionUser(c);
  return c.html(<NotFoundPage user={user} />, 404);
};
