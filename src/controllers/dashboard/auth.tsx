import { Hono } from "hono";
import AuthIndex from "../../views/auth";
import { env } from "../../env";
import { setSignedCookie } from "hono/cookie";

export const createAuthController = () => {
  const app = new Hono()

    /**
     * auth routes
     * prefix: /auth
     */
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
        await setSignedCookie(
          c,
          "key",
          password,
          "14e9f106-9860-4219-ae63-d34e4f5127bd",
          {
            httpOnly: true,
          }
        );
        return c.redirect("/dashboard");
      }

      return c.render(<AuthIndex error={"Invalid key"} />);
    });
  return app;
};
