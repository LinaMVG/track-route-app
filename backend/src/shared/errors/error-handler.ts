import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import {success, ZodError} from 'zod';
import { AppError } from './appError';
import { logger } from '../logger';

export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply):void {
    const correlationId = request.headers['x-correlation-id'] as string || 'unknown';

    if (error instanceof AppError) {
        logger.warn({correlationId, code: error.errorCode, message: error.message }, 'AppError');
        reply.status(error.statusCode).send({
            success: false,
            error: {
                code: error.errorCode,
                message: error.message,
                details: error.details ?? undefined,
            },
            correlationId
        });
        return;
    } 

    if (error instanceof ZodError) {
        logger.warn({correlationId, issues: error.issues }, 'ValidationError');
        reply.status(400).send({ 
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Error de Validación en los datos de entrada',
                details: error.issues
            },
            correlationId
        });
        return;
    }

    if('statusCode' in error && (error as FastifyError).statusCode == 401) {

        reply.status(401).send({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Token de autenticación inválido o ausente',
            },
            correlationId
        });
        return;
    }

    logger.error({correlationId, error: error }, 'UnhandledError');
    reply.status(500).send({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error Interno del Servidor',
        },
        correlationId
    });
}