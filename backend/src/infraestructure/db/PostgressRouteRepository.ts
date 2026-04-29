import { Pool } from "pg";
import { Route, CreateRouteDTO, UpdateRouteDTO } from "@domain/entities/Route";
import {
  IRouteRepository,
  RouteFilter,
  PaginationCursor,
  PaginationResult,
} from "@domain/ports/IRouteRepository";
import { AppError } from "@shared/errors/appError";

function mapRowToRoute(row: Record<string, unknown>): Route {
  return {
      id:                  row.id as string,
      originCity:          row.origin_city as string,
      destinationCity:     row.destination_city as string,
      vehicleType:         row.vehicle_type as Route["vehicleType"],
      status:              row.status as Route["status"],
      carrier:             row.carrier as string,
      cost:                Number(row.cost),
      distanceKm:          row.distance_km != null ? Number(row.distance_km) : undefined,
      estimatedTimeHours:  row.estimated_time_hours != null ? Number(row.estimated_time_hours) : undefined,
      region:              row.region as string | undefined,
      scheduledAt:         row.scheduled_at ? new Date(row.scheduled_at as string) : undefined,
      estimatedAt:         row.estimated_at ? new Date(row.estimated_at as string) : undefined,
      isEnabled:           row.is_enabled as boolean,
      createdBy:           row.created_by as string | undefined,
      createdAt:           new Date(row.created_at as string),
      updatedAt:           new Date(row.updated_at as string),
    };
}

function encodeCursor(route: Route): string {
  return Buffer.from(`${route.createdAt.toISOString()}|${route.id}`).toString('base64');
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [iso, id] = decoded.split('|');
    return { createdAt: new Date(iso), id };
}

export class PostgressRouteRepository implements IRouteRepository {
    constructor(private pool: Pool) {}
    async delete(id: string): Promise<Route> {
        const result = await this.pool.query(
            `DELETE FROM routes WHERE id = $1 RETURNING *`,
            [id]
        );
        if (result.rowCount === 0) {
            throw AppError.notFound(`Ruta con id ${id} no encontrada`);
        }
        return mapRowToRoute(result.rows[0]);
    }

    async findAll(filter: RouteFilter, pagination: PaginationCursor): Promise<PaginationResult<Route>> {
        const conditions: string[] = ['r.is_enabled = true'];
        const params : unknown[] = [];
        let paramIndex = 1;

        if (filter.originCity) {
            conditions.push(`r.origin_city ILIKE $${paramIndex++}`);
            params.push(`%${filter.originCity}%`);
        }

        if (filter.destinationCity) {
            conditions.push(`r.destination_city ILIKE $${paramIndex++}`);
            params.push(`%${filter.destinationCity}%`);
        }
        if (filter.vehicleType) {
            conditions.push(`r.vehicle_type = $${paramIndex++}`);
            params.push(filter.vehicleType);
        }
        if (filter.carrier) {
            conditions.push(`r.carrier ILIKE $${paramIndex++}`);
            params.push(`%${filter.carrier}%`);
        }
        if (filter.status) {
            conditions.push(`r.status = $${paramIndex++}`);
            params.push(filter.status);
        }

        if (pagination.cursor) {
            const { createdAt, id } = decodeCursor(pagination.cursor);
            conditions.push(`(r.created_at < $${paramIndex} OR (r.created_at = $${paramIndex} AND r.id < $${paramIndex + 1}))`);
            params.push(createdAt, id);
            paramIndex += 2;
        }

        const where = conditions.join(' AND ');
        const limit = pagination.offset ;
        
        const query = `SELECT r.* FROM routes r WHERE ${where} ORDER BY r.created_at DESC, r.id DESC LIMIT $${paramIndex}`;
        params.push(limit +1);

        const countConditions = conditions.filter(cond => !cond.includes('r.created_at') && !cond.includes('r.id'));
        const countQuery = `SELECT COUNT(*) FROM routes r WHERE ${countConditions.join(' AND ')}`;
        const countParams = params.slice(0, params.length - 1);
    
        const [dataResult, countResult] = await Promise.all([
            this.pool.query(query, params),
            this.pool.query(countQuery, countParams)
        ])

        const rows = dataResult.rows;
        const hasNextPage = rows.length > limit;
        if (hasNextPage) rows.pop();

        const routes = rows.map(mapRowToRoute);
        const nextCursor = hasNextPage && routes.length > 0
        ? encodeCursor(routes[routes.length - 1])
        : undefined;

    return {
      data: routes,
      nextCursor,
      total: countResult.rows[0]?.total ?? 0,
    };
  }

  async findById(id: string): Promise<Route | null> {
    const result = await this.pool.query(
      'SELECT * FROM routes WHERE id = $1 LIMIT 1',
      [id],
    );
    if (result.rowCount === 0) return null;
    return mapRowToRoute(result.rows[0]);
  }

  async findActive(): Promise<Route[]> {
    const result = await this.pool.query(
      `SELECT * FROM routes WHERE status    = 'ACTIVA' AND is_enabled = TRUE ORDER BY created_at DESC`,
    );
    return result.rows.map(mapRowToRoute);
  }

  async create(data: CreateRouteDTO): Promise<Route> {
    const result = await this.pool.query(
      `INSERT INTO routes
         (origin_city, destination_city, vehicle_type, status, carrier,
          cost, distance_km, region, scheduled_at, estimated_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        data.originCity,
        data.destinationCity,
        data.vehicleType,
        data.status,
        data.carrier,
        data.cost,
        data.distanceKm ?? null
      ],
    );
    return mapRowToRoute(result.rows[0]);
  }

  async update(id: string, data: UpdateRouteDTO): Promise<Route> {
    // Construye SET dinámico solo con los campos enviados
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    const fieldMap: Record<string, string> = {
      originCity:      'origin_city',
      destinationCity: 'destination_city',
      vehicleType:     'vehicle_type',
      status:          'status',
      carrier:         'carrier',
      cost:            'cost',
      distanceKm:      'distance_km',
      region:          'region',
      scheduledAt:     'scheduled_at',
      estimatedAt:     'estimated_at',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in data) {
        fields.push(`${col} = $${idx++}`);
        params.push((data as Record<string, unknown>)[key] ?? null);
      }
    }

    if (fields.length === 0) {
      throw AppError.badRequest('No se enviaron campos para actualizar');
    }

    fields.push('updated_at = NOW()');
    params.push(id);

    const result = await this.pool.query(
      `UPDATE routes SET ${fields.join(', ')} WHERE id = $${idx} AND is_enabled = TRUE RETURNING *`,
      params,
    );

    if (result.rowCount === 0) {
      throw AppError.notFound(`Ruta con id ${id} no encontrada`);
    }
    return mapRowToRoute(result.rows[0]);
  }

  async disable(id: string): Promise<Route> {
    const result = await this.pool.query(
      `UPDATE routes SET is_enabled = FALSE, updated_at = NOW()
       WHERE id = $1 AND is_enabled = TRUE RETURNING *`,
      [id],
    );
    if (result.rowCount === 0) {
      throw AppError.notFound(`Ruta con id ${id} no encontrada o ya está inhabilitada`);
    }
    return mapRowToRoute(result.rows[0]);
  }

  async bulkCreate(routes: CreateRouteDTO[]): Promise<{ inserted: number }> {
    if (routes.length === 0) return { inserted: 0 };
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const r of routes) {
        await client.query(
          `INSERT INTO routes
             (origin_city, destination_city, vehicle_type, status, carrier,
              cost, distance_km, region, scheduled_at, estimated_at, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          [r.originCity, r.destinationCity, r.vehicleType, r.status, r.carrier,
           r.cost, r.distanceKm ?? null, ],
        );
      }
      await client.query('COMMIT');
      return { inserted: routes.length };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async countByStatus(): Promise<Record<string, number>> {
    const result = await this.pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM routes WHERE is_enabled = TRUE GROUP BY status`,
    );
    return Object.fromEntries(result.rows.map((r) => [r.status, r.count]));
  }

  async topByCost(limit: number): Promise<Route[]> {
    const result = await this.pool.query(
      `SELECT * FROM routes WHERE is_enabled = TRUE ORDER BY cost DESC LIMIT $1`,
      [limit],
    );
    return result.rows.map(mapRowToRoute);
  }

  async countByRegion(
    dateFrom?: Date,
    dateTo?: Date,
  ): Promise<Array<{ region: string; count: number }>> {
    const conditions = ['is_enabled = TRUE', 'region IS NOT NULL'];
    const params: unknown[] = [];
    let idx = 1;
    if (dateFrom) { conditions.push(`created_at >= $${idx++}`); params.push(dateFrom); }
    if (dateTo)   { conditions.push(`created_at <= $${idx++}`); params.push(dateTo); }

    const result = await this.pool.query(
      `SELECT region, COUNT(*)::int AS count
       FROM routes WHERE ${conditions.join(' AND ')}
       GROUP BY region ORDER BY count DESC`,
      params,
    );
    return result.rows.map((r) => ({ region: r.region, count: r.count }));
  }
}