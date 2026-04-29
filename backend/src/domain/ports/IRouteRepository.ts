import { int } from 'zod';
import {Route, CreateRouteDTO, UpdateRouteDTO} from '../entities/Route';
import {RouteStatus, VehicleType} from '../objects/RouteStatus';

export interface RouteFilter {
    originCity?: string;
    destinationCity?: string;
    vehicleType?: VehicleType;
    status?: RouteStatus;
    carrier?: string;
}

export interface PaginationCursor {
    cursor?: string;
    offset: number;
}

export interface PaginationResult<T> {
    data: T[];
    nextCursor?: string;
    total: number;
}

export interface IRouteRepository {
    findAll(filter: RouteFilter, pagination: PaginationCursor): Promise<PaginationResult<Route>>;
    findById(id: string): Promise<Route | null>;
    create(routeData: CreateRouteDTO): Promise<Route>;
    update(id: string, routeData: UpdateRouteDTO): Promise<Route | null>;
    delete(id: string): Promise<Route>;

}