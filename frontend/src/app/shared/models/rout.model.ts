export type RouteStatus = 'ACTIVA' | 'INACTIVA' | 'SUSPENDIDA' | 'EN_MANTENIMIENTO';
export type VehicleType = 'CAMION' | 'TRACTOMULA' | 'FURGONETA' | 'MOTO_CARGO';

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
  scheduledAt?: string;
  estimatedAt?: string;
  isEnabled: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RouteFilters {
  originCity?: string;
  destinationCity?: string;
  vehicleType?: VehicleType;
  status?: RouteStatus;
  carrier?: string;
  dateFrom?: string;
  dateTo?: string;
  cursor?: string;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  nextCursor: string | null;
  total: number;
}

export interface CreateRoutePayload {
  originCity: string;
  destinationCity: string;
  vehicleType: VehicleType;
  status: RouteStatus;
  carrier: string;
  cost: number;
  distanceKm?: number;
  estimatedTimeHours?: number;
  region?: string;
  scheduledAt?: string;
  estimatedAt?: string;
}

export const ROUTE_STATUS_LABELS: Record<RouteStatus, string> = {
  ACTIVA:           'Activa',
  INACTIVA:         'Inactiva',
  SUSPENDIDA:       'Suspendida',
  EN_MANTENIMIENTO: 'En mantenimiento',
};

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  CAMION:      'Camión',
  TRACTOMULA:  'Tractomula',
  FURGONETA:   'Furgoneta',
  MOTO_CARGO:  'Moto cargo',
};
