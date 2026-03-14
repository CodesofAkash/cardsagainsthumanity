import { defineConfig } from "@medusajs/framework/utils"

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://localhost:5432/medusa-store"

const REDIS_URL =
  process.env.REDIS_URL ||
  "redis://localhost:6379"

export default defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL,

    redisUrl: REDIS_URL,

    http: {
      storeCors:
        process.env.STORE_CORS ||
        "http://localhost:3000",

      adminCors:
        process.env.ADMIN_CORS ||
        "http://localhost:9000",

      authCors:
        process.env.AUTH_CORS ||
        "http://localhost:3000,http://localhost:9000",

      jwtSecret:
        process.env.JWT_SECRET ||
        "supersecret",

      cookieSecret:
        process.env.COOKIE_SECRET ||
        "supersecret",
    },
  },

  admin: {
    disable: false,
  },
})