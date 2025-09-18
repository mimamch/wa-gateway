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
import { createAgentController } from "./controllers/agent"; // Import createAgentController
import { CreateWebhookProps } from "./webhooks";
import { createWebhookMessage, whatsappAgenixAgentMap, whatsappAgenixSessionMap } from "./webhooks/message";
import { createAgenixAgent, createAgenixSession } from "./services/agenix.service";
import { loadMaps, saveMaps, removeAgenixMappingsForWhatsappSession } from './utils/persistence';
import { createWebhookSession } from "./webhooks/session";
import { createProfileController } from "./controllers/profile";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

app.use(
  logger((...params) => {
    params.map((e) => console.log(`${moment().toISOString()} | ${e}`));
  })
);
app.use(cors());

app.onError(globalErrorMiddleware);
app.notFound(notFoundMiddleware);

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
/**
 * agent routes
 */
app.route("/agent", createAgentController());



/**
 * serve frontend static files
 */
app.use(
  "/*",
  serveStatic({
    root: "./public",
    index: "home.html", // Serve home.html as the default for the root path
  })
);

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

whastapp.onConnected(async (session) => {
  console.log(`[onConnected] WhatsApp session: '${session}' connected.`);
  // Agent creation is now handled by the frontend and mapped in createSessionController.
  // This block is primarily for logging or ensuring the mapping exists if a session reconnects
  // without going through the full frontend flow (e.g., server restart).
  // However, the createSessionController should handle the primary mapping.
  let agenixAgentId = whatsappAgenixAgentMap.get(session);
  console.log(`[index.ts:onConnected] Checking WhatsApp session '${session}'. Map state: ${agenixAgentId ? 'Found agent ' + agenixAgentId : 'Agent not found'}. Current whatsappAgenixAgentMap size: ${whatsappAgenixAgentMap.size}`);
  if (agenixAgentId) {
    console.log(`[index.ts:onConnected] Existing Agenix agent found for WhatsApp session '${session}': ${agenixAgentId}.`);
  } else {
    console.log(`[index.ts:onConnected] No Agenix agent found for WhatsApp session '${session}' at this point. Relying on frontend to establish mapping.`);
  }
});

// Implement Webhook
if (env.WEBHOOK_BASE_URL) {
  const webhookProps: CreateWebhookProps = {
    baseUrl: env.WEBHOOK_BASE_URL,
  };

  // message webhook
  whastapp.onMessageReceived(createWebhookMessage(webhookProps));

  // session webhook
  const webhookSession = createWebhookSession(webhookProps);

  whastapp.onConnected((session) => {
    console.log(`session: '${session}' connected`);
    webhookSession({ session, status: "connected" });
  });
  whastapp.onConnecting((session) => {
    console.log(`session: '${session}' connecting`);
    webhookSession({ session, status: "connecting" });
  });
  whastapp.onDisconnected((session) => {
    console.log(`session: '${session}' disconnected`);
    webhookSession({ session, status: "disconnected" });
  });
}
whastapp.onDisconnected(async (session) => {
  console.log(`[onDisconnected] WhatsApp session: '${session}' disconnected. Clearing associated data.`);
  await removeAgenixMappingsForWhatsappSession(session);
});
// End Implement Webhook

// Load existing mappings on startup
(async () => {
  await loadMaps();
  whastapp.loadSessionsFromStorage();
 
  const allSessions = whastapp.getAllSession();
 
  for (const sessionId of allSessions) {
    console.log(`[index.ts:Startup] Processing WhatsApp session: ${sessionId}. Current whatsappAgenixAgentMap size: ${whatsappAgenixAgentMap.size}`);
    let agenixAgentId = whatsappAgenixAgentMap.get(sessionId);
    if (agenixAgentId) {
      console.log(`[index.ts:Startup] Existing Agenix agent found for WhatsApp session '${sessionId}': ${agenixAgentId}.`);
    } else {
      console.log(`[index.ts:Startup] No Agenix agent found for WhatsApp session '${sessionId}' at this point. Relying on frontend to establish mapping.`);
    }
  }
})();
