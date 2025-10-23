import { Hono } from "hono";
import { basicAuthMiddleware } from "../middlewares/auth.middleware";
import type { User } from "../database/db";
import * as whatsapp from "wa-multi-session";
import { toDataURL } from "qrcode";
import { HTTPException } from "hono/http-exception";
import { userDb } from "../database/db";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";

export const createDashboardController = () => {
  const app = new Hono();

  // Apply basic auth to all dashboard routes
  app.use("*", basicAuthMiddleware());

  // Update callback URL for current user
  const updateCallbackSchema = z.object({
    callback_url: z.string().url().nullable(),
  });

  app.put(
    "/callback",
    requestValidator("json", updateCallbackSchema),
    async (c) => {
      const user = c.get("user") as User;
      const payload = c.req.valid("json");

      if (user.is_admin === 1) {
        throw new HTTPException(400, {
          message: "Admin users cannot configure callbacks",
        });
      }

      userDb.updateUserCallbackUrl(user.id, payload.callback_url);

      return c.json({
        data: {
          message: "Callback URL updated successfully",
        },
      });
    }
  );

  // Get user session info
  app.get("/session-info", async (c) => {
    const user = c.get("user") as User;
    
    if (user.is_admin === 1) {
      throw new HTTPException(400, {
        message: "Admin users do not have sessions",
      });
    }

    const sessionName = user.session_name || user.username;
    const isConnected = whatsapp.getSession(sessionName) !== null;

    return c.json({
      data: {
        session_name: sessionName,
        callback_url: user.callback_url,
        is_connected: isConnected,
      },
    });
  });

  // Start/restart session
  app.post("/start-session", async (c) => {
    const user = c.get("user") as User;

    if (user.is_admin === 1) {
      throw new HTTPException(400, {
        message: "Admin users cannot create sessions",
      });
    }

    const sessionName = user.session_name || user.username;

    // Check if session already exists
    const existingSession = whatsapp.getSession(sessionName);
    if (existingSession) {
      return c.json({
        data: {
          message: "Session already connected",
          session_name: sessionName,
        },
      });
    }

    // Start new session and get QR code
    const qr = await new Promise<string | null>(async (r) => {
      await whatsapp.startSession(sessionName, {
        onConnected() {
          r(null);
        },
        onQRUpdated(qr) {
          r(qr);
        },
      });
    });

    if (qr) {
      const qrDataUrl = await toDataURL(qr);
      return c.json({
        data: {
          qr: qrDataUrl,
          session_name: sessionName,
        },
      });
    }

    return c.json({
      data: {
        message: "Session connected",
        session_name: sessionName,
      },
    });
  });

  // Disconnect session
  app.post("/disconnect-session", async (c) => {
    const user = c.get("user") as User;

    if (user.is_admin === 1) {
      throw new HTTPException(400, {
        message: "Admin users cannot disconnect sessions",
      });
    }

    const sessionName = user.session_name || user.username;
    await whatsapp.deleteSession(sessionName);

    return c.json({
      data: {
        message: "Session disconnected successfully",
      },
    });
  });

  // User dashboard home
  app.get("/", async (c) => {
    const user = c.get("user") as User;
    
    if (user.is_admin === 1) {
      return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard - WA Gateway</title>
</head>
<body style="font-family: system-ui; text-align: center; padding: 50px;">
    <h1>👋 Welcome Admin</h1>
    <p>As an administrator, you don't have a personal session.</p>
    <p><a href="/admin" style="color: #667eea; text-decoration: none; font-weight: 600;">Go to Admin Panel →</a></p>
</body>
</html>
      `);
    }
    
    const { readFileSync } = await import("fs");
    const { join } = await import("path");
    const htmlPath = join(__dirname, "../views/dashboard.html");
    let htmlContent = readFileSync(htmlPath, "utf-8");
    
    // Replace username placeholder
    htmlContent = htmlContent.replace(/__USERNAME__/g, user.username);
    
    return c.html(htmlContent);
  });

  return app;
};
