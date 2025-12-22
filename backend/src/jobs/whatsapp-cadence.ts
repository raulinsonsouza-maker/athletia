import { prisma } from '../lib/prisma';
import { calcularEstagioTrial } from '../services/trial.service';
import { sendTemplateMessage, normalizePhoneNumber, isWithin24HourWindow } from '../services/whatsapp.service';
import { isTemplateApproved } from '../services/whatsapp-template.service';

/**
 * Executa job de cadência automática
 */
export async function executarCadenciaWhatsApp() {
  console.log('[WHATSAPP CADENCE] Iniciando job de cadência...');

  try {
    // Verificar se integração está ativa
    const config = await prisma.whatsAppConfig.findFirst({
      where: { isActive: true }
    });

    if (!config) {
      console.log('[WHATSAPP CADENCE] Integração não configurada ou inativa');
      return;
    }

    // Buscar usuários em trial ativo
    const agora = new Date();
    const usuariosTrial = await prisma.user.findMany({
      where: {
        dataFimTrial: {
          gte: agora // Trial ainda não expirou
        },
        planoAtivo: false, // Ainda não pagou
        whatsappOptIn: true, // Tem opt-in
        whatsappPhoneNumber: {
          not: null
        }
      },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsappPhoneNumber: true,
        dataInicioTrial: true,
        dataFimTrial: true
      }
    });

    console.log(`[WHATSAPP CADENCE] Encontrados ${usuariosTrial.length} usuários em trial com opt-in`);

    let enviadas = 0;
    let erros = 0;

    for (const usuario of usuariosTrial) {
      try {
        if (!usuario.whatsappPhoneNumber || !usuario.dataInicioTrial || !usuario.dataFimTrial) {
          continue;
        }

        // Calcular estágio do trial
        const estagioRaw = calcularEstagioTrial(
          usuario.dataInicioTrial,
          usuario.dataFimTrial,
          agora
        );
        
        // Converter 'EXPIrado' para 'EXPIRED' (enum do Prisma)
        const estagio = estagioRaw === 'EXPIrado' ? 'EXPIRED' : estagioRaw;

        // Buscar ou criar cadência
        let cadence = await prisma.whatsAppCadence.findUnique({
          where: { userId: usuario.id }
        });

        if (!cadence) {
          cadence = await prisma.whatsAppCadence.create({
            data: {
              userId: usuario.id,
              trialStage: estagio
            }
          });
        }

        // Processar cada estágio
        if (estagio === 'D1' && !cadence.d1Sent) {
          await enviarMensagemD1(usuario, cadence);
          enviadas++;
        } else if (estagio === 'D2' && !cadence.d2Sent) {
          await enviarMensagemD2(usuario, cadence);
          enviadas++;
        } else if (estagio === 'D3' && !cadence.d3Sent) {
          await enviarMensagemD3(usuario, cadence);
          enviadas++;
        } else if (estagio === 'EXPIRED' && !cadence.expiredSent) {
          await enviarMensagemExpirado(usuario, cadence);
          enviadas++;
        }

        // Atualizar estágio
        if (cadence.trialStage !== estagio) {
          await prisma.whatsAppCadence.update({
            where: { id: cadence.id },
            data: { trialStage: estagio }
          });
        }

      } catch (error: any) {
        console.error(`[WHATSAPP CADENCE] Erro ao processar usuário ${usuario.id}:`, error);
        erros++;
      }
    }

    console.log(`[WHATSAPP CADENCE] Job concluído: ${enviadas} mensagens enviadas, ${erros} erros`);

  } catch (error: any) {
    console.error('[WHATSAPP CADENCE] Erro ao executar job:', error);
  }
}

/**
 * Envia mensagem D1 - Ativação
 */
async function enviarMensagemD1(usuario: any, cadence: any) {
  const templateName = 'trial_day1_activation';
  const isApproved = await isTemplateApproved(templateName);

  if (!isApproved) {
    console.warn(`[WHATSAPP CADENCE] Template ${templateName} não aprovado para usuário ${usuario.id}`);
    return;
  }

  const normalizedPhone = normalizePhoneNumber(usuario.whatsappPhoneNumber!);
  const frontendUrl = process.env.FRONTEND_URL || 'https://athletia.site';
  const loginUrl = `${frontendUrl}/login`;

  const result = await sendTemplateMessage(
    normalizedPhone,
    templateName,
    'pt_BR',
    [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: usuario.nome || 'Atleta' },
          { type: 'text', text: loginUrl }
        ]
      }
    ],
    usuario.id
  );

  if (result.success) {
    await prisma.whatsAppCadence.update({
      where: { id: cadence.id },
      data: {
        d1Sent: true,
        d1SentAt: new Date()
      }
    });
    console.log(`[WHATSAPP CADENCE] Mensagem D1 enviada para ${usuario.email}`);
  } else {
    console.error(`[WHATSAPP CADENCE] Erro ao enviar D1 para ${usuario.email}:`, result.error);
  }
}

/**
 * Envia mensagem D2 - Engajamento
 */
async function enviarMensagemD2(usuario: any, cadence: any) {
  const templateName = 'trial_day2_engagement';
  const isApproved = await isTemplateApproved(templateName);

  if (!isApproved) {
    console.warn(`[WHATSAPP CADENCE] Template ${templateName} não aprovado para usuário ${usuario.id}`);
    return;
  }

  const normalizedPhone = normalizePhoneNumber(usuario.whatsappPhoneNumber!);
  const frontendUrl = process.env.FRONTEND_URL || 'https://athletia.site';
  const dashboardUrl = `${frontendUrl}/dashboard`;

  const result = await sendTemplateMessage(
    normalizedPhone,
    templateName,
    'pt_BR',
    [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: usuario.nome || 'Atleta' },
          { type: 'text', text: dashboardUrl }
        ]
      }
    ],
    usuario.id
  );

  if (result.success) {
    await prisma.whatsAppCadence.update({
      where: { id: cadence.id },
      data: {
        d2Sent: true,
        d2SentAt: new Date()
      }
    });
    console.log(`[WHATSAPP CADENCE] Mensagem D2 enviada para ${usuario.email}`);
  } else {
    console.error(`[WHATSAPP CADENCE] Erro ao enviar D2 para ${usuario.email}:`, result.error);
  }
}

/**
 * Envia mensagem D3 - Último dia
 */
async function enviarMensagemD3(usuario: any, cadence: any) {
  const templateName = 'trial_day3_last_day';
  const isApproved = await isTemplateApproved(templateName);

  if (!isApproved) {
    console.warn(`[WHATSAPP CADENCE] Template ${templateName} não aprovado para usuário ${usuario.id}`);
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
        d3Sent: true,
        d3SentAt: new Date()
      }
    });
    console.log(`[WHATSAPP CADENCE] Mensagem D3 enviada para ${usuario.email}`);
  } else {
    console.error(`[WHATSAPP CADENCE] Erro ao enviar D3 para ${usuario.email}:`, result.error);
  }
}

/**
 * Envia mensagem de trial expirado
 */
async function enviarMensagemExpirado(usuario: any, cadence: any) {
  const templateName = 'trial_expired';
  const isApproved = await isTemplateApproved(templateName);

  if (!isApproved) {
    console.warn(`[WHATSAPP CADENCE] Template ${templateName} não aprovado para usuário ${usuario.id}`);
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
        expiredSent: true,
        expiredSentAt: new Date()
      }
    });
    console.log(`[WHATSAPP CADENCE] Mensagem de expiração enviada para ${usuario.email}`);
  } else {
    console.error(`[WHATSAPP CADENCE] Erro ao enviar expiração para ${usuario.email}:`, result.error);
  }
}

