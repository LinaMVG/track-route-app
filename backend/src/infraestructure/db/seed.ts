import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import { logger } from "../../shared/logger";
import { RouteStatus, VECHICLE_TYPES } from "../../domain/objects/RouteStatus";

interface RouteCSV {
    origin_city: string;
    destination_city: string;
    distance_km: number;
    estimated_time_hours: number;
    vehicle_type: string;
    carrier: string;
    cost_usd: number;
    status: string;
}

async function seed() :Promise<void> {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const adminHash = await bcrypt.hash("admin123", 10);
        const operadorHash = await bcrypt.hash("operator123", 10);

        await client.query(
            `INSERT INTO users (username, email, password, role) VALUES 
            ('admin','admin@example.com', $1,'ADMIN'), 
            ('operador', 'operador@example.com', $2, 'OPERADOR')
            ON CONFLICT (username) DO NOTHING`,
            [adminHash, operadorHash]
        );

        logger.info("Users seeded successfully");

        const csvPath = join(__dirname, "../../dataset/routes_dataset.csv");
        const csvData = readFileSync(csvPath, "utf-8");

        const rows = parse(csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as RouteCSV[];

        let inserted = 0;
        let skipped = 0;

        for (const row of rows) {
            if (!VECHICLE_TYPES.includes(row.vehicle_type as any) ) {
                logger.warn({ row }, "Skipping invalid route data: ${row.vehicle_type}");
                skipped++;
                continue;
            }
            if (!RouteStatus.includes(row.status as never)) {
                logger.warn({ row }, "Skipping invalid route data: ${row.status}");
                skipped++;
                continue;
            }

            await client.query(
                `INSERT INTO routes (origin_city, destination_city, distance_km, estimated_time_hours, vehicle_type, carrier, cost_usd, status) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT DO NOTHING`,
                [row.origin_city, row.destination_city, row.distance_km ? parseFloat(row.distance_km.toString()) : null, row.estimated_time_hours, row.vehicle_type, row.carrier, parseFloat(row.cost_usd.toString()), row.status]
            );
            inserted++;
        }

        await client.query("COMMIT");
        logger.info(`Seeding completed: ${inserted} routes inserted, ${skipped} routes skipped due to invalid data`);
    } catch (error) {
        logger.error({ error }, "Error during seeding - rolling back");
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
        await pool.end();
    }  
}

seed().catch((error) => {
    logger.error({ error }, "Seeding process failed");
    process.exit(1);
});