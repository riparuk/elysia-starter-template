import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { openapi } from "@elysiajs/openapi";
import { OpenAPI } from "./lib/auth";
import { env } from "./lib/env";
import cors from '@elysiajs/cors'
import { healthCheck } from "./utils/health-check";

export const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )
  .use(openapi({
    documentation: {
      components: await OpenAPI.components,
      paths: await OpenAPI.getPaths()
    }
  }))
  .mount("/auth", auth.handler)

  // Health Check
  .get("/health-check", () => healthCheck())

export type App = typeof app