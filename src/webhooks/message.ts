import * as whatsapp from "wa-multi-session";
import { MessageReceived } from "wa-multi-session";
import { CreateWebhookProps } from ".";
import {
  createAgenixAgent,
  createAgenixSession,
  sendAgenixMessage,
} from "../services/agenix.service";
import { saveMaps } from '../utils/persistence';

// In-memory map to store the mapping between WhatsApp session ID and Agenix session ID
// In a real application, this would be persisted in a database.
export const whatsappAgenixSessionMap = new Map<string, string>(); // Maps remoteJid to Agenix session ID
export const whatsappAgenixAgentMap = new Map<string, string>(); // Maps whatsappSessionId to Agenix agent ID

export const createWebhookMessage =
  (props: CreateWebhookProps) => async (message: MessageReceived) => {
    if ( message.key.remoteJid?.includes("broadcast")) {
      return;
    }

    const whatsappSessionId = message.sessionId;
    const remoteJid = message.key.remoteJid;
    const incomingMessageContent =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      message.message?.imageMessage?.caption ||
      message.message?.videoMessage?.caption ||
      message.message?.documentMessage?.caption ||
      message.message?.contactMessage?.displayName ||
      message.message?.locationMessage?.comment ||
      message.message?.liveLocationMessage?.caption ||
      null;

    if (!incomingMessageContent || !remoteJid || !incomingMessageContent.startsWith(".")) {
      console.log("No message content or remoteJid found, skipping.");
      return;
    }

    let agenixAgentId = whatsappAgenixAgentMap.get(whatsappSessionId); // Agent is per WhatsApp multi-session instance
    let agenixSessionId = whatsappAgenixSessionMap.get(remoteJid); // Session is per WhatsApp user (remoteJid)

    try {
      // Retrieve Agenix agent for this WhatsApp session
      if (!agenixAgentId) {
        console.log(`Agenix agent not found for WhatsApp session: ${whatsappSessionId}. This should have been created on session connection.`);
        // Optionally, you could throw an error or attempt to create it here as a fallback,
        // but the primary design is to create it on onConnected.
        throw new Error(`Agenix Agent not found for WhatsApp session: ${whatsappSessionId}`);
      }

      // If no Agenix session exists for this WhatsApp session, create one
      if (!agenixSessionId) {
        console.log(`Creating new Agenix session for agent: ${agenixAgentId}`);
        const newSession = await createAgenixSession(agenixAgentId); // Create session with the agent
        agenixSessionId = newSession._id;
        whatsappAgenixSessionMap.set(remoteJid, agenixSessionId as string); // Map session to remoteJid
        console.log(`Created Agenix session with ID: ${agenixSessionId} for remoteJid: ${remoteJid}`);
        await saveMaps(); // Save mappings after creating a new session
      }

      // Ensure agenixSessionId is defined before proceeding
      if (!agenixSessionId) {
        throw new Error("Failed to obtain Agenix Session ID.");
      }

      console.log(
        `Sending message to Agenix session ${agenixSessionId}: ${incomingMessageContent}`
      );
      const agenixResponse = await sendAgenixMessage(
        agenixSessionId, // agenixSessionId is guaranteed to be a string here
        "user",
        incomingMessageContent
      );
      console.log("Received response from Agenix:", agenixResponse);

      if (agenixResponse && agenixResponse.content) {
        await whatsapp.sendTextMessage({
          sessionId: whatsappSessionId,
          to: remoteJid,
          text: agenixResponse.content,
        });
        console.log(`Sent AI response to WhatsApp user ${remoteJid}`);
      } else {
        console.log("Agenix response did not contain content.");
      }
    } catch (error) {
      console.error("Error processing WhatsApp message with Agenix:", error);
      // await whatsapp.sendTextMessage({
      //   sessionId: whatsappSessionId,
      //   to: remoteJid,
      //   text: "Sorry, I encountered an error while processing your request.",
      // });
    }
  };
