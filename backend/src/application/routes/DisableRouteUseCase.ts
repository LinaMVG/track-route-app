import { IRouteRepository } from '../../domain/ports/IRouteRepository';
import { Route } from '../../domain/entities/Route';
import { AppError } from '../../shared/errors/appError';

export class DisableRouteUseCase {
  constructor(private readonly routeRepo: IRouteRepository) {}

  async execute(id: string): Promise<Route> {
    const existing = await this.routeRepo.findById(id);
    if (!existing) throw AppError.notFound(`Ruta ${id} no encontrada`);
    return this.routeRepo.disable(id);
  }
}