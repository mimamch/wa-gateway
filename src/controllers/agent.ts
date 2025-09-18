import { Hono } from "hono";
import { z } from "zod";
import { createKeyMiddleware } from "../middlewares/key.middleware";
import { requestValidator } from "../middlewares/validation.middleware";
import { createAgenixAgent } from "../services/agenix.service";
import { HTTPException } from "hono/http-exception";

export const createAgentController = () => {
  const app = new Hono();

  const createAgentSchema = z.object({
    chatAgentName: z.string(),
    systemPrompt: z.string(),
  });

  app.post(
    "/",
    createKeyMiddleware(),
    requestValidator("json", createAgentSchema),
    async (c) => {
      const payload = c.req.valid("json");
      console.log(payload)
      try {
        const agent = await createAgenixAgent(
          payload.chatAgentName,
          payload.systemPrompt
        );
        return c.json({
          success: true,
          data: agent,
        });
      } catch (error: any) {
        throw new HTTPException(400, {
          message: error.message || "Failed to create agent",
        });
      }
    }
  );

  return app;
};