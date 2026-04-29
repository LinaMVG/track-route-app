import { RouteStatus, VehicleType } from '../objects/RouteStatus';

export interface Route {
    id: string;
    originCity: string;
    destinationCity: string;
    vehicleType: VehicleType;
    status: RouteStatus;
    carrier: string;
    cost: number;
    distanceKm?: number;
    estimatedTimeHours?: number;
    region?: string;
    scheduledAt?: Date;
    estimatedAt?: Date;
    isEnabled: boolean;
    createdBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type CreateRouteDTO = Omit<Route, 'id' | 'isEnabled' | 'createdAt' | 'updatedAt'>;
export type UpdateRouteDTO = Partial<CreateRouteDTO>;
