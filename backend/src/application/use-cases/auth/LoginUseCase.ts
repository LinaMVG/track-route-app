import bcrypt from "bcrypt";
import { IUserRepository } from "../../../domain/ports/IUserRepository";
import { AppError } from "../../../shared/errors/appError";
import { logger } from "@shared/logger";

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export type signTokenFn = (
  payload: object,
  options?: { expiresIn?: string }
) => string;

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private signToken: signTokenFn
  ) {}

  async execute(
    input: LoginInput,
    correlationId?: string
  ): Promise<LoginOutput> {
    const { username, password } = input;
    const user = await this.userRepository.findByUsername(username);
    const dummyHash = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8z5rYQZ.7s9sGq4UeB5j6K/1a";
    const hashToCompare = user ? user.password : dummyHash;
    const passwordMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordMatch) {
      logger.warn(`Failed login attempt for username: ${username}, correlationId: ${correlationId}`);
      throw AppError.unauthorized("No Autorizado");
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

    const accessToken = this.signToken(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
      },
      { expiresIn }
    );

    logger.info(`User ${username} logged in successfully, correlationId: ${correlationId}`);

    return {
        accessToken,
        expiresIn,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
        },
    };
  }
}
