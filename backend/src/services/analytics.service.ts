import { prisma } from '../lib/prisma';

/**
 * Tipos de eventos de analytics
 */
export type AnalyticsEventType =
  | 'user_registered'
  | 'onboarding_completed'
  | 'training_plan_generated'
  | 'training_started'
  | 'training_completed'
  | 'first_training_completed'
  | 'second_training_completed'
  | 'paywall_viewed'
  | 'paywall_blocked_action'
  | 'subscription_started'
  | 'trial_expired';

/**
 * Propriedades genéricas de eventos
 */
export interface AnalyticsEventProperties {
  [key: string]: any;
}

/**
 * Registra um evento de analytics
 */
export async function registrarEvento(
  userId: string,
  eventType: AnalyticsEventType,
  properties: AnalyticsEventProperties = {}
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        userId,
        eventType,
        properties: properties as any,
        createdAt: new Date()
      }
    });

    // Exportar para plataforma externa (assíncrono, não bloqueia)
    try {
      const { exportarEvento } = await import('./analytics-export.service');
      exportarEvento(userId, eventType, properties);
    } catch (error) {
      // Não bloquear se export falhar
      console.error('[Analytics] Erro ao exportar evento:', error);
    }

    // Log para debug (pode ser removido em produção)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Evento registrado: ${eventType} para usuário ${userId}`);
    }
  } catch (error) {
    // Não bloquear operações principais se analytics falhar
    console.error(`[Analytics] Erro ao registrar evento ${eventType}:`, error);
  }
}

/**
 * Registra evento de forma assíncrona (não bloqueia)
 */
export function registrarEventoAsync(
  userId: string,
  eventType: AnalyticsEventType,
  properties: AnalyticsEventProperties = {}
): void {
  // Executar em background sem bloquear
  setImmediate(() => {
    registrarEvento(userId, eventType, properties).catch((error) => {
      console.error(`[Analytics] Erro ao registrar evento assíncrono ${eventType}:`, error);
    });
  });
}

/**
 * Obtém eventos de um usuário
 */
export async function obterEventosUsuario(
  userId: string,
  eventType?: AnalyticsEventType,
  limite: number = 100
): Promise<any[]> {
  const where: any = { userId };
  if (eventType) {
    where.eventType = eventType;
  }

  return prisma.analyticsEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limite
  });
}

/**
 * Conta eventos por tipo
 */
export async function contarEventosPorTipo(
  eventType: AnalyticsEventType,
  dataInicio?: Date,
  dataFim?: Date
): Promise<number> {
  const where: any = { eventType };
  if (dataInicio || dataFim) {
    where.createdAt = {};
    if (dataInicio) where.createdAt.gte = dataInicio;
    if (dataFim) where.createdAt.lte = dataFim;
  }

  return prisma.analyticsEvent.count({ where });
}

