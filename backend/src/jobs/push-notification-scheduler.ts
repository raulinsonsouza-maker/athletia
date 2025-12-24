/**
 * Cron job para enviar notificações push diárias
 */

import * as pushNotificationService from '../services/push-notification.service';
import { prisma } from '../lib/prisma';

/**
 * Envia notificações diárias para todos os usuários com subscriptions ativas
 */
export async function enviarNotificacoesDiarias() {
  console.log('[PUSH SCHEDULER] Iniciando envio de notificações diárias...');

  try {
    // Buscar todas as subscriptions ativas
    const subscriptions = await pushNotificationService.buscarSubscriptionsAtivas();

    if (subscriptions.length === 0) {
      console.log('[PUSH SCHEDULER] Nenhuma subscription ativa encontrada.');
      return;
    }

    console.log(`[PUSH SCHEDULER] Encontradas ${subscriptions.length} subscriptions ativas.`);

    // Agrupar por userId para evitar múltiplas notificações para o mesmo usuário
    const subscriptionsPorUsuario = new Map<string, typeof subscriptions>();
    
    for (const sub of subscriptions) {
      const userId = sub.userId;
      if (!subscriptionsPorUsuario.has(userId)) {
        subscriptionsPorUsuario.set(userId, []);
      }
      subscriptionsPorUsuario.get(userId)!.push(sub);
    }

    console.log(`[PUSH SCHEDULER] Enviando notificações para ${subscriptionsPorUsuario.size} usuários únicos.`);

    // Enviar notificação para cada usuário
    const resultados = await Promise.allSettled(
      Array.from(subscriptionsPorUsuario.keys()).map(async (userId) => {
        try {
          return await pushNotificationService.enviarNotificacaoDiaria(userId);
        } catch (error: any) {
          console.error(`[PUSH SCHEDULER] Erro ao enviar para usuário ${userId}:`, error.message);
          return { enviado: false, motivo: error.message };
        }
      })
    );

    const sucessos = resultados.filter(r => r.status === 'fulfilled' && r.value.enviado).length;
    const falhas = resultados.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.enviado)).length;

    console.log(`[PUSH SCHEDULER] Notificações enviadas: ${sucessos} sucessos, ${falhas} falhas.`);
  } catch (error: any) {
    console.error('[PUSH SCHEDULER] Erro ao executar scheduler:', error);
  }
}

