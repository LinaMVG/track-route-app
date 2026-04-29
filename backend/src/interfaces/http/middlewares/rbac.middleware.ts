import { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../../../shared/errors/appError";
import { UserRole } from "@domain/entities/User";

export function requireRole(...roles: UserRole[]) {
  return async function (
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    const userRole = request.user as { role?: UserRole };
    if (!userRole || !userRole.role || !roles.includes(userRole.role)) {
      throw AppError.forbidden("Acceso Denegado");
    }
  };
}
