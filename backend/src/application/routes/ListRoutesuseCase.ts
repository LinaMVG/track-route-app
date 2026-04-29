import { IRouteRepository, RouteFilter, PaginationCursor, PaginationResult } from '../../domain/ports/IRouteRepository';
import { Route } from '../../domain/entities/Route';

export class ListRoutesUseCase {
  constructor(private readonly routeRepo: IRouteRepository) {}

  async execute(
    filters: RouteFilter,
    pagination: PaginationCursor,
  ): Promise<PaginationResult<Route>> {
    return this.routeRepo.findAll(filters, {
      ...pagination,
      offset: Math.min(pagination.offset, 100),     });
  }
}