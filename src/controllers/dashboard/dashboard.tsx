import { Hono } from "hono";
import { createDashboardMiddleware } from "../../middlewares/key.middleware";
import DashboardIndex from "../../views/dashboard";

export const createDashboardController = () => {
  const app = new Hono()
    .basePath("/dashboard")
    .get("/", createDashboardMiddleware(), async (c) => {
      return c.render(<DashboardIndex />);
    });
  return app;
};
