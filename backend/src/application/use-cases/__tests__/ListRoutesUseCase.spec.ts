import { ListRoutesUseCase } from "@application/routes/ListRoutesuseCase";
import {
  IRouteRepository,
  RouteFilter,
  PaginationCursor,
  PaginationResult,
} from "@domain/ports/IRouteRepository";
import { Route } from "@domain/entities/Route";

describe("ListRoutesUseCase", () => {
  let useCase: ListRoutesUseCase;
  let mockRepo: jest.Mocked<IRouteRepository>;

  const mockRoutes: Route[] = [
    {
      id: "1",
      originCity: "Bogotá",
      destinationCity: "Medellín",
      vehicleType: "CAMION",
      status: "ACTIVA",
      carrier: "Test",
      cost: 1000,
      distanceKm: 400,
      region: "Andina",
      isEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

const mockResult: PaginationResult<Route> = {
  data: mockRoutes,
  nextCursor: undefined,
  total: 1,
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

    useCase = new ListRoutesUseCase(mockRepo);
  });

  describe("execute — happy path", () => {
    it("llama al repositorio con filtros y paginación correctamente", async () => {
      mockRepo.findAll.mockResolvedValue(mockResult);

      const filters: RouteFilter = {
        originCity: "Bogotá",
      };

      const pagination: PaginationCursor = {
        offset: 10,
        cursor: undefined,
      };

      const result = await useCase.execute(filters, pagination);

      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
      expect(mockRepo.findAll).toHaveBeenCalledWith(filters, {
        offset: 10,
        cursor: undefined,
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe("execute — limit por defecto", () => {
    it("usa 20 cuando offset no es válido", async () => {
      mockRepo.findAll.mockResolvedValue(mockResult);

      const result = await useCase.execute({}, {} as PaginationCursor);

      expect(mockRepo.findAll).toHaveBeenCalledWith({}, {
        offset: 20,
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe("execute — cap máximo", () => {
    it("limita el offset a máximo 100", async () => {
      mockRepo.findAll.mockResolvedValue(mockResult);

      const result = await useCase.execute({}, { offset: 500 });

      expect(mockRepo.findAll).toHaveBeenCalledWith({}, {
        offset: 100,
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe("execute — offset como string", () => {
    it("convierte offset string a número", async () => {
      mockRepo.findAll.mockResolvedValue(mockResult);

      const result = await useCase.execute({}, { offset: "30" as any });

      expect(mockRepo.findAll).toHaveBeenCalledWith({}, {
        offset: 30,
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe("execute — error del repositorio", () => {
    it("propaga errores correctamente", async () => {
      mockRepo.findAll.mockRejectedValue(new Error("DB error"));

      await expect(
        useCase.execute({}, { offset: 10 }),
      ).rejects.toThrow("DB error");
    });
  });
});