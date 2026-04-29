import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from "fastify";
import { randomUUID } from "crypto";

export function correlationMiddleware(
  request: FastifyRequest,
  _reply: FastifyReply,
  done: HookHandlerDoneFunction): void {
    if(!request.headers['x-correlation-id']) {
        request.headers['x-correlation-id'] = randomUUID();
    }
    done();
  }
