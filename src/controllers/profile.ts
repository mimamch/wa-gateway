import * as whatsapp from "wa-multi-session";
import { Hono } from "hono";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import { createKeyMiddleware } from "../middlewares/key.middleware";
import { toDataURL } from "qrcode";
import { HTTPException } from "hono/http-exception";
import { basicAuthMiddleware } from "../middlewares/auth.middleware";
import type { User } from "../database/db";

type Variables = {
  user: User;
};

export const createProfileController = () => {
  const app = new Hono<{ Variables: Variables }>();

  // Apply basic auth to all profile routes
  app.use("*", basicAuthMiddleware());

  const getProfileSchema = z.object({
    session: z.string(),
    target: z
      .string()
      .refine((v) => v.includes("@s.whatsapp.net") || v.includes("@g.us"), {
        message: "target must contain '@s.whatsapp.net' or '@g.us'",
      }),
  });

  app.post(
    "/",
    requestValidator("json", getProfileSchema),
    async (c) => {
      const payload = c.req.valid("json");
      const user = c.get("user") as User;
      
      // For non-admin users, ensure they can only use their own sessions
      const expectedSession = user.session_name || user.username;
      if (user.is_admin !== 1 && payload.session !== expectedSession) {
        throw new HTTPException(403, {
          message: `You can only use your session: ${expectedSession}`,
        });
      }
      
      const isExist = whatsapp.getSession(payload.session);
      if (!isExist) {
        throw new HTTPException(400, {
          message: "Session does not exist",
        });
      }

      const isRegistered = await whatsapp.isExist({
        sessionId: payload.session,
        to: payload.target,
        isGroup: payload.target.includes("@g.us"),
      });

      if (!isRegistered) {
        throw new HTTPException(400, {
          message: "Target is not registered",
        });
      }

      return c.json({
        data: await whatsapp.getProfileInfo({
          sessionId: payload.session,
          target: payload.target,
        }),
      });
    }
  );

  return app;
};
