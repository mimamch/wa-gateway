import { Hono } from "hono";
import { createDashboardMiddleware } from "../../middlewares/key.middleware";
import DashboardIndex from "../../views/dashboard";
import SessionPage from "../../views/dashboard/sessions";
import { whatsapp } from "../../whatsapp";

export const createDashboardController = () => {
  const app = new Hono()
    .use(createDashboardMiddleware()) // protect all dashboard routes

    .get("/", (c) => c.redirect("/dashboard")) // redirect to /dashboard

    /**
     * dashboard routes
     * prefix: /dashboard
     */
    .basePath("/dashboard")

    .get("/", async (c) => {
      return c.render(<DashboardIndex />);
    })

    /**
     * sessions routes
     */
    .route(
      "/sessions",
      new Hono().get("/", async (c) => {
        const sessions = await whatsapp.getSessionsIds();

        return c.render(
          <SessionPage
            sessions={sessions.map((s) => ({
              id: s,
            }))}
          />
        );
      })
    );

  return app;
};
