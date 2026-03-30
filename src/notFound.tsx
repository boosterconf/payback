import type { NotFoundHandler } from "hono";
import { NotFoundPage } from "./pages";

const notFound: NotFoundHandler = (c) => {
  return c.html(<NotFoundPage />, 404);
};

export default notFound;
