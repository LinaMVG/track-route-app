import 'dotenv/config';
import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import { logger } from "../../shared/logger";
import { ROUTE_STATUSES, VECHICLE_TYPES } from "../../domain/objects/RouteStatus";

interface RouteCSV {
    origin_city: string;
    destination_city: string;
    distance_km: string;
    estimated_time_hours: string;
    vehicle_type: string;
    carrier: string;
    cost_usd: string;
    status: string;
}

async function seed(): Promise<void> {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Bcrypt cost 12 — política de seguridad Davivienda (regla 2)
        const adminHash    = await bcrypt.hash("Admin2024!", 12);
        const operadorHash = await bcrypt.hash("Operador2024!", 12);

        await client.query(
            `INSERT INTO users (username, email, password, role)
             VALUES
               ('admin',     'admin@routemanager.local',    $1, 'ADMIN'),
               ('operador1', 'operador1@routemanager.local', $2, 'OPERADOR')
             ON CONFLICT (username) DO NOTHING`,
            [adminHash, operadorHash],
        );
        logger.info("Usuarios seed insertados");

        const csvPath = join(__dirname, "../../../../dataset/routes_dataset.csv");
        const csvData = readFileSync(csvPath, "utf-8");

        const rows = parse(csvData, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as RouteCSV[];

        let inserted = 0;
        let skipped  = 0;

        for (const row of rows) {
            if (!VECHICLE_TYPES.includes(row.vehicle_type as never)) {
                logger.warn({ vehicle_type: row.vehicle_type }, "vehicle_type inválido — omitido");
                skipped++;
                continue;
            }
            if (!ROUTE_STATUSES.includes(row.status as never)) {
                logger.warn({ status: row.status }, "status inválido — omitido");
                skipped++;
                continue;
            }

            await client.query(
                `INSERT INTO routes
                   (origin_city, destination_city, distance_km, estimated_time_hours,
                    vehicle_type, carrier, cost, status)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                 ON CONFLICT DO NOTHING`,
                [
                    row.origin_city,
                    row.destination_city,
                    row.distance_km         ? parseFloat(row.distance_km)         : null,
                    row.estimated_time_hours ? parseFloat(row.estimated_time_hours) : null,
                    row.vehicle_type,
                    row.carrier,
                    parseFloat(row.cost_usd),
                    row.status,
                ],
            );
            inserted++;
        }

        await client.query("COMMIT");
        logger.info({ inserted, skipped }, "Seed completado");
    } catch (error) {
        await client.query("ROLLBACK");
        logger.error({ error }, "Error en seed — rollback ejecutado");
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

seed().catch((error) => {
    logger.error({ error }, "Proceso de seed falló");
    process.exit(1);
});