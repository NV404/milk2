import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Error: DATABASE_URL is required!");
}

export default defineConfig({
  dbCredentials: { url: DATABASE_URL },
  dialect: "postgresql",
  schema: "./@/db/schema.ts",
  out: "./@/db/migrations",
});
