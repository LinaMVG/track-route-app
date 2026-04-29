export type ErrorCode = |'NOT_FOUND' | 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'INTERNAL_SERVER_ERROR' | 'CONFLICT' | 'BAD_REQUEST';

const HTTP_STATUS_MAP: Record<ErrorCode, number> = {
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,          
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  CONFLICT: 409,
  BAD_REQUEST: 400
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly details?: unknown;

  constructor(errorCode: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name='AppError';
    this.errorCode = errorCode;
    this.statusCode = HTTP_STATUS_MAP[errorCode];
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message: string) {
    return new AppError('NOT_FOUND', message);
  }

  static unauthorized(message: 'No Autorizado') {
    return new AppError('UNAUTHORIZED', message);
  }

  static forbidden(message: 'Acceso Denegado') {
    return new AppError('FORBIDDEN', message);
  }

  static validationError(message: string, details?: unknown) {
    return new AppError('VALIDATION_ERROR', message, details);
  }

  static conflict(message: string) {
    return new AppError('CONFLICT', message);
  }

  static internalServerError(message: ' Error Interno del Servidor') {
    return new AppError('INTERNAL_SERVER_ERROR', message);
  }
  static badRequest(message: string, details?: unknown) {
    return new AppError('BAD_REQUEST', message);
  }
}