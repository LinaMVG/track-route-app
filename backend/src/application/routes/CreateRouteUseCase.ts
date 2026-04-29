import { IRouteRepository } from '../../domain/ports/IRouteRepository';
import { Route, CreateRouteDTO } from '../../domain/entities/Route';

export class CreateRouteUseCase {
    constructor(private readonly routeRepo: IRouteRepository){}

    async execute(data: CreateRouteDTO): Promise<Route> {
        return this.routeRepo.create(data);
    }
}