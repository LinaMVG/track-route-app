import {Pool} from "pg";
import { logger } from "./logger";

let _pool: Pool | null = null;

export function getDatabasePool(): Pool {
    if (!_pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            logger.error("DATABASE_URL environment variable is not set");
            throw new Error("DATABASE_URL environment variable is required");
            process.exit(1);
        }
        _pool = new Pool({
            connectionString,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
        });

        _pool.on('error', (err) => {
            logger.error({ error: err }, "Unexpected error on idle database client");
        });

        logger.info("Database pool created");

    }
    return _pool;
}

export async function closeDatabasePool(): Promise<void> {
    if (_pool) {
        await _pool.end();
        logger.info("Database pool closed");
    }       
}