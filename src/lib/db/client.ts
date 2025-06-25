import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "./schema";
import { databaseUrl } from "@/config";

export const pool = new Pool({
  connectionString: databaseUrl,
});

export const db = drizzle({ client: pool, schema });
