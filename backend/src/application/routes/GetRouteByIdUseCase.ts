import { IRouteRepository } from '../../domain/ports/IRouteRepository';
import { Route } from '../../domain/entities/Route';
import { AppError } from '@shared/errors/appError';

export class GetRouteByIdUseCase {
    constructor(private readonly routeRepo: IRouteRepository){}

    async execute(id: string): Promise<Route> {
        const route = await this.routeRepo.findById(id);
        if(!route) throw AppError.notFound('Ruta no encontrada');
        return route;
    }
}