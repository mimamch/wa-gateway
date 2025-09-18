import * as whatsapp from "wa-multi-session";
import { Hono } from "hono";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import { createKeyMiddleware } from "../middlewares/key.middleware";
import { toDataURL } from "qrcode";
import { HTTPException } from "hono/http-exception";
import { whatsappAgenixAgentMap, whatsappAgenixSessionMap } from "../webhooks/message"; // Import the maps
import { saveMaps } from "../utils/persistence"; // Import saveMaps

export const createSessionController = () => {
  const app = new Hono();

  app.get("/", createKeyMiddleware(), async (c) => {
    return c.json({
      data: whatsapp.getAllSession(),
    });
  });

  const startSessionSchema = z.object({
    session: z.string(),
    agenixAgentId: z.string().optional(), // Add agenixAgentId to the schema
  });

  app.post(
    "/start",
    createKeyMiddleware(),
    requestValidator("json", startSessionSchema),
    async (c) => {
      const payload = c.req.valid("json");

      const isExist = whatsapp.getSession(payload.session);
      if (isExist) {
        // Clear existing mappings for the session before starting a new one
        if (whatsappAgenixAgentMap.has(payload.session)) {
          whatsappAgenixAgentMap.delete(payload.session);
          console.log(`[createSessionController:/start] Cleared existing whatsappAgenixAgentMap for session '${payload.session}'.`);
        }
        if (whatsappAgenixSessionMap.has(payload.session)) {
          whatsappAgenixSessionMap.delete(payload.session);
          console.log(`[createSessionController:/start] Cleared existing whatsappAgenixSessionMap for session '${payload.session}'.`);
        }
        await saveMaps(); // Save the updated maps after clearing
        throw new HTTPException(400, {
          message: "Session already exist",
        });
      }

      const qr = await new Promise<string | null>(async (r) => {
        await whatsapp.startSession(payload.session, {
          onConnected: async () => { // Make onConnected an async function
            if (payload.agenixAgentId) {
              whatsappAgenixAgentMap.set(payload.session, payload.agenixAgentId);
              console.log(`[createSessionController:onConnected] Mapped WhatsApp session '${payload.session}' to Agenix agent '${payload.agenixAgentId}'.`);
              console.log(`[createSessionController:onConnected] Current whatsappAgenixAgentMap size: ${whatsappAgenixAgentMap.size}`);
              await saveMaps(); // Ensure saveMaps is awaited
            }
            r(null);
          },
          onQRUpdated(qr) {
            r(qr);
          },
          onDisconnected: async () => {
            if (whatsappAgenixAgentMap.has(payload.session)) {
              whatsappAgenixAgentMap.delete(payload.session);
              console.log(`[createSessionController:onDisconnected] Removed session '${payload.session}' from whatsappAgenixAgentMap.`);
            }
            if (whatsappAgenixSessionMap.has(payload.session)) {
              whatsappAgenixSessionMap.delete(payload.session);
              console.log(`[createSessionController:onDisconnected] Removed session '${payload.session}' from whatsappAgenixSessionMap.`);
            }
            await saveMaps();
          },
        });
      });

      if (qr) {
        return c.json({
          qr: qr,
        });
      }

      return c.json({
        data: {
          message: "Connected",
        },
      });
    }
  );
  app.get(
    "/start",
    createKeyMiddleware(),
    requestValidator("query", startSessionSchema),
    async (c) => {
      const payload = c.req.valid("query");

      const isExist = whatsapp.getSession(payload.session);
      if (isExist) {
        // Clear existing mappings for the session before starting a new one
        if (whatsappAgenixAgentMap.has(payload.session)) {
          whatsappAgenixAgentMap.delete(payload.session);
          console.log(`[createSessionController:/start] Cleared existing whatsappAgenixAgentMap for session '${payload.session}'.`);
        }
        if (whatsappAgenixSessionMap.has(payload.session)) {
          whatsappAgenixSessionMap.delete(payload.session);
          console.log(`[createSessionController:/start] Cleared existing whatsappAgenixSessionMap for session '${payload.session}'.`);
        }
        await saveMaps(); // Save the updated maps after clearing
        throw new HTTPException(400, {
          message: "Session already exist",
        });
      }

      const qr = await new Promise<string | null>(async (r) => {
        await whatsapp.startSession(payload.session, {
          onConnected() {
            r(null);
          },
          onQRUpdated(qr) {
            r(qr);
          },
          onDisconnected: async () => {
            if (whatsappAgenixAgentMap.has(payload.session)) {
              whatsappAgenixAgentMap.delete(payload.session);
              console.log(`[createSessionController:onDisconnected] Removed session '${payload.session}' from whatsappAgenixAgentMap.`);
            }
            if (whatsappAgenixSessionMap.has(payload.session)) {
              whatsappAgenixSessionMap.delete(payload.session);
              console.log(`[createSessionController:onDisconnected] Removed session '${payload.session}' from whatsappAgenixSessionMap.`);
            }
            await saveMaps();
          },
        });
      });

      if (qr) {
        return c.render(`
            <div id="qrcode"></div>

            <script type="text/javascript">
                let qr = '${await toDataURL(qr)}'
                let image = new Image()
                image.src = qr
                document.body.appendChild(image)
            </script>
            `);
      }

      return c.json({
        data: {
          message: "Connected",
        },
      });
    }
  );

  app.all("/logout", createKeyMiddleware(), async (c) => {
    const session = c.req.query().session || (await c.req.json()).session || "";
    await whatsapp.deleteSession(session);

    // Clear related data from agenix_mappings.json
    if (whatsappAgenixAgentMap.has(session)) {
      whatsappAgenixAgentMap.delete(session);
      console.log(`[createSessionController:logout] Removed session '${session}' from whatsappAgenixAgentMap.`);
    }
    // Assuming whatsappAgenixSessionMap also uses the session as a key, if not, adjust accordingly
    if (whatsappAgenixSessionMap.has(session)) {
      whatsappAgenixSessionMap.delete(session);
      console.log(`[createSessionController:logout] Removed session '${session}' from whatsappAgenixSessionMap.`);
    }
    await saveMaps(); // Save the updated maps

    return c.json({
      data: "success",
    });
  });

  return app;
};
