import { Hono } from "hono";
import { basicAuthMiddleware, adminAuthMiddleware } from "../middlewares/auth.middleware";
import { requestValidator } from "../middlewares/validation.middleware";
import { z } from "zod";
import { userDb, User } from "../database/db";
import { HTTPException } from "hono/http-exception";
import { readFileSync } from "fs";
import { join } from "path";


type Variables = {
  user: User;
};

export const createAdminController = () => {
  const app = new Hono<{ Variables: Variables }>();

  // Apply basic auth to all admin routes
  app.use("*", basicAuthMiddleware());
  app.use("*", adminAuthMiddleware());

  // Get all users
  app.get("/users", async (c) => {
    const users = userDb.getAllUsers();
    // Remove password from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    return c.json({
      data: sanitizedUsers,
    });
  });

  // Create new user
  const createUserSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(4),
  });

  app.post(
    "/users",
    requestValidator("json", createUserSchema),
    async (c) => {
      const payload = c.req.valid("json");

      // Check if user already exists
      const existingUser = userDb.getUserByUsername(payload.username);
      if (existingUser) {
        throw new HTTPException(400, {
          message: "Username already exists",
        });
      }

      const user = userDb.createUser(payload.username, payload.password);
      const { password, ...sanitizedUser } = user;

      return c.json({
        data: sanitizedUser,
      });
    }
  );

  // Update user password
  const updatePasswordSchema = z.object({
    password: z.string().min(4),
  });

  app.put(
    "/users/:id/password",
    requestValidator("json", updatePasswordSchema),
    async (c) => {
      const userId = parseInt(c.req.param("id"));
      const payload = c.req.valid("json");

      const user = userDb.getUserById(userId);
      if (!user) {
        throw new HTTPException(404, {
          message: "User not found",
        });
      }

      if (user.is_admin === 1) {
        throw new HTTPException(400, {
          message: "Cannot change admin password through this endpoint",
        });
      }

      userDb.updateUserPassword(userId, payload.password);

      return c.json({
        data: {
          message: "Password updated successfully",
        },
      });
    }
  );

  // Update user session configuration
  const updateSessionConfigSchema = z.object({
    session_name: z.string().optional(),
    callback_url: z.string().url().optional().nullable(),
  });

  app.put(
    "/users/:id/session-config",
    requestValidator("json", updateSessionConfigSchema),
    async (c) => {
      const userId = parseInt(c.req.param("id"));
      const payload = c.req.valid("json");

      const user = userDb.getUserById(userId);
      if (!user) {
        throw new HTTPException(404, {
          message: "User not found",
        });
      }

      if (user.is_admin === 1) {
        throw new HTTPException(400, {
          message: "Cannot update admin session configuration",
        });
      }

      if (payload.session_name !== undefined) {
        userDb.updateUserSessionName(userId, payload.session_name);
      }

      if (payload.callback_url !== undefined) {
        userDb.updateUserCallbackUrl(userId, payload.callback_url);
      }

      return c.json({
        data: {
          message: "Session configuration updated successfully",
        },
      });
    }
  );

  // Delete user
  app.delete("/users/:id", async (c) => {
    const userId = parseInt(c.req.param("id"));

    const user = userDb.getUserById(userId);
    if (!user) {
      throw new HTTPException(404, {
        message: "User not found",
      });
    }

    if (user.is_admin === 1) {
      throw new HTTPException(400, {
        message: "Cannot delete admin user",
      });
    }

    userDb.deleteUser(userId);

    return c.json({
      data: {
        message: "User deleted successfully",
      },
    });
  });

  // Admin UI
  app.get("/", async (c) => {
    const htmlPath = join(__dirname, "../views/admin.html");
    const htmlContent = readFileSync(htmlPath, "utf-8");
    return c.html(htmlContent);
  });

  return app;
};
