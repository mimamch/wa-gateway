import { Hono } from "hono";
import { createKeyMiddleware } from "../middlewares/key.middleware";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import * as whatsapp from "wa-multi-session";
import { HTTPException } from "hono/http-exception";
import { basicAuthMiddleware } from "../middlewares/auth.middleware";
import type { User } from "../database/db";

export const createMessageController = () => {
  const app = new Hono();

  // Apply basic auth to all message routes
  app.use("*", basicAuthMiddleware());

  const sendMessageSchema = z.object({
    session: z.string(),
    to: z.string(),
    text: z.string(),
    is_group: z.boolean().optional(),
  });

  app.post(
    "/send-text",
    requestValidator("json", sendMessageSchema),
    async (c) => {
      const payload = c.req.valid("json");
      const user = c.get("user") as User;
      
      // For non-admin users, verify session matches their configured session
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

      await whatsapp.sendTyping({
        sessionId: payload.session,
        to: payload.to,
        duration: Math.min(5000, payload.text.length * 100),
        isGroup: payload.is_group,
      });

      const response = await whatsapp.sendTextMessage({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
        isGroup: payload.is_group,
      });

      return c.json({
        data: response,
      });
    }
  );

  /**
   * @deprecated
   * This endpoint is deprecated, use POST /send-text instead
   */
  app.get(
    "/send-text",
    requestValidator("query", sendMessageSchema),
    async (c) => {
      const payload = c.req.valid("query");
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

      const response = await whatsapp.sendTextMessage({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
      });

      return c.json({
        data: response,
      });
    }
  );

  app.post(
    "/send-image",
    requestValidator(
      "json",
      sendMessageSchema.merge(
        z.object({
          image_url: z.string(),
        })
      )
    ),
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

      await whatsapp.sendTyping({
        sessionId: payload.session,
        to: payload.to,
        duration: Math.min(5000, payload.text.length * 100),
        isGroup: payload.is_group,
      });

      const response = await whatsapp.sendImage({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
        media: payload.image_url,
        isGroup: payload.is_group,
      });

      return c.json({
        data: response,
      });
    }
  );
  app.post(
    "/send-document",
    requestValidator(
      "json",
      sendMessageSchema.merge(
        z.object({
          document_url: z.string(),
          document_name: z.string(),
        })
      )
    ),
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

      await whatsapp.sendTyping({
        sessionId: payload.session,
        to: payload.to,
        duration: Math.min(5000, payload.text.length * 100),
        isGroup: payload.is_group,
      });

      const response = await whatsapp.sendDocument({
        sessionId: payload.session,
        to: payload.to,
        text: payload.text,
        media: payload.document_url,
        filename: payload.document_name,
        isGroup: payload.is_group,
      });

      return c.json({
        data: response,
      });
    }
  );

  app.post(
    "/send-sticker",
    requestValidator(
      "json",
      sendMessageSchema.merge(
        z.object({
          image_url: z.string(),
        })
      )
    ),
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

      const response = await whatsapp.sendSticker({
        sessionId: payload.session,
        to: payload.to,
        media: payload.image_url,
        isGroup: payload.is_group,
      });

      return c.json({
        data: response,
      });
    }
  );

  return app;
};
