import { prisma } from '../lib/prisma';
import { sendTextMessage, normalizePhoneNumber } from './whatsapp.service';
import { isWithin24HourWindow } from './whatsapp.service';

interface ChatbotContext {
  state?: 'initial' | 'menu' | 'waiting_response';
  lastCommand?: string;
}

/**
 * Processa mensagem recebida e retorna resposta do chatbot
 */
export async function processIncomingMessage(
  phoneNumber: string,
  messageBody: string,
  userId?: string
): Promise<{ response: string; shouldSend: boolean }> {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  // Buscar ou criar conversa
  let conversation = await prisma.whatsAppConversation.findFirst({
    where: { phoneNumber: normalizedPhone }
  });

  if (!conversation) {
    conversation = await prisma.whatsAppConversation.create({
      data: {
        phoneNumber: normalizedPhone,
        userId: userId || null,
        status: 'open',
        messageCount: 0
      }
    });
  }

  // Obter contexto
  const context: ChatbotContext = (conversation.context as ChatbotContext) || {};

  // Processar comando
  const command = messageBody.trim().toLowerCase();
  let response = '';
  let shouldSend = true;

  // Comandos principais
  if (command === '/treino' || command === 'treino' || command.includes('treino')) {
    response = await handleTreinoCommand(userId);
    context.state = 'menu';
    context.lastCommand = 'treino';
  } else if (command === '/plano' || command === 'plano' || command.includes('plano')) {
    response = await handlePlanoCommand(userId);
    context.state = 'menu';
    context.lastCommand = 'plano';
  } else if (command === '/ajuda' || command === 'ajuda' || command === 'help' || command === 'menu') {
    response = getMenuMessage();
    context.state = 'menu';
  } else if (command === '/sair' || command === 'optout' || command === 'cancelar') {
    response = await handleOptOut(userId);
    context.state = 'initial';
  } else if (context.state === 'initial' || !context.state) {
    // Primeira mensagem - mostrar menu
    response = getWelcomeMessage();
    context.state = 'menu';
  } else {
    // Mensagem não reconhecida
    response = getUnrecognizedMessage();
  }

  // Atualizar conversa
  await prisma.whatsAppConversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: new Date(),
      messageCount: conversation.messageCount + 1,
      context: context as any
    }
  });

  return { response, shouldSend };
}

/**
 * Comando: Enviar link do treino
 */
async function handleTreinoCommand(userId?: string): Promise<string> {
  if (!userId) {
    return '❌ Não foi possível identificar seu usuário. Por favor, entre em contato com o suporte.';
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentTrainingId: true,
      planoAtivo: true,
      dataFimTrial: true
    }
  });

  if (!user) {
    return '❌ Usuário não encontrado.';
  }

  // Verificar se tem acesso
  const hasAccess = user.planoAtivo || (user.dataFimTrial && new Date(user.dataFimTrial) > new Date());

  if (!hasAccess) {
    return '❌ Seu acesso expirou. Renove seu plano para continuar treinando! 💪\n\nAcesse: https://athletia.site/checkout';
  }

  if (!user.currentTrainingId) {
    return '📋 Você ainda não tem um treino ativo. Acesse a plataforma para criar seu primeiro treino! 🏋️\n\nAcesse: https://athletia.site/dashboard';
  }

  const frontendUrl = process.env.FRONTEND_URL || 'https://athletia.site';
  const treinoUrl = `${frontendUrl}/treino/${user.currentTrainingId}`;

  return `🏋️ *Seu Treino Personalizado*\n\nAcesse seu treino pelo link abaixo:\n\n${treinoUrl}\n\n💪 Bons treinos!`;
}

/**
 * Comando: Informações sobre plano
 */
async function handlePlanoCommand(userId?: string): Promise<string> {
  if (!userId) {
    return '❌ Não foi possível identificar seu usuário.';
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plano: true,
      planoAtivo: true,
      dataExpiracao: true,
      dataFimTrial: true,
      dataInicioTrial: true
    }
  });

  if (!user) {
    return '❌ Usuário não encontrado.';
  }

  if (user.planoAtivo && user.plano) {
    const expiracao = user.dataExpiracao 
      ? new Date(user.dataExpiracao).toLocaleDateString('pt-BR')
      : 'Não definida';
    
    return `📋 *Seu Plano*\n\nPlano: ${user.plano}\nStatus: ✅ Ativo\nExpira em: ${expiracao}\n\nAcesse: https://athletia.site/meu-plano`;
  }

  if (user.dataFimTrial && new Date(user.dataFimTrial) > new Date()) {
    const diasRestantes = Math.ceil(
      (new Date(user.dataFimTrial).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return `🎁 *Trial Ativo*\n\nVocê tem ${diasRestantes} dia(s) restante(s) no seu trial gratuito!\n\nAproveite para conhecer todos os recursos. Se gostar, escolha um plano para continuar! 💪\n\nAcesse: https://athletia.site/checkout`;
  }

  return `❌ *Acesso Expirado*\n\nSeu trial ou plano expirou. Renove agora para continuar treinando! 💪\n\nAcesse: https://athletia.site/checkout`;
}

/**
 * Comando: Opt-out
 */
async function handleOptOut(userId?: string): Promise<string> {
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        whatsappOptIn: false
      }
    });
  }

  return '✅ Você optou por não receber mais mensagens proativas do AthletIA.\n\nVocê ainda pode nos enviar mensagens a qualquer momento. Se mudar de ideia, entre em contato conosco!';
}

/**
 * Mensagem de boas-vindas
 */
function getWelcomeMessage(): string {
  return `👋 *Bem-vindo ao AthletIA!*\n\nComo posso ajudar você hoje?\n\nDigite:\n• *treino* - Ver meu treino\n• *plano* - Informações do meu plano\n• *ajuda* - Ver menu de opções\n• *sair* - Cancelar mensagens automáticas`;
}

/**
 * Mensagem de menu
 */
function getMenuMessage(): string {
  return `📋 *Menu de Opções*\n\n• *treino* - Ver meu treino\n• *plano* - Informações do meu plano\n• *sair* - Cancelar mensagens automáticas\n\nDigite o comando desejado:`;
}

/**
 * Mensagem não reconhecida
 */
function getUnrecognizedMessage(): string {
  return `❓ Não entendi sua mensagem.\n\nDigite *ajuda* para ver o menu de opções disponíveis.`;
}

