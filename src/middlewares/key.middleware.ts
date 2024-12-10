import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import { env } from "../env";

export const createKeyMiddleware = () =>
  createMiddleware(async (c, next) => {
    const authorization = c.req.query().key || c.req.header().key;
    if (env.KEY && (!authorization || authorization != env.KEY)) {
      throw new HTTPException(401, {
        message: "Unauthorized",
      });
    }

    await next();
  });
