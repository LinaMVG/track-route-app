import 'dotenv/config';
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimiting from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import websocket from '@fastify/websocket';
import {randomUUID} from 'crypto';
import { getDatabasePool } from './shared/container';
import { authRoutes } from './interfaces/http/routes/auth.routes';

import {logger} from './shared/logger';
import {errorHandler} from './shared/errors/error-handler';

function validateEnv(): void {
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'SOAP_WSDL_URL'];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);        

    if (missingVars.length > 0) {
        logger.error({ missingVars }, 'Missing required environment variables');
        process.exit(1);
    }
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        logger.error('JWT_SECRET must be at least 32 characters long');
        process.exit(1);
    }
}

async function buildServer() {
    validateEnv();

    const app = Fastify({
        logger: false,
        genReqId: () => randomUUID(),
    });

    const pool = getDatabasePool();

    await app.register(helmet, {
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ,
    });

    await app.register(cors, {
        origin: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:4200') .split(',') || '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });

    await app.register(rateLimiting, {
        global: false,
    });

    await app.register(jwt, {
        secret: process.env.JWT_SECRET as string,
    });

    await app.register(multipart, {
        limits: {
            fileSize: 10 * 1024 * 1024, 
        },
    });

    await app.register(websocket);

    app.addHook('onRequest', async (request) => {
        const correlationId = request.headers['x-correlation-id'] as string ?? request.id;
        request.headers['x-correlation-id'] = correlationId;
        logger.info({ correlationId, method: request.method, url: request.url }, 'Incoming request');
    });

    app.addHook( 'onResponse', async (request, reply) => {
        const correlationId = request.headers['x-correlation-id'] as string ?? request.id;
        logger.info({ correlationId, method: request.method, url: request.url, statusCode: reply.statusCode }, 'Request completed');
    });

    app.setErrorHandler(errorHandler);
        await app.register(async (api) =>{
        await api.register(authRoutes, { prefix: '/auth', pool });
        //siguientes rutas
    }, {prefix: '/api'});

    app.get('/health', async () => ({
        status: 'ok', timestamp: new Date().toISOString()
    }));

    app.addHook('onClose', async () => {
        await pool.end();
    });

    return app;
    
}

async function main(): Promise<void> {
    const app = await buildServer();
    const port = Number(process.env.PORT) || 3000;

    try {
        await app.listen({ port, host: '0.0.0.0' });
        logger.info(`Server is running on port ${port}`);
    } catch (error) {
        logger.error({ error }, 'Failed to start server');
        process.exit(1);
    }
}

main();
export { buildServer };