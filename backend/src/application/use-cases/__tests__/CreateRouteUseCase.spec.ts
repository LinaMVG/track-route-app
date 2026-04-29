import { CreateRouteUseCase } from "@application/routes/CreateRouteUseCase";
import { IRouteRepository } from "@domain/ports/IRouteRepository";
import { Route, CreateRouteDTO } from "@domain/entities/Route";

const mockRoute: Route = {
  id: "route-uuid-001",
  originCity: "Bogotá",
  destinationCity: "Medellín",
  vehicleType: "CAMION",
  status: "ACTIVA",
  carrier: "Transportes Test S.A.S",
  cost: 1500000,
  distanceKm: 415,
  region: "Andina",
  isEnabled: true,
  createdAt: new Date("2024-01-01T00:00:00Z"),
  updatedAt: new Date("2024-01-01T00:00:00Z"),
};

const mockRepo = {
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

describe("CreateRouteUseCase", () => {
  let useCase: CreateRouteUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateRouteUseCase(mockRepo);
  });

  describe("execute — happy path", () => {
    it("llama al repositorio con los datos correctos y retorna la ruta creada", async () => {
      mockRepo.create.mockResolvedValue(mockRoute);

      const input: CreateRouteDTO = {
        originCity: "Bogotá",
        destinationCity: "Medellín",
        vehicleType: "CAMION",
        status: "ACTIVA",
        carrier: "Transportes Test S.A.S",
        cost: 1500000,
        distanceKm: 415,
        region: "Andina",
      };

      const result = await useCase.execute(input);

      expect(mockRepo.create).toHaveBeenCalledTimes(1);
      expect(mockRepo.create).toHaveBeenCalledWith(input);
      expect(result.id).toBe("route-uuid-001");
      expect(result.originCity).toBe("Bogotá");
      expect(result.isEnabled).toBe(true);
    });
  });

  describe("execute — campos opcionales", () => {
    it("funciona sin campos opcionales (distanceKm, region, etc.)", async () => {
      const minimalRoute = {
        ...mockRoute,
        distanceKm: undefined,
        region: undefined,
      };
      mockRepo.create.mockResolvedValue(minimalRoute);

      const input: CreateRouteDTO = {
        originCity: "Cali",
        destinationCity: "Barranquilla",
        vehicleType: "FURGONETA",
        status: "ACTIVA",
        carrier: "Express Cargo",
        cost: 800000,
      };

      const result = await useCase.execute(input);
      expect(result.distanceKm).toBeUndefined();
      expect(result.region).toBeUndefined();
    });
  });

  describe("execute — propagación de errores", () => {
    it("propaga errores del repositorio correctamente", async () => {
      mockRepo.create.mockRejectedValue(new Error("DB connection failed"));

      await expect(
        useCase.execute({
          originCity: "X",
          destinationCity: "Y",
          vehicleType: "MOTO_CARGO",
          status: "ACTIVA",
          carrier: "Test",
          cost: 100,
        }),
      ).rejects.toThrow("DB connection failed");
    });
  });
});