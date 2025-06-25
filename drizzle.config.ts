import { databaseUrl } from "@/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "lib/db/drizzle",
  schema: "lib/db/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
