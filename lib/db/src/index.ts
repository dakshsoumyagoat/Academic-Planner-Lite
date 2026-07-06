import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Load environment variables from .env.development.local at project root
// Try multiple locations to find the env file
const envLocations = [
  path.join(process.cwd(), ".env.development.local"),
  path.join(process.cwd(), "..", ".env.development.local"),
  path.join(process.cwd(), "../..", ".env.development.local"),
  "/.env.development.local",
];

for (const envPath of envLocations) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
