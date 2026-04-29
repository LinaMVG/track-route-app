export const RouteStatus = [ 'ACTIVA', 'SUSPENDIDA', 'EN_MANTENIMIENTO' ] as const;
export type RouteStatus = typeof RouteStatus[number];

export const VECHICLE_TYPES = ['CAMION', 'TRACTOMULA', 'FURGONETA', 'MOTO_CARGO'] as const;
export type VehicleType = typeof VECHICLE_TYPES[number];