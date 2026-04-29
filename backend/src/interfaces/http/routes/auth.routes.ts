import { FastifyInstance } from "fastify";
import { Pool } from "pg";
import {LoginRequestSchema } from "../schemas/auth.schema";
import { LoginUseCase } from "@application/use-cases/auth/LoginUseCase";
import { PostgressUserRepository } from "@infraestructure/db/PostgresUserRepository";
import { AppError } from "@shared/errors/appError";

/**
 * @description Define las rutas de autenticación (login) para la aplicación.
 * POST /api/auth/login: Permite a los usuarios autenticarse proporcionando su nombre de usuario y contraseña. Devuelve un token JWT si las credenciales son válidas.
 * GET /api/auth/me: Devuelve información sobre el usuario autenticado. Requiere un token JWT válido en el encabezado de autorización.
 */

export async function authRoutes(app: FastifyInstance, options: {pool: Pool}): Promise<void> {
    const userRepository = new PostgressUserRepository(options.pool);
    app.post('/login', 
        {
            config: { rateLimit: { max: 5, timeWindow: '1m' } },
        },
        async (request, reply) => {
            const input = LoginRequestSchema.parse(request.body);
            const loginUseCase = new LoginUseCase(userRepository, (payload, expiresIn) => 
            app.jwt.sign(payload,  expiresIn ) 
        );
        const result = await loginUseCase.execute(input);
        reply.status(200).send({
            success: true,
            data: result
        });
        }
    );

    app.get('/me',
        {
            preHandler: [
                async(request, reply) =>{
                    try {
                        await request.jwtVerify();
                    } catch (err) {
                        throw AppError.unauthorized("No Autorizado");
                    }
                }
            ],
        },
        async (request, reply) => {
            const user = request.user as { sub: string; username: string; role: string };
            reply.status(200).send({
                success: true,
                data: { id: user.sub, username: user.username, role: user.role }
            });
        }
    );

    // ruta de prueba para demo de token de expiración
    if(process.env.NODE_ENV !== 'production') {
        app.post('/login-short', 
        {
            config: { rateLimit: { max: 5, timeWindow: '1m' } },
        },
        async (request, reply) => {
            const input = LoginRequestSchema.parse(request.body);
            const loginUseCase = new LoginUseCase(userRepository, (payload, expiresIn) => 
            app.jwt.sign(payload, {expiresIn: process.env.JWT_EXPIRES_IN_SHORT || '2m'}) 
        );
        const result = await loginUseCase.execute(input);
        reply.status(200).send({
            success: true,
            data: result
        });
        }
    );
    }
}