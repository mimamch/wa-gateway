import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import { env } from "../env";
import { getCookie, getSignedCookie } from "hono/cookie";

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
export const createDashboardMiddleware = () =>
  createMiddleware(async (c, next) => {
    const authorization = await getSignedCookie(
      c,
      "14e9f106-9860-4219-ae63-d34e4f5127bd",
      "key"
    );
    if (env.KEY && (!authorization || authorization !== env.KEY)) {
      return c.redirect("/auth/login");
    }

    await next();
  });
