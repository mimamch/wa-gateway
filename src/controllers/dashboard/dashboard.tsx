import { Hono } from "hono";
import { createDashboardMiddleware } from "../../middlewares/key.middleware";
import DashboardIndex from "../../views/dashboard";
import SessionPage from "../../views/dashboard/sessions";
import { whatsapp, whatsappStatuses } from "../../whatsapp";
import { randomUUID } from "crypto";
import CreateSessionPage from "../../views/dashboard/session-create";

const qrStore = new Map<
  string,
  {
    status: "pending" | "connecting" | "connected" | "diconnected";
    qr: string | null;
  }
>();
const qrStoreTimeouts = new Map<string, NodeJS.Timeout>();

export const createDashboardController = () => {
  const app = new Hono()
    .use(createDashboardMiddleware()) // protect all dashboard routes

    .get("/", (c) => c.redirect("/dashboard")) // redirect to /dashboard

    /**
     * dashboard routes
     * prefix: /dashboard
     */
    .basePath("/dashboard")

    .get("/", async (c) => {
      return c.render(<DashboardIndex />);
    })

    /**
     * sessions routes
     */
    .route(
      "/sessions",
      new Hono()
        .get("/", async (c) => {
          const sessions = Array.from(whatsappStatuses.entries()).map(
            ([session, status]) => ({
              session,
              ...status,
            }),
          );

          return c.render(<SessionPage sessions={sessions} />);
        })
        .get("/create/qr", async (c) => {
          const id = c.req.query("id") || "";
          const state = qrStore.get(id) || null;
          return c.json({
            ...state,
            status:
              state?.status ||
              whatsappStatuses.get(id)?.status ||
              "disconnected",
          });
        })
        .get("/create", async (c) => {
          const uuid = c.req.query("id") || randomUUID();
          const isExist = whatsappStatuses.has(uuid);

          if (!isExist) {
            await whatsapp.startSession(uuid, {
              onQRUpdated(qr) {
                qrStore.set(uuid, {
                  qr: qr,
                  status: "pending",
                });

                // Clear previous timeout if exists
                if (qrStoreTimeouts.has(uuid)) {
                  clearTimeout(qrStoreTimeouts.get(uuid)!);
                }

                // Set a timeout to delete the QR code after 1 minutes
                const timeout = setTimeout(
                  () => {
                    qrStore.delete(uuid);
                    qrStoreTimeouts.delete(uuid);
                  },
                  1 * 60 * 1000,
                ); // 1 minutes

                qrStoreTimeouts.set(uuid, timeout);
              },
              onConnecting() {
                const existing = qrStore.get(uuid);
                if (existing) {
                  qrStore.set(uuid, {
                    ...existing,
                    status: "connecting",
                  });
                }
              },
              onConnected() {
                const existing = qrStore.get(uuid);
                if (existing) {
                  qrStore.set(uuid, {
                    qr: null,
                    status: "connected",
                  });
                }

                // Clear previous timeout if exists
                if (qrStoreTimeouts.has(uuid)) {
                  clearTimeout(qrStoreTimeouts.get(uuid)!);
                }
                // Set a timeout to delete the QR code after 1 minutes
                const timeout = setTimeout(
                  () => {
                    qrStore.delete(uuid);
                    qrStoreTimeouts.delete(uuid);
                  },
                  1 * 60 * 1000,
                ); // 1 minutes

                qrStoreTimeouts.set(uuid, timeout);
              },
              onDisconnected() {
                qrStore.delete(uuid);
                if (qrStoreTimeouts.has(uuid)) {
                  clearTimeout(qrStoreTimeouts.get(uuid)!);
                  qrStoreTimeouts.delete(uuid);
                }
              },
            });
          }

          return c.render(<CreateSessionPage id={uuid} />);
        }),
    )

    /**
     * message routes
     */
    .route(
      "/messages",
      new Hono().post("/send-text-api", async (c) => {
        const { session, to, message } = await c.req.json();

        if (!session || !to || !message) {
          return c.json({ success: false, error: "Missing parameters" }, 400);
        }

        try {
          await whatsapp.sendText({
            sessionId: session,
            text: message,
            to,
          });
          return c.json({ success: true });
        } catch (error) {
          return c.json(
            { success: false, error: (error as Error).message },
            500,
          );
        }
      }),
    );

  return app;
};
