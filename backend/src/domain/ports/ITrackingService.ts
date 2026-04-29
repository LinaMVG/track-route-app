export interface TrackingData {
    routeId: string;
    lastLocation: string;
    ProgressPercentage: number;
    etaMinutes: number;
    timestamp: string;
}

export interface ITrackingService {
    trackRoute(routeId: string): Promise<TrackingData>;
    trackAllRoutes(routeIds: string[]): Promise<TrackingData[]>;
}