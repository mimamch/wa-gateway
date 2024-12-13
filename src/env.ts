import "dotenv/config";
import { z } from "zod";

export const env = z
  .object({
    NODE_ENV: z.enum(["DEVELOPMENT", "PRODUCTION"]).default("DEVELOPMENT"),
    KEY: z.string().default("your-api-key-here"),
    PORT: z
      .string()
      .default("5001")
      .transform((e) => Number(e)),
  })
  .parse(process.env);
