import soap, { Client } from "node-soap";
import {
  ITrackingService,
  TrackingData,
} from "../../domain/ports/ITrackingService";
import { InMemoryCache } from "@infraestructure/cache/InMemoryCcahe";
import { logger } from "@shared/logger";
import { AppError } from "@shared/errors/appError";

export class SoapTrackingAdapter implements ITrackingService {
  private clientPromise: Promise<Client> | null = null;
  private readonly cache = new InMemoryCache<TrackingData>();
  private readonly cacheTTLSeconds: number;

  constructor() {
    this.cache = new InMemoryCache<TrackingData>();
    this.cacheTTLSeconds = Number(process.env.SOAP_CACHE_TTL_SECONDS) || 60;
  }
  
  async trackAllRoutes(routeIds: string[]): Promise<TrackingData[]> {
    return Promise.all(routeIds.map((routeId) => this.trackRoute(routeId)));
  }

  private async getClient(): Promise<Client> {
    if (!this.clientPromise) {
      const wsdlUrl =
        process.env.SOAP_WSDL_URL || "http://localhost:8081/tracking?wsdl";
      if (!wsdlUrl) {
        logger.error("SOAP_WSDL_URL environment variable is not set");
        throw AppError.internalServerError(" Error Interno del Servidor");
      }
      this.clientPromise = soap.createClientAsync(wsdlUrl, {
        wsdl_headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.SOAP_USERNAME}:${process.env.SOAP_PASSWORD}`
          ).toString("base64")}`,
        },
      });
    }
    return this.clientPromise;
  }

  async trackRoute(routeId: string): Promise<TrackingData> {
    const cachedData = this.cache.get(routeId);
    if (cachedData) {
      logger.debug(`Cache hit for routeId: ${routeId}`);
      return cachedData;
    }

    try {
      logger.debug(`Tracking data retrieved for routeId: ${routeId}`);
      const client = await this.getClient();

      const [result] = await (client as any).TrackRoute({ routeId });

      const data: TrackingData = {
        routeId: result.routeId,
        lastLocation: result.lastLocation,
        ProgressPercentage: result.ProgressPercentage,
        etaMinutes: result.etaMinutes,
        timestamp: result.timestamp,
      };

      this.cache.set(routeId, data, this.cacheTTLSeconds);
      return data;
    } catch (error) {
      logger.error(`Error occurred while tracking route: ${error}`);
      throw AppError.internalServerError(" Error Interno del Servidor");
    }
  }
}
