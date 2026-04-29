import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../../../shared/errors/appError";

export interface JwtPayload {
  sub: string;
  username: string;
  role: "ADMIN" | "OPERADOR";
  iat?: number;
  exp?: number;
}

declare module "fastify" {
  interface FastifyJWT {
    user: JwtPayload;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
    request.user = request.user as JwtPayload;
  } catch (err) {
    throw AppError.unauthorized("No Autorizado");
  }
}
