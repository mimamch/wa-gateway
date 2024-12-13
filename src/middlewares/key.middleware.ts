import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import { env } from "../env";

export const createKeyMiddleware = () =>
  createMiddleware(async (c, next) => {
    const authorization = c.req.query().key || c.req.header().key;
    if (!env.KEY) {
      throw new HTTPException(500, {
        message: "API key not configured on server",
      });
    }
    if (!authorization) {
      throw new HTTPException(401, {
        message: "API key is required. Please provide it via 'key' query parameter or 'key' header",
      });
    }
    if (authorization !== env.KEY) {
      throw new HTTPException(401, {
        message: "Invalid API key provided",
      });
    }

    await next();
  });
