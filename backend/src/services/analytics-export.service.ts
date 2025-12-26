/**
 * Serviço de export de analytics para plataformas externas
 * Preparado para escala - não bloqueia operações principais
 */

import { registrarEvento } from './analytics.service';
import type { AnalyticsEventType, AnalyticsEventProperties } from './analytics.service';

/**
 * Configuração de export (PostHog, Segment, Mixpanel, etc.)
 * Por enquanto apenas estrutura - implementar quando necessário
 */
const ANALYTICS_EXPORT_ENABLED = process.env.ANALYTICS_EXPORT_ENABLED === 'true';
const ANALYTICS_EXPORT_PROVIDER = process.env.ANALYTICS_EXPORT_PROVIDER || 'none'; // 'posthog', 'segment', 'mixpanel', 'none'

/**
 * Exporta evento para plataforma externa (assíncrono, não bloqueia)
 */
export async function exportarEvento(
  userId: string,
  eventType: AnalyticsEventType,
  properties: AnalyticsEventProperties = {}
): Promise<void> {
  if (!ANALYTICS_EXPORT_ENABLED || ANALYTICS_EXPORT_PROVIDER === 'none') {
    return; // Export desabilitado
  }

  try {
    // Executar em background sem bloquear
    setImmediate(async () => {
      try {
        switch (ANALYTICS_EXPORT_PROVIDER) {
          case 'posthog':
            await exportarParaPostHog(userId, eventType, properties);
            break;
          case 'segment':
            await exportarParaSegment(userId, eventType, properties);
            break;
          case 'mixpanel':
            await exportarParaMixpanel(userId, eventType, properties);
            break;
          default:
            // Provider não implementado ainda
            break;
        }
      } catch (error) {
        console.error(`[Analytics Export] Erro ao exportar para ${ANALYTICS_EXPORT_PROVIDER}:`, error);
      }
    });
  } catch (error) {
    // Não bloquear se export falhar
    console.error('[Analytics Export] Erro ao iniciar export:', error);
  }
}

/**
 * Exporta para PostHog (implementar quando necessário)
 */
async function exportarParaPostHog(
  userId: string,
  eventType: AnalyticsEventType,
  properties: AnalyticsEventProperties
): Promise<void> {
  // TODO: Implementar integração com PostHog
  // const posthog = require('posthog-node');
  // const client = new posthog.PostHog(process.env.POSTHOG_API_KEY);
  // client.capture({ distinctId: userId, event: eventType, properties });
}

/**
 * Exporta para Segment (implementar quando necessário)
 */
async function exportarParaSegment(
  userId: string,
  eventType: AnalyticsEventType,
  properties: AnalyticsEventProperties
): Promise<void> {
  // TODO: Implementar integração com Segment
  // const { Analytics } = require('@segment/analytics-node');
  // const analytics = new Analytics({ writeKey: process.env.SEGMENT_WRITE_KEY });
  // analytics.track({ userId, event: eventType, properties });
}

/**
 * Exporta para Mixpanel (implementar quando necessário)
 */
async function exportarParaMixpanel(
  userId: string,
  eventType: AnalyticsEventType,
  properties: AnalyticsEventProperties
): Promise<void> {
  // TODO: Implementar integração com Mixpanel
  // const Mixpanel = require('mixpanel');
  // const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
  // mixpanel.track(eventType, { distinct_id: userId, ...properties });
}

