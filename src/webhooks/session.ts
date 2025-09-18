import { CreateWebhookProps, webhookClient } from ".";
import { removeAgenixMappingsForWhatsappSession } from "../utils/persistence";

type SessionStatus = "connected" | "disconnected" | "connecting";

type WebhookSessionBody = {
  session: string;
  status: SessionStatus;
};

export const createWebhookSession =
  (props: CreateWebhookProps) => async (event: WebhookSessionBody) => {
    const endpoint = `${props.baseUrl}/session`;

    const body = {
      session: event.session,
      status: event.status,
    } satisfies WebhookSessionBody;

    if (event.status === "disconnected") {
      console.log(`WhatsApp session ${event.session} disconnected. Removing related Agenix mappings.`);
      await removeAgenixMappingsForWhatsappSession(event.session);
    }

    webhookClient.post(endpoint, body).catch(console.error);
  };
