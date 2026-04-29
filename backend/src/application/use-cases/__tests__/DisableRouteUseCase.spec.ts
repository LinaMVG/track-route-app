import { DisableRouteUseCase } from "@application/routes/DisableRouteUseCase";
import { IRouteRepository } from "@domain/ports/IRouteRepository";
import { Route } from "@domain/entities/Route";
import { AppError } from "@shared/errors/appError";

describe("DisableRouteUseCase", () => {
  let useCase: DisableRouteUseCase;
  let mockRepo: jest.Mocked<IRouteRepository>;

  const mockRoute: Route = {
    id: "route-123",
    originCity: "Bogotá",
    destinationCity: "Medellín",
    vehicleType: "CAMION",
    status: "ACTIVA",
    carrier: "Transportes Test",
    cost: 1000000,
    distanceKm: 400,
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

    useCase = new DisableRouteUseCase(mockRepo);
  });

  describe("execute — happy path", () => {
    it("deshabilita la ruta cuando existe", async () => {
      const disabledRoute = { ...mockRoute, isEnabled: false };

      mockRepo.findById.mockResolvedValue(mockRoute);
      mockRepo.disable.mockResolvedValue(disabledRoute);

      const result = await useCase.execute("route-123");

      expect(mockRepo.findById).toHaveBeenCalledWith("route-123");
      expect(mockRepo.disable).toHaveBeenCalledWith("route-123");

      expect(result.isEnabled).toBe(false);
    });
  });

  describe("execute — ruta no existe", () => {
    it("lanza AppError.notFound si la ruta no existe", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute("invalid-id")).rejects.toThrow(AppError);

      expect(mockRepo.findById).toHaveBeenCalledWith("invalid-id");
      expect(mockRepo.disable).not.toHaveBeenCalled();
    });
  });

  describe("execute — error del repositorio", () => {
    it("propaga errores del repositorio", async () => {
      mockRepo.findById.mockResolvedValue(mockRoute);
      mockRepo.disable.mockRejectedValue(new Error("DB error"));

      await expect(useCase.execute("route-123")).rejects.toThrow("DB error");
    });
  });
});