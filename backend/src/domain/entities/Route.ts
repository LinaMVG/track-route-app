import { RouteStatus, VehicleType } from "@domain/objects/RouteStatus";

export interface Route {
    id: string;
    originCity: string;
    destinationCity: string;
    distanceKm: number;
    estimatedTimeHours: number;
    vehicleType: VehicleType;
    carrier: string;
    cost: number;
    status: RouteStatus;
    createdAt: Date;
}

export type CreateRouteDTO = Omit<Route, 'id' | 'createdAt'>;

export type UpdateRouteDTO = Partial<CreateRouteDTO>;