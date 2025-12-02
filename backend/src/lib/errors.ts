/**
 * Sistema padronizado de erros para AthletIA
 * 
 * Classes de erro padronizadas com códigos HTTP apropriados
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Manter stack trace para debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de validação (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, code || 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

/**
 * Erro de não encontrado (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso', code?: string) {
    super(`${resource} não encontrado`, 404, code || 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Erro de não autenticado (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autenticado', code?: string) {
    super(message, 401, code || 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

/**
 * Erro de acesso negado (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado', code?: string) {
    super(message, 403, code || 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

/**
 * Erro interno do servidor (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Erro interno do servidor', code?: string) {
    super(message, 500, code || 'INTERNAL_SERVER_ERROR');
    this.name = 'InternalServerError';
    this.isOperational = false;
  }
}

/**
 * Erro de conflito (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 409, code || 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Helper para criar resposta de erro padronizada
 */
export interface ErrorResponse {
  error: string;
  message: string;
  code?: string;
  requestId?: string;
  details?: any;
}

export function createErrorResponse(
  error: Error | AppError,
  requestId?: string
): ErrorResponse {
  const response: ErrorResponse = {
    error: error.name || 'Error',
    message: error.message,
    requestId
  };

  if (error instanceof AppError) {
    response.code = error.code;
  }

  // Adicionar detalhes apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    response.details = {
      stack: error.stack,
      name: error.name
    };
  }

  return response;
}

