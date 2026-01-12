import { SQLiteAdapter, Whatsapp } from "wa-multi-session";
import { createWebhookSession } from "./webhooks/session";
import { env } from "./env";
import { CreateWebhookProps } from "./webhooks";
import { createWebhookMessage } from "./webhooks/message";

export const whatsappStatuses = new Map<
  string,
  {
    status: "connecting" | "connected" | "disconnected";
    details?: {
      name?: string;
      phoneNumber?: string;
    };
  }
>();

const webhookProps: CreateWebhookProps = {
  baseUrl: env.WEBHOOK_BASE_URL,
};

const webhookSession = createWebhookSession(webhookProps);

const webhookMessage = createWebhookMessage(webhookProps);

export const whatsapp = new Whatsapp({
  adapter: new SQLiteAdapter(),

  onConnecting(sessionId) {
    whatsappStatuses.set(sessionId, {
      details: whatsappStatuses.get(sessionId)?.details,
      status: "connecting",
    });

    console.log(`[${sessionId}] connecting`);
    webhookSession({ session: sessionId, status: "connecting" });
  },
  async onConnected(sessionId) {
    const session = await whatsapp.getSessionById(sessionId);
    const user = session?.sock?.user;

    whatsappStatuses.set(sessionId, {
      status: "connected",
      details: {
        name: user?.name || "",
        phoneNumber: user?.id?.split(":")[0] || "",
      },
    });

    console.log(`[${sessionId}] connected`);
    webhookSession({ session: sessionId, status: "connected" });
  },
  onDisconnected(sessionId) {
    whatsappStatuses.set(sessionId, {
      details: whatsappStatuses.get(sessionId)?.details,
      status: "disconnected",
    });

    console.log(`[${sessionId}] disconnected`);
    webhookSession({ session: sessionId, status: "disconnected" });
  },

  onMessageReceived: webhookMessage,
});
