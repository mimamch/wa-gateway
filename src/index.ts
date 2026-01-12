import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import moment from "moment";
import { globalErrorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notfound.middleware";
import { serve } from "@hono/node-server";
import { env } from "./env";
import { createSessionController } from "./controllers/session";
import { createMessageController } from "./controllers/message";
import { createProfileController } from "./controllers/profile";
import { serveStatic } from "@hono/node-server/serve-static";
import { createHealthController } from "./controllers/health";
import { createAuthController } from "./controllers/dashboard/auth";
import { createDashboardController } from "./controllers/dashboard/dashboard";

const app = new Hono()
  .use(
    logger((...params) => {
      params.map((e) => console.log(`${moment().toISOString()} | ${e}`));
    })
  )
  .use(cors())

  .onError(globalErrorMiddleware)
  .notFound(notFoundMiddleware)

  /**
   * serve media message static files
   */

  .use(
    "/media/*",
    serveStatic({
      root: "./",
    })
  )
  .use(
    "/assets/*",
    serveStatic({
      root: "./",
    })
  )

  /**
   * session routes
   */
  .route("/", createSessionController())
  /**
   * message routes
   */
  .route("/", createMessageController())
  /**
   * profile routes
   */
  .route("/", createProfileController())

  /**
   * health routes
   */
  .route("/", createHealthController())

  /**
   * auth routes
   */
  .route("/", createAuthController())
  /**
   * dashboard routes
   */
  .route("/", createDashboardController());

const port = env.PORT;

serve({
  fetch: app.fetch,
  port: port,
});
