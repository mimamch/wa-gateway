import { MessageReceived } from "wa-multi-session";
import { CreateWebhookProps, webhookClient } from ".";

type WebhookMessageBody = {
  session: string;
  from: string | null;
  message: string | null;
};

export const createWebhookMessage =
  (props: CreateWebhookProps) => async (message: MessageReceived) => {
    if (message.key.fromMe || message.key.remoteJid?.includes("broadcast"))
      return;

    const endpoint = `${props.baseUrl}/message`;

    const body = {
      session: message.sessionId,
      from: message.key.remoteJid ?? null,
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
    } satisfies WebhookMessageBody;
    webhookClient.post(endpoint, body).catch(console.error);
  };
