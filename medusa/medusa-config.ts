export default {
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,  // reads from Render env var directly
    http: {
      adminCors:  process.env.ADMIN_CORS  || "http://localhost:9000",
      authCors:   process.env.AUTH_CORS   || "http://localhost:9000",
      storeCors:  process.env.STORE_CORS  || "http://localhost:8000",
      jwtSecret:  process.env.JWT_SECRET  || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
};