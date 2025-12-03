import { Hono } from "hono";

export const createHealthController = () => {
  const app = new Hono().basePath("/health").get("/", async (c) => {
    return c.json({ status: "ok" });
  });
  return app;
};
