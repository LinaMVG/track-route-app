import bcrypt from "bcrypt";
import { LoginUseCase, LoginInput } from "@application/use-cases/auth/LoginUseCase";
import { IUserRepository } from "@domain/ports/IUserRepository";
import { AppError } from "@shared/errors/appError";
import { User } from "@domain/entities/User";

// Mock de bcrypt
jest.mock("bcrypt");

describe("LoginUseCase", () => {
  let useCase: LoginUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;
  let mockSignToken: jest.Mock;

const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: "user-123",
  username: "admin",
  email: "admin@test.com",
  password: "hashed-password",
  role: "ADMIN",
  createdAt: new Date(),
  isActive: true,
  ...overrides,
});
const mockUser: User = createMockUser();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepo = {
      findByUsername: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    mockSignToken = jest.fn();

    useCase = new LoginUseCase(mockUserRepo, mockSignToken);
  });

  // ✅ HAPPY PATH
  describe("execute — login exitoso", () => {
    it("retorna token y datos del usuario cuando credenciales son correctas", async () => {
      mockUserRepo.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockSignToken.mockReturnValue("fake-jwt-token");

      const input: LoginInput = {
        username: "admin",
        password: "Admin2024!",
      };

      const result = await useCase.execute(input, "corr-123");

      expect(mockUserRepo.findByUsername).toHaveBeenCalledWith("admin");
      expect(bcrypt.compare).toHaveBeenCalled();
      expect(mockSignToken).toHaveBeenCalledWith(
        {
          sub: mockUser.id,
          username: mockUser.username,
          role: mockUser.role,
        },
        { expiresIn: expect.any(String) }
      );

      expect(result.accessToken).toBe("fake-jwt-token");
      expect(result.user.username).toBe("admin");
    });
  });

  // ❌ Usuario no existe
  describe("execute — usuario no encontrado", () => {
    it("lanza error unauthorized", async () => {
      mockUserRepo.findByUsername.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        useCase.execute({
          username: "no-existe",
          password: "123",
        })
      ).rejects.toThrow(AppError);

      expect(mockSignToken).not.toHaveBeenCalled();
    });
  });

  // ❌ Password incorrecto
  describe("execute — password incorrecto", () => {
    it("lanza error unauthorized", async () => {
      mockUserRepo.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        useCase.execute({
          username: "admin",
          password: "wrong",
        })
      ).rejects.toThrow(AppError);

      expect(mockSignToken).not.toHaveBeenCalled();
    });
  });

  // 🔒 Seguridad: evita timing attacks
  describe("execute — usa dummy hash cuando usuario no existe", () => {
    it("igual ejecuta bcrypt.compare aunque no exista usuario", async () => {
      mockUserRepo.findByUsername.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        useCase.execute({
          username: "ghost",
          password: "123",
        })
      ).rejects.toThrow();

      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });
  });

  // ⏱️ expiración
  describe("execute — usa JWT_EXPIRES_IN", () => {
    it("usa variable de entorno si existe", async () => {
      process.env.JWT_EXPIRES_IN = "1h";

      mockUserRepo.findByUsername.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockSignToken.mockReturnValue("token");

      await useCase.execute({
        username: "admin",
        password: "Admin2024!",
      });

      expect(mockSignToken).toHaveBeenCalledWith(
        expect.any(Object),
        { expiresIn: "1h" }
      );
    });
  });
});