const { defineConfig } = require("@medusajs/framework/utils")

module.exports = defineConfig({
  projectConfig: {
    databaseUrl:
      process.env.DATABASE_URL ||
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",

    redisUrl: process.env.REDIS_URL,

    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000",
      authCors:
        process.env.AUTH_CORS ||
        "http://localhost:3000,http://localhost:9000",

      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
      port: parseInt(process.env.PORT || "9000"),
    },
  },

  admin: {
    disable: true,
  },
})