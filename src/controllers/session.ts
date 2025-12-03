import * as whatsapp from "wa-multi-session";
import { Hono } from "hono";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import { createKeyMiddleware } from "../middlewares/key.middleware";
import { toDataURL } from "qrcode";
import { HTTPException } from "hono/http-exception";

export const createSessionController = () => {
  const startSessionSchema = z.object({
    session: z.string(),
  });

  const app = new Hono()
    .basePath("/session")

    /**
     *
     * GET /session
     *
     */
    .get("/", createKeyMiddleware(), async (c) => {
      return c.json({
        data: whatsapp.getAllSession(),
      });
    })
    /**
     *
     * POST /session/start
     *
     */
    .post(
      "/start",
      createKeyMiddleware(),
      requestValidator("json", startSessionSchema),
      async (c) => {
        const payload = c.req.valid("json");

        const isExist = whatsapp.getSession(payload.session);
        if (isExist) {
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
    )

    /**
     *
     * GET /session/start
     *
     */
    .get(
      "/start",
      createKeyMiddleware(),
      requestValidator("query", startSessionSchema),
      async (c) => {
        const payload = c.req.valid("query");

        const isExist = whatsapp.getSession(payload.session);
        if (isExist) {
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
    )
    /**
     *
     * ALL /session/logout
     *
     */
    .all("/logout", createKeyMiddleware(), async (c) => {
      await whatsapp.deleteSession(
        c.req.query().session || (await c.req.json()).session || ""
      );
      return c.json({
        data: "success",
      });
    });

  return app;
};
