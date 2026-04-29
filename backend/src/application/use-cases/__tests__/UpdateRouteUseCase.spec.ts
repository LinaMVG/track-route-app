import { UpdateRouteUseCase } from "@application/routes/UpdateRouteUseCase";
import { IRouteRepository } from "@domain/ports/IRouteRepository";
import { Route, UpdateRouteDTO } from "@domain/entities/Route";
import { AppError } from "@shared/errors/appError";

describe("UpdateRouteUseCase", () => {
  let useCase: UpdateRouteUseCase;
  let mockRepo: jest.Mocked<IRouteRepository>;

  const mockRoute: Route = {
    id: "route-001",
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

    useCase = new UpdateRouteUseCase(mockRepo);
  });

  describe("execute — happy path", () => {
    it("actualiza correctamente cuando la ruta existe", async () => {
      const updatedRoute = { ...mockRoute, carrier: "Nuevo Carrier" };

      mockRepo.findById.mockResolvedValue(mockRoute);
      mockRepo.update.mockResolvedValue(updatedRoute);

      const input: UpdateRouteDTO = {
        carrier: "Nuevo Carrier",
      };

      const result = await useCase.execute("route-001", input);

      expect(mockRepo.findById).toHaveBeenCalledWith("route-001");
      expect(mockRepo.update).toHaveBeenCalledWith("route-001", input);

      expect(result.carrier).toBe("Nuevo Carrier");
    });
  });

  describe("execute — ruta no existe", () => {
    it("lanza AppError.notFound si no existe", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        useCase.execute("invalid-id", {}),
      ).rejects.toThrow(AppError);

      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("execute — error al actualizar", () => {
    it("lanza validationError si update retorna null", async () => {
      mockRepo.findById.mockResolvedValue(mockRoute);
      mockRepo.update.mockResolvedValue(null);

      await expect(
        useCase.execute("route-001", { carrier: "X" }),
      ).rejects.toThrow(AppError);
    });
  });

  describe("execute — error del repositorio", () => {
    it("propaga errores del repositorio", async () => {
      mockRepo.findById.mockResolvedValue(mockRoute);
      mockRepo.update.mockRejectedValue(new Error("DB error"));

      await expect(
        useCase.execute("route-001", { carrier: "X" }),
      ).rejects.toThrow("DB error");
    });
  });
});