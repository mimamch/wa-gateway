import * as whatsapp from "wa-multi-session";
import { Hono } from "hono";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import { createKeyMiddleware } from "../middlewares/key.middleware";
import { toDataURL } from "qrcode";
import { HTTPException } from "hono/http-exception";
import { basicAuthMiddleware } from "../middlewares/auth.middleware";
import type { User } from "../database/db";

export const createSessionController = () => {
  const app = new Hono();

  // Apply basic auth to all session routes
  app.use("*", basicAuthMiddleware());

  app.get("/", async (c) => {
    const user = c.get("user") as User;
    const allSessions = whatsapp.getAllSession();
    
    // Admin can see all sessions, regular users only see their own
    if (user.is_admin === 1) {
      return c.json({
        data: allSessions,
      });
    }
    
    // Filter sessions for current user
    const userSessions = allSessions.filter((session) => 
      session.startsWith(user.username + "_")
    );
    
    return c.json({
      data: userSessions,
    });
  });

  const startSessionSchema = z.object({
    session: z.string(),
  });

  app.post(
    "/start",
    requestValidator("json", startSessionSchema),
    async (c) => {
      const payload = c.req.valid("json");
      const user = c.get("user") as User;

      // Add username prefix to session name for non-admin users
      const sessionName = user.is_admin === 1 
        ? payload.session 
        : user.username + "_" + payload.session;

      const isExist = whatsapp.getSession(sessionName);
      if (isExist) {
        throw new HTTPException(400, {
          message: "Session already exist",
        });
      }

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
        return c.json({
          qr: qr,
          session: sessionName,
        });
      }

      return c.json({
        data: {
          message: "Connected",
          session: sessionName,
        },
      });
    }
  );
  app.get(
    "/start",
    requestValidator("query", startSessionSchema),
    async (c) => {
      const payload = c.req.valid("query");
      const user = c.get("user") as User;

      // Add username prefix to session name for non-admin users
      const sessionName = user.is_admin === 1 
        ? payload.session 
        : user.username + "_" + payload.session;

      const isExist = whatsapp.getSession(sessionName);
      if (isExist) {
        throw new HTTPException(400, {
          message: "Session already exist",
        });
      }

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
        return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp QR Code - ${sessionName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 24px;
        }
        
        .session-name {
            color: #667eea;
            font-weight: 600;
            margin-bottom: 20px;
        }
        
        .instructions {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        #qrcode {
            margin: 20px auto;
        }
        
        #qrcode img {
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .footer {
            margin-top: 30px;
            color: #999;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📱 Scan QR Code</h1>
        <div class="session-name">Session: ${sessionName}</div>
        <div class="instructions">
            1. Open WhatsApp on your phone<br>
            2. Go to Settings → Linked Devices<br>
            3. Tap "Link a Device"<br>
            4. Scan this QR code
        </div>
        <div id="qrcode"></div>
        <div class="footer">Keep this window open until connected</div>
    </div>
    
    <script type="text/javascript">
        let qr = '${await toDataURL(qr)}'
        let image = new Image()
        image.src = qr
        document.getElementById('qrcode').appendChild(image)
    </script>
</body>
</html>
            `);
      }

      return c.json({
        data: {
          message: "Connected",
          session: sessionName,
        },
      });
    }
  );

  app.all("/logout", async (c) => {
    const user = c.get("user") as User;
    const sessionParam = c.req.query().session || (await c.req.json()).session || "";
    
    // For non-admin users, ensure they can only delete their own sessions
    if (user.is_admin !== 1 && !sessionParam.startsWith(user.username + "_")) {
      throw new HTTPException(403, {
        message: "You can only delete your own sessions",
      });
    }
    
    await whatsapp.deleteSession(sessionParam);
    return c.json({
      data: "success",
    });
  });

  return app;
};
