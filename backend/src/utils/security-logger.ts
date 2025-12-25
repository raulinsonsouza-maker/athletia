/**
 * Logger estruturado para eventos de segurança
 * Centraliza logging de eventos críticos para monitoramento
 */

import { sanitizeObject, hashEmail } from './log-sanitizer';

interface SecurityEventDetails {
  userId?: string;
  ip?: string;
  userAgent?: string;
  action?: string;
  resource?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Níveis de severidade para eventos de segurança
 */
export enum SecurityEventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Tipos de eventos de segurança
 */
export enum SecurityEventType {
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  ACCESS_DENIED = 'ACCESS_DENIED',
  IDOR_ATTEMPT = 'IDOR_ATTEMPT',
  SUSPICIOUS_UPLOAD = 'SUSPICIOUS_UPLOAD',
  ADMIN_ACTION = 'ADMIN_ACTION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  WEBHOOK_PROCESSED = 'WEBHOOK_PROCESSED'
}

/**
 * Loga evento de segurança estruturado
 */
export function logSecurityEvent(
  type: SecurityEventType,
  severity: SecurityEventSeverity,
  details: SecurityEventDetails
) {
  // SEGURANÇA: Sanitizar detalhes antes de logar
  const sanitizedDetails = sanitizeObject(details, ['email', 'telefone', 'nome']);
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    severity,
    ...sanitizedDetails
  };

  // Em desenvolvimento, logar no console
  if (process.env.NODE_ENV !== 'production') {
    const emoji = getSeverityEmoji(severity);
    console.log(`${emoji} [SECURITY] ${type}`, logEntry);
  } else {
    // Em produção, usar formato estruturado para serviços de monitoramento
    console.log(JSON.stringify({
      level: severity.toLowerCase(),
      ...logEntry
    }));
  }

  // TODO: Em produção, enviar para serviço de monitoramento
  // (ex: Sentry, CloudWatch, Datadog, etc.)
  // if (process.env.SECURITY_MONITORING_ENABLED === 'true') {
  //   sendToMonitoringService(logEntry);
  // }
}

/**
 * Helper para logar tentativa de acesso negado
 */
export function logAccessDenied(
  userId: string | undefined,
  resource: string,
  reason: string,
  req?: any
) {
  logSecurityEvent(
    SecurityEventType.ACCESS_DENIED,
    SecurityEventSeverity.MEDIUM,
    {
      userId,
      resource,
      reason,
      ip: req?.ip || req?.socket?.remoteAddress,
      userAgent: req?.headers?.['user-agent']
    }
  );
}

/**
 * Helper para logar tentativa de IDOR
 */
export function logIDORAttempt(
  userId: string,
  attemptedResource: string,
  attemptedResourceId: string,
  req?: any
) {
  logSecurityEvent(
    SecurityEventType.IDOR_ATTEMPT,
    SecurityEventSeverity.HIGH,
    {
      userId,
      resource: attemptedResource,
      metadata: {
        attemptedResourceId,
        endpoint: req?.path,
        method: req?.method
      },
      ip: req?.ip || req?.socket?.remoteAddress,
      userAgent: req?.headers?.['user-agent']
    }
  );
}

/**
 * Helper para logar ação administrativa
 */
export function logAdminAction(
  adminUserId: string,
  action: string,
  targetResource?: string,
  req?: any
) {
  logSecurityEvent(
    SecurityEventType.ADMIN_ACTION,
    SecurityEventSeverity.MEDIUM,
    {
      userId: adminUserId,
      action,
      resource: targetResource,
      ip: req?.ip || req?.socket?.remoteAddress,
      userAgent: req?.headers?.['user-agent']
    }
  );
}

/**
 * Helper para logar upload suspeito
 */
export function logSuspiciousUpload(
  userId: string | undefined,
  filename: string,
  reason: string,
  req?: any
) {
  logSecurityEvent(
    SecurityEventType.SUSPICIOUS_UPLOAD,
    SecurityEventSeverity.MEDIUM,
    {
      userId,
      metadata: {
        filename,
        reason
      },
      ip: req?.ip || req?.socket?.remoteAddress,
      userAgent: req?.headers?.['user-agent']
    }
  );
}

/**
 * Helper para logar tentativa de login falhada
 */
export function logAuthFailed(
  identifier: string,
  reason: string,
  req?: any
) {
  // Sanitizar identifier (pode ser email)
  const sanitizedIdentifier = identifier.includes('@') ? hashEmail(identifier) : identifier;
  
  logSecurityEvent(
    SecurityEventType.AUTH_FAILED,
    SecurityEventSeverity.MEDIUM,
    {
      metadata: {
        identifier: sanitizedIdentifier,
        reason
      },
      ip: req?.ip || req?.socket?.remoteAddress,
      userAgent: req?.headers?.['user-agent']
    }
  );
}

/**
 * Helper para logar rate limit excedido
 */
export function logRateLimitExceeded(
  userId: string | undefined,
  endpoint: string,
  req?: any
) {
  logSecurityEvent(
    SecurityEventType.RATE_LIMIT_EXCEEDED,
    SecurityEventSeverity.MEDIUM,
    {
      userId,
      resource: endpoint,
      ip: req?.ip || req?.socket?.remoteAddress,
      userAgent: req?.headers?.['user-agent']
    }
  );
}

function getSeverityEmoji(severity: SecurityEventSeverity): string {
  switch (severity) {
    case SecurityEventSeverity.LOW:
      return '🔵';
    case SecurityEventSeverity.MEDIUM:
      return '🟡';
    case SecurityEventSeverity.HIGH:
      return '🟠';
    case SecurityEventSeverity.CRITICAL:
      return '🔴';
    default:
      return '⚪';
  }
}

