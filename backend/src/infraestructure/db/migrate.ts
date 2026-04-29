import { readFileSync } from "fs";
import { join } from "path";
import { Pool } from "pg";
import { logger } from "../shared/logger";

async function runMigrations(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const migrations = [
    "001_create_users.sql",
    "002_create_routes.sql",
    "003_create_indexes.sql",
  ];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const file of migrations) { 
        const filePath = join(__dirname, "migrations", file);
        const sql = readFileSync(filePath, "utf-8");
        logger.info({ migration: file }, "Running migration");
        await client.query(sql);
     }
    await client.query("COMMIT");
    logger.info("Migrations completed successfully");

  }catch (error) {
    logger.error({ error }, "Error running migrations - rolling back");
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((error) => {
  logger.error({ error }, "Migration process failed");
  process.exit(1);
});
