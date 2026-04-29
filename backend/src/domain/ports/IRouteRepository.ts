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
    findActive(): Promise<Route[]>;
    create(routeData: CreateRouteDTO): Promise<Route>;
    update(id: string, routeData: UpdateRouteDTO): Promise<Route | null>;
    disable(id: string): Promise<Route>;
    delete(id: string): Promise<Route>;
    bulkCreate(routes: CreateRouteDTO[]): Promise<{ inserted: number }>;
    countByStatus(): Promise<Record<string, number>>;
    topByCost(limit: number): Promise<Route[]>;
    countByRegion(dateFrom?: Date, dateTo?: Date): Promise<Array<{ region: string; count: number }>>;

}