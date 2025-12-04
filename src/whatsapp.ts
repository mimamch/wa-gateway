import { SQLiteAdapter, Whatsapp } from "wa-multi-session";
import { createWebhookSession } from "./webhooks/session";
import { env } from "./env";
import { CreateWebhookProps } from "./webhooks";
import { createWebhookMessage } from "./webhooks/message";

const webhookProps: CreateWebhookProps = {
  baseUrl: env.WEBHOOK_BASE_URL,
};

const webhookSession = createWebhookSession(webhookProps);

const webhookMessage = createWebhookMessage(webhookProps);

export const whatsapp = new Whatsapp({
  adapter: new SQLiteAdapter(),
  debugLevel: "info",

  onConnecting(sessionId) {
    console.log(`[${sessionId}] connecting`);
    webhookSession({ session: sessionId, status: "connecting" });
  },
  onConnected(sessionId) {
    console.log(`[${sessionId}] connected`);
    webhookSession({ session: sessionId, status: "connected" });
  },
  onDisconnected(sessionId) {
    console.log(`[${sessionId}] disconnected`);
    webhookSession({ session: sessionId, status: "disconnected" });
  },

  onMessageReceived: webhookMessage,
});
