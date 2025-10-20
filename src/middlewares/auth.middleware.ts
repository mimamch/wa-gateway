import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { userDb } from "../database/db";

export const basicAuthMiddleware = () =>
  createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      c.header("WWW-Authenticate", 'Basic realm="WA Gateway"');
      throw new HTTPException(401, {
        message: "Unauthorized",
      });
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");

    const user = userDb.getUserByUsername(username);
    if (!user || !userDb.verifyPassword(password, user.password)) {
      c.header("WWW-Authenticate", 'Basic realm="WA Gateway"');
      throw new HTTPException(401, {
        message: "Invalid credentials",
      });
    }

    // Set user in context
    c.set("user", user);

    await next();
  });

export const adminAuthMiddleware = () =>
  createMiddleware(async (c, next) => {
    const user = c.get("user");

    if (!user || user.is_admin !== 1) {
      throw new HTTPException(403, {
        message: "Admin access required",
      });
    }

    await next();
  });
