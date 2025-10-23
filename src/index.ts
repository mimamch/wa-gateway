import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import moment from "moment";
import { globalErrorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notfound.middleware";
import { serve } from "@hono/node-server";
import { env } from "./env";
import { createSessionController } from "./controllers/session";
import * as whastapp from "wa-multi-session";
import { createMessageController } from "./controllers/message";
import { CreateWebhookProps } from "./webhooks";
import { createWebhookMessage } from "./webhooks/message";
import { createWebhookSession } from "./webhooks/session";
import { createProfileController } from "./controllers/profile";
import { serveStatic } from "@hono/node-server/serve-static";
import { createAdminController } from "./controllers/admin";
import { createDashboardController } from "./controllers/dashboard";
// Initialize database
import "./database/db";



type Variables = {
  user: User;
};

const app = new Hono<{ Variables: Variables }>();

app.use(
  logger((...params) => {
    params.map((e) => console.log(`${moment().toISOString()} | ${e}`));
  })
);
app.use(cors());

app.onError(globalErrorMiddleware);
app.notFound(notFoundMiddleware);

/**
 * Welcome page
 */
app.get("/", (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp Gateway</title>
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
            padding: 60px 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 600px;
        }
        
        h1 {
            color: #333;
            font-size: 36px;
            margin-bottom: 20px;
        }
        
        .emoji {
            font-size: 64px;
            margin-bottom: 20px;
        }
        
        p {
            color: #666;
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .button {
            padding: 15px 30px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        .button-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .button-secondary {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }
        
        .features {
            margin-top: 40px;
            padding-top: 40px;
            border-top: 2px solid #f0f0f0;
            text-align: left;
        }
        
        .feature {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .feature-icon {
            font-size: 24px;
            margin-right: 10px;
        }
        
        .feature-text {
            color: #555;
            font-size: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="emoji">📱</div>
        <h1>WhatsApp Gateway</h1>
        <p>Multi-user WhatsApp API Gateway with session management</p>
        
        <div class="buttons">
            <a href="/dashboard" class="button button-primary">Go to Dashboard</a>
            <a href="/admin" class="button button-secondary">Admin Panel</a>
        </div>
        
        <div class="features">
            <div class="feature">
                <span class="feature-icon">✅</span>
                <span class="feature-text">Multi-user support with authentication</span>
            </div>
            <div class="feature">
                <span class="feature-icon">✅</span>
                <span class="feature-text">Individual QR code generation per user</span>
            </div>
            <div class="feature">
                <span class="feature-icon">✅</span>
                <span class="feature-text">Session isolation and management</span>
            </div>
            <div class="feature">
                <span class="feature-icon">✅</span>
                <span class="feature-text">Admin panel for user management</span>
            </div>
            <div class="feature">
                <span class="feature-icon">✅</span>
                <span class="feature-text">Send text, images, and documents</span>
            </div>
        </div>
    </div>
</body>
</html>
  `);
});

/**
 * serve media message static files
 */
app.use(
  "/media/*",
  serveStatic({
    root: "./",
  })
);

/**
 * dashboard routes
 */
app.route("/dashboard", createDashboardController());
/**
 * admin routes
 */
app.route("/admin", createAdminController());
/**
 * session routes
 */
app.route("/session", createSessionController());
/**
 * message routes
 */
app.route("/message", createMessageController());
/**
 * profile routes
 */
app.route("/profile", createProfileController());

const port = env.PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

whastapp.onConnected((session) => {
  console.log(`session: '${session}' connected`);
});

// Implement Per-User Webhook
import { User, userDb } from "./database/db";
import axios from "axios";
import { MessageReceived } from "wa-multi-session";
import { messageStore } from "./utils/message-store";

// Helper function to get callback URL for a session
const getCallbackForSession = (sessionName: string): string | null => {
  const user = userDb.getUserBySessionName(sessionName);
  return user?.callback_url || null;
};

// Message webhook with per-user callbacks
whastapp.onMessageReceived(async (message: MessageReceived) => {
  // Store message for later retrieval (for quoting/replying)
  messageStore.storeMessage(message);

  if (message.key.fromMe || message.key.remoteJid?.includes("broadcast"))
    return;

  const callbackUrl = getCallbackForSession(message.sessionId);
  if (!callbackUrl) {
    console.log(`No callback URL configured for session: ${message.sessionId}`);
    return;
  }

  const endpoint = `${callbackUrl}`;

  
  const body = {
    session: message.sessionId,
    from: message.key.remoteJid ?? null,
    messageId: message.key.id,
    message:
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      message.message?.imageMessage?.caption ||
      message.message?.videoMessage?.caption ||
      message.message?.documentMessage?.caption ||
      message.message?.contactMessage?.displayName ||
      message.message?.locationMessage?.comment ||
      message.message?.liveLocationMessage?.caption ||
      null,
    media: {
      image: null, // TODO: implement media handling
      video: null,
      document: null,
      audio: null,
    },
  };

  console.log(body)
  
  axios.post(endpoint, body).catch((error) => {
    console.error(`Failed to send webhook to ${endpoint}:`, error.message);
  });
});

// Session webhook with per-user callbacks
const sendSessionWebhook = (sessionName: string, status: "connected" | "connecting" | "disconnected") => {
  const callbackUrl = getCallbackForSession(sessionName);
  if (!callbackUrl) {
    return;
  }

  const endpoint = `${callbackUrl}/session`;
  const body = {
    session: sessionName,
    status: status,
  };
  
  axios.post(endpoint, body).catch((error) => {
    console.error(`Failed to send session webhook to ${endpoint}:`, error.message);
  });
};

whastapp.onConnected((session) => {
  console.log(`session: '${session}' connected`);
  sendSessionWebhook(session, "connected");
});

whastapp.onConnecting((session) => {
  console.log(`session: '${session}' connecting`);
  sendSessionWebhook(session, "connecting");
});

whastapp.onDisconnected((session) => {
  console.log(`session: '${session}' disconnected`);
  sendSessionWebhook(session, "disconnected");
});

// Legacy webhook support (if WEBHOOK_BASE_URL is set, also send to that endpoint)
if (env.WEBHOOK_BASE_URL) {
  console.log(`Legacy webhook enabled: ${env.WEBHOOK_BASE_URL}`);
}
// End Implement Per-User Webhook

whastapp.loadSessionsFromStorage();
