import { NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const notFoundMiddleware: NotFoundHandler = (c) => {
  throw new HTTPException(404, {
    message: "Route not found",
  });
};
