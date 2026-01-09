import { Hono } from "hono";
import AuthIndex from "../../views/auth";
import { env } from "../../env";
import { setCookie } from "hono/cookie";

export const createAuthController = () => {
  const app = new Hono()
    .basePath("/auth")
    .get("/login", async (c) => {
      return c.render(<AuthIndex />);
    })
    .post("/login", async (c) => {
      const form = await c.req.formData();
      const password = form.get("password") as string;

      const AUTH_KEY = env.KEY;

      if (password === AUTH_KEY) {
        // set key to cookie
        setCookie(c, "key", password, {
          httpOnly: true,
        });
        return c.redirect("/dashboard");
      }

      return c.render(<AuthIndex error={"Invalid key"} />);
    });
  return app;
};
