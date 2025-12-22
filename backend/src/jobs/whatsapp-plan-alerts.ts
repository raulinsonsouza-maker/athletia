import { prisma } from '../lib/prisma';
import { sendTemplateMessage, normalizePhoneNumber } from '../services/whatsapp.service';
import { isTemplateApproved } from '../services/whatsapp-template.service';

/**
 * Executa job de alertas de expiração de plano
 */
export async function executarAlertasExpiracaoPlano() {
  console.log('[WHATSAPP PLAN ALERTS] Iniciando job de alertas de expiração...');

  try {
    // Verificar se integração está ativa
    const config = await prisma.whatsAppConfig.findFirst({
      where: { isActive: true }
    });

    if (!config) {
      console.log('[WHATSAPP PLAN ALERTS] Integração não configurada ou inativa');
      return;
    }

    const agora = new Date();
    const tresDias = new Date(agora);
    tresDias.setDate(tresDias.getDate() + 3);
    const umDia = new Date(agora);
    umDia.setDate(umDia.getDate() + 1);

    // Usuários com plano expirando em 3 dias
    const expirando3d = await prisma.user.findMany({
      where: {
        planoAtivo: true,
        dataExpiracao: {
          gte: agora,
          lte: tresDias
        },
        whatsappOptIn: true,
        whatsappPhoneNumber: {
          not: null
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsappPhoneNumber: true,
        plano: true,
        dataExpiracao: true
      }
    });

    // Usuários com plano expirando em 1 dia
    const expirando1d = await prisma.user.findMany({
      where: {
        planoAtivo: true,
        dataExpiracao: {
          gte: agora,
          lte: umDia
        },
        whatsappOptIn: true,
        whatsappPhoneNumber: {
          not: null
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsappPhoneNumber: true,
        plano: true,
        dataExpiracao: true
      }
    });

    // Usuários com plano expirado
    const expirados = await prisma.user.findMany({
      where: {
        planoAtivo: true,
        dataExpiracao: {
          lt: agora
        },
        whatsappOptIn: true,
        whatsappPhoneNumber: {
          not: null
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsappPhoneNumber: true,
        plano: true,
        dataExpiracao: true
      }
    });

    console.log(`[WHATSAPP PLAN ALERTS] Encontrados: ${expirando3d.length} expirando em 3d, ${expirando1d.length} expirando em 1d, ${expirados.length} expirados`);

    let enviadas = 0;
    let erros = 0;

    // Processar expirando em 3 dias
    for (const usuario of expirando3d) {
      try {
        const cadence = await prisma.whatsAppCadence.findUnique({
          where: { userId: usuario.id }
        });

        if (cadence && !cadence.planExpiring3dSent) {
          await enviarAlertaExpirando3d(usuario, cadence);
          enviadas++;
        } else if (!cadence) {
          // Criar cadence se não existir
          const newCadence = await prisma.whatsAppCadence.create({
            data: { userId: usuario.id, trialStage: 'EXPIRED' }
          });
          await enviarAlertaExpirando3d(usuario, newCadence);
          enviadas++;
        }
      } catch (error: any) {
        console.error(`[WHATSAPP PLAN ALERTS] Erro ao processar usuário ${usuario.id}:`, error);
        erros++;
      }
    }

    // Processar expirando em 1 dia
    for (const usuario of expirando1d) {
      try {
        const cadence = await prisma.whatsAppCadence.findUnique({
          where: { userId: usuario.id }
        });

        if (cadence && !cadence.planExpiring1dSent) {
          await enviarAlertaExpirando1d(usuario, cadence);
          enviadas++;
        } else if (!cadence) {
          const newCadence = await prisma.whatsAppCadence.create({
            data: { userId: usuario.id, trialStage: 'EXPIRED' }
          });
          await enviarAlertaExpirando1d(usuario, newCadence);
          enviadas++;
        }
      } catch (error: any) {
        console.error(`[WHATSAPP PLAN ALERTS] Erro ao processar usuário ${usuario.id}:`, error);
        erros++;
      }
    }

    // Processar expirados
    for (const usuario of expirados) {
      try {
        const cadence = await prisma.whatsAppCadence.findUnique({
          where: { userId: usuario.id }
        });

        if (cadence && !cadence.planExpiredSent) {
          await enviarAlertaExpirado(usuario, cadence);
          enviadas++;
        } else if (!cadence) {
          const newCadence = await prisma.whatsAppCadence.create({
            data: { userId: usuario.id, trialStage: 'EXPIRED' }
          });
          await enviarAlertaExpirado(usuario, newCadence);
          enviadas++;
        }
      } catch (error: any) {
        console.error(`[WHATSAPP PLAN ALERTS] Erro ao processar usuário ${usuario.id}:`, error);
        erros++;
      }
    }

    console.log(`[WHATSAPP PLAN ALERTS] Job concluído: ${enviadas} mensagens enviadas, ${erros} erros`);

  } catch (error: any) {
    console.error('[WHATSAPP PLAN ALERTS] Erro ao executar job:', error);
  }
}

async function enviarAlertaExpirando3d(usuario: any, cadence: any) {
  const templateName = 'plan_expiring_3d';
  const isApproved = await isTemplateApproved(templateName);

  if (!isApproved) {
    console.warn(`[WHATSAPP PLAN ALERTS] Template ${templateName} não aprovado`);
    return;
  }

  const normalizedPhone = normalizePhoneNumber(usuario.whatsappPhoneNumber!);
  const frontendUrl = process.env.FRONTEND_URL || 'https://athletia.site';
  const checkoutUrl = `${frontendUrl}/checkout`;
  const dataExpiracao = usuario.dataExpiracao 
    ? new Date(usuario.dataExpiracao).toLocaleDateString('pt-BR')
    : 'em breve';

  const result = await sendTemplateMessage(
    normalizedPhone,
    templateName,
    'pt_BR',
    [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: usuario.nome || 'Atleta' },
          { type: 'text', text: usuario.plano || 'Plano' },
          { type: 'text', text: dataExpiracao },
          { type: 'text', text: checkoutUrl }
        ]
      }
    ],
    usuario.id
  );

  if (result.success) {
    await prisma.whatsAppCadence.update({
      where: { id: cadence.id },
      data: {
        planExpiring3dSent: true,
        planExpiring3dSentAt: new Date()
      }
    });
  }
}

async function enviarAlertaExpirando1d(usuario: any, cadence: any) {
  const templateName = 'plan_expiring_1d';
  const isApproved = await isTemplateApproved(templateName);

  if (!isApproved) {
    console.warn(`[WHATSAPP PLAN ALERTS] Template ${templateName} não aprovado`);
    return;
  }

  const normalizedPhone = normalizePhoneNumber(usuario.whatsappPhoneNumber!);
  const frontendUrl = process.env.FRONTEND_URL || 'https://athletia.site';
  const checkoutUrl = `${frontendUrl}/checkout`;

  const result = await sendTemplateMessage(
    normalizedPhone,
    templateName,
    'pt_BR',
    [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: usuario.nome || 'Atleta' },
          { type: 'text', text: checkoutUrl }
        ]
      }
    ],
    usuario.id
  );

  if (result.success) {
    await prisma.whatsAppCadence.update({
      where: { id: cadence.id },
      data: {
        planExpiring1dSent: true,
        planExpiring1dSentAt: new Date()
      }
    });
  }
}

async function enviarAlertaExpirado(usuario: any, cadence: any) {
  const templateName = 'plan_expired';
  const isApproved = await isTemplateApproved(templateName);

  if (!isApproved) {
    console.warn(`[WHATSAPP PLAN ALERTS] Template ${templateName} não aprovado`);
    return;
  }

  const normalizedPhone = normalizePhoneNumber(usuario.whatsappPhoneNumber!);
  const frontendUrl = process.env.FRONTEND_URL || 'https://athletia.site';
  const checkoutUrl = `${frontendUrl}/checkout`;

  const result = await sendTemplateMessage(
    normalizedPhone,
    templateName,
    'pt_BR',
    [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: usuario.nome || 'Atleta' },
          { type: 'text', text: checkoutUrl }
        ]
      }
    ],
    usuario.id
  );

  if (result.success) {
    await prisma.whatsAppCadence.update({
      where: { id: cadence.id },
      data: {
        planExpiredSent: true,
        planExpiredSentAt: new Date()
      }
    });
  }
}

