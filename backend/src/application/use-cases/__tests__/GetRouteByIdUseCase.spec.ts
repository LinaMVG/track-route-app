import { GetRouteByIdUseCase } from "@application/routes/GetRouteByIdUseCase";
import { IRouteRepository } from "@domain/ports/IRouteRepository";
import { Route } from "@domain/entities/Route";
import { AppError } from "@shared/errors/appError";

describe("GetRouteByIdUseCase", () => {
  let useCase: GetRouteByIdUseCase;
  let mockRepo: jest.Mocked<IRouteRepository>;

  const mockRoute: Route = {
    id: "route-001",
    originCity: "Bogotá",
    destinationCity: "Cali",
    vehicleType: "CAMION",
    status: "ACTIVA",
    carrier: "Transportes Test",
    cost: 1200000,
    distanceKm: 460,
    region: "Andina",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      update: jest.fn(),
      disable: jest.fn(),
      bulkCreate: jest.fn(),
      countByStatus: jest.fn(),
      topByCost: jest.fn(),
      countByRegion: jest.fn(),
    } as jest.Mocked<IRouteRepository>;

    useCase = new GetRouteByIdUseCase(mockRepo);
  });

  describe("execute — happy path", () => {
    it("retorna la ruta cuando existe", async () => {
      mockRepo.findById.mockResolvedValue(mockRoute);

      const result = await useCase.execute("route-001");

      expect(mockRepo.findById).toHaveBeenCalledTimes(1);
      expect(mockRepo.findById).toHaveBeenCalledWith("route-001");

      expect(result).toEqual(mockRoute);
    });
  });

  describe("execute — ruta no encontrada", () => {
    it("lanza AppError.notFound cuando no existe", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute("invalid-id")).rejects.toThrow(AppError);

      expect(mockRepo.findById).toHaveBeenCalledWith("invalid-id");
    });
  });

  describe("execute — error del repositorio", () => {
    it("propaga errores del repositorio", async () => {
      mockRepo.findById.mockRejectedValue(new Error("DB error"));

      await expect(useCase.execute("route-001")).rejects.toThrow("DB error");
    });
  });
});