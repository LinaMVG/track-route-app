import { IRouteRepository } from '../../domain/ports/IRouteRepository';
import { Route, UpdateRouteDTO } from '../../domain/entities/Route';
import { AppError } from '@shared/errors/appError';

export class UpdateRouteUseCase {
    constructor(private readonly routeRepo: IRouteRepository){}

    async execute(id: string, data: UpdateRouteDTO): Promise<Route> {
        const existing = await this.routeRepo.findById(id);
        if(!existing) throw AppError.notFound('Ruta no encontrada');

        const updated = await this.routeRepo.update(id, data);

        if (!updated) {
            throw AppError.validationError('Error al actualizar la ruta');
        }

        return updated;
    }
}