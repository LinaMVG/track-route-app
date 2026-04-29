import { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { CreateRouteSchema, UpdateRouteSchema, RouteFiltersSchema } from '../schemas/route.schema';
import { PostgressRouteRepository } from '../../../infraestructure/db/PostgressRouteRepository';
import { ListRoutesUseCase }    from '../../../application/routes/ListRoutesuseCaseistRoutesuseCase';
import { CreateRouteUseCase }   from '../../../application/routes/CreateRouteUseCase';
import { DisableRouteUseCase }   from '../../../application/routes/DisableRouteUseCase';
import { UpdateRouteUseCase }   from '../../../application/routes/UpdateRouteUseCase';
import { GetRouteByIdUseCase }  from '../../../application/routes/GetRouteByIdUseCase';

/**
 * @description CRUD de rutas de envío
 *
 * GET    /api/routes            — Listar con paginación y filtros (OPERADOR, ADMIN)
 * GET    /api/routes/:id        — Obtener una ruta por ID (OPERADOR, ADMIN)
 * POST   /api/routes            — Crear ruta (ADMIN)
 * PUT    /api/routes/:id        — Editar ruta (ADMIN)
 * PATCH  /api/routes/:id/disable — Inhabilitar ruta / soft delete (ADMIN)
 */
export async function routeRoutes(
  app: FastifyInstance,
  options: { pool: Pool },
): Promise<void> {
  const repo = new PostgressRouteRepository(options.pool);

  // ── GET /api/routes ───────────────────────────────────────────────────────
  app.get(
    '/',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const filters = RouteFiltersSchema.parse(request.query);

      const useCase = new ListRoutesUseCase(repo);
      const result = await useCase.execute(
        {
          originCity:      filters.originCity,
          destinationCity: filters.destinationCity,
          vehicleType:     filters.vehicleType,
          status:          filters.status,
          carrier:         filters.carrier,
          dateFrom:        filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          dateTo:          filters.dateTo   ? new Date(filters.dateTo)   : undefined,
        },
        { cursor: filters.cursor, limit: filters.limit },
      );

      reply.status(200).send({ success: true, ...result });
    },
  );

  // ── GET /api/routes/:id ───────────────────────────────────────────────────
  app.get(
    '/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const useCase = new GetRouteByIdUseCase(repo);
      const route = await useCase.execute(id);
      reply.status(200).send({ success: true, data: route });
    },
  );

  // ── POST /api/routes ──────────────────────────────────────────────────────
  app.post(
    '/',
    { preHandler: [requireAuth, requireRole('ADMIN')] },
    async (request, reply) => {
      const input = CreateRouteSchema.parse(request.body);
      const useCase = new CreateRouteUseCase(repo);
      const route = await useCase.execute({
        ...input,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        estimatedAt: input.estimatedAt ? new Date(input.estimatedAt) : undefined,
      });
      reply.status(201).send({ success: true, data: route });
    },
  );

  // ── PUT /api/routes/:id ───────────────────────────────────────────────────
  app.put(
    '/:id',
    { preHandler: [requireAuth, requireRole('ADMIN')] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const input = UpdateRouteSchema.parse(request.body);
      const useCase = new UpdateRouteUseCase(repo);
      const route = await useCase.execute(id, {
        ...input,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        estimatedAt: input.estimatedAt ? new Date(input.estimatedAt) : undefined,
      });
      reply.status(200).send({ success: true, data: route });
    },
  );

  // ── PATCH /api/routes/:id/disable — soft delete ───────────────────────────
  app.patch(
    '/:id/disable',
    { preHandler: [requireAuth, requireRole('ADMIN')] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const useCase = new DisableRouteUseCase(repo);
      const route = await useCase.execute(id);
      reply.status(200).send({ success: true, data: route });
    },
  );
}