import type { NotFoundHandler } from "hono";
import { getSessionUser } from "./middleware";
import { NotFoundPage } from "./pages";

const notFound: NotFoundHandler = async (c) => {
  const user = await getSessionUser(c);
  return c.html(<NotFoundPage user={user} />, 404);
};

export default notFound;
