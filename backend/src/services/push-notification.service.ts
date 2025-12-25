/**
 * Serviço para gerenciar notificações push
 */

import webpush from 'web-push';
import { prisma } from '../lib/prisma';
import { selecionarMensagem, atualizarHistorico, MessageContext, MessageHistory } from '../utils/notification-messages';

// Inicializar web-push com VAPID keys
export function inicializarWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:contato@athletia.site';

  if (!publicKey || !privateKey) {
    console.warn('[PUSH] VAPID keys não configuradas. Notificações push desabilitadas.');
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

/**
 * Salva subscription do usuário
 */
export async function salvarSubscription(
  userId: string,
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
) {
  try {
    // Verificar se já existe subscription com mesmo endpoint
    const existente = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint }
    });

    if (existente) {
      // Atualizar subscription existente
      return await prisma.pushSubscription.update({
        where: { endpoint: subscription.endpoint },
        data: {
          userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      });
    }

    // Criar nova subscription
    return await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }
    });
  } catch (error: any) {
    console.error('[PUSH] Erro ao salvar subscription:', error);
    throw new Error('Erro ao salvar subscription de notificação');
  }
}

/**
 * Remove subscription do usuário
 */
export async function removerSubscription(userId: string, endpoint: string) {
  try {
    await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint
      }
    });
  } catch (error: any) {
    console.error('[PUSH] Erro ao remover subscription:', error);
    throw new Error('Erro ao remover subscription de notificação');
  }
}

/**
 * Envia notificação para um usuário específico
 */
export async function enviarNotificacao(
  userId: string,
  titulo: string,
  mensagem: string,
  url?: string
) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    });

    if (subscriptions.length === 0) {
      return { enviado: false, motivo: 'Usuário não tem subscription ativa' };
    }

    // URL base para ícones (usar FRONTEND_URL ou fallback)
    const baseUrl = process.env.FRONTEND_URL || 'https://athletia.site';
    const iconUrl = `${baseUrl}/icon-192x192.png`;
    const badgeUrl = `${baseUrl}/icon-192x192.png`;

    const payload = JSON.stringify({
      title: titulo,
      body: mensagem,
      icon: iconUrl,
      badge: badgeUrl,
      image: iconUrl, // Imagem grande para notificações expandidas
      vibrate: [200, 100, 200],
      data: {
        url: url || '/treino',
        dateOfArrival: Date.now()
      },
      tag: 'athletia-notification', // Tag para agrupar notificações
      requireInteraction: false,
      silent: false
    });

    const resultados = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            payload
          );
          return { sucesso: true, endpoint: sub.endpoint };
        } catch (error: any) {
          // Se subscription expirou ou é inválida, remover
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { endpoint: sub.endpoint }
            });
            console.log(`[PUSH] Subscription removida (inválida): ${sub.endpoint}`);
          }
          throw error;
        }
      })
    );

    const sucessos = resultados.filter(r => r.status === 'fulfilled').length;
    const falhas = resultados.filter(r => r.status === 'rejected').length;

    return {
      enviado: sucessos > 0,
      sucessos,
      falhas,
      total: subscriptions.length
    };
  } catch (error: any) {
    console.error('[PUSH] Erro ao enviar notificação:', error);
    throw error;
  }
}

/**
 * Verifica se usuário tem treino agendado para hoje
 */
export async function verificarTreinoHoje(userId: string): Promise<boolean> {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const fimDia = new Date(hoje);
  fimDia.setHours(23, 59, 59, 999);

  const treinos = await prisma.treino.findMany({
    where: {
      userId,
      data: {
        gte: hoje,
        lte: fimDia
      }
    },
    take: 1
  });

  return treinos.length > 0;
}

/**
 * Envia notificação diária para usuário
 * Seleciona mensagem baseada no contexto e atualiza histórico
 */
export async function enviarNotificacaoDiaria(userId: string) {
  try {
    // Buscar subscription do usuário
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
      take: 1 // Pegar apenas uma (normalmente usuário tem uma por dispositivo)
    });

    if (subscriptions.length === 0) {
      return { enviado: false, motivo: 'Sem subscription ativa' };
    }

    const subscription = subscriptions[0];

    // Verificar se tem treino hoje
    const temTreino = await verificarTreinoHoje(userId);
    const contexto: MessageContext = temTreino ? 'com_treino' : 'sem_treino';

    // Buscar dados do usuário para personalização
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { nome: true }
    });

    // Selecionar mensagem do pool
    const historicoMensagens = subscription.historicoMensagens as MessageHistory[] | null | undefined;
    const mensagem = selecionarMensagem(contexto, historicoMensagens, usuario?.nome || undefined);

    // Enviar notificação
    const resultado = await enviarNotificacao(
      userId,
      'AthletIA',
      mensagem,
      temTreino ? '/treino' : '/meu-plano'
    );

    // Se enviou com sucesso, atualizar histórico
    if (resultado.enviado) {
      const novoHistorico = atualizarHistorico(historicoMensagens, mensagem);
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: {
          ultimaMensagemEnviada: mensagem,
          historicoMensagens: novoHistorico as any
        }
      });
    }

    return resultado;
  } catch (error: any) {
    console.error(`[PUSH] Erro ao enviar notificação diária para usuário ${userId}:`, error);
    throw error;
  }
}

/**
 * Busca todas as subscriptions ativas
 */
export async function buscarSubscriptionsAtivas() {
  return await prisma.pushSubscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          nome: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

