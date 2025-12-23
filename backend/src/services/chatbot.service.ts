import { prisma } from '../lib/prisma';

export interface ChatbotOption {
  id: string;
  label: string;
  action: string;
}

export const CHATBOT_OPTIONS: ChatbotOption[] = [
  { id: 'treino', label: 'Ver meu treino', action: 'treino' },
  { id: 'plano', label: 'Informações do plano', action: 'plano' },
  { id: 'faq', label: 'Dúvidas frequentes', action: 'faq' },
  { id: 'atendente', label: 'Falar com atendente', action: 'atendente' },
  { id: 'outras', label: 'Outras dúvidas', action: 'outras' }
];

export interface ChatbotResponse {
  message: string;
  options?: ChatbotOption[];
  escalateToHuman?: boolean;
  metadata?: any;
}

/**
 * Processa mensagem do usuário e retorna resposta do chatbot
 */
export async function processChatbotMessage(
  userId: string,
  message: string,
  sessionId: string
): Promise<ChatbotResponse> {
  const normalizedMessage = message.trim().toLowerCase();

  // Verificar se é uma seleção de opção
  const selectedOption = CHATBOT_OPTIONS.find(
    opt => opt.id === normalizedMessage || opt.label.toLowerCase() === normalizedMessage
  );

  if (selectedOption) {
    return await handleOption(userId, selectedOption.action, sessionId);
  }

  // Verificar palavras-chave
  if (normalizedMessage.includes('treino') || normalizedMessage.includes('exercício')) {
    return await handleOption(userId, 'treino', sessionId);
  }

  if (normalizedMessage.includes('plano') || normalizedMessage.includes('assinatura') || normalizedMessage.includes('pagamento')) {
    return await handleOption(userId, 'plano', sessionId);
  }

  if (normalizedMessage.includes('ajuda') || normalizedMessage.includes('help') || normalizedMessage.includes('duvida')) {
    return getWelcomeMessage();
  }

  // Mensagem não reconhecida - oferecer menu
  return {
    message: 'Não entendi sua mensagem. Por favor, escolha uma das opções abaixo:',
    options: CHATBOT_OPTIONS
  };
}

/**
 * Trata seleção de opção específica
 */
async function handleOption(userId: string, action: string, sessionId: string): Promise<ChatbotResponse> {
  switch (action) {
    case 'treino':
      return await handleTreinoOption(userId);
    
    case 'plano':
      return await handlePlanoOption(userId);
    
    case 'faq':
      return getFAQMessage();
    
    case 'atendente':
      return await handleEscalateToHuman(sessionId);
    
    case 'outras':
      return {
        message: 'Por favor, descreva sua dúvida e um de nossos atendentes entrará em contato em breve.',
        escalateToHuman: true
      };
    
    default:
      return getWelcomeMessage();
  }
}

/**
 * Opção: Ver meu treino
 */
async function handleTreinoOption(userId: string): Promise<ChatbotResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentTrainingId: true,
      planoAtivo: true,
      dataFimTrial: true
    }
  });

  if (!user) {
    return {
      message: '❌ Não foi possível identificar seu usuário. Por favor, entre em contato com o suporte.',
      options: CHATBOT_OPTIONS
    };
  }

  const hasAccess = user.planoAtivo || (user.dataFimTrial && new Date(user.dataFimTrial) > new Date());

  if (!hasAccess) {
    return {
      message: '❌ Seu acesso expirou. Renove seu plano para continuar treinando! 💪\n\nAcesse: https://athletia.site/checkout',
      options: CHATBOT_OPTIONS
    };
  }

  if (!user.currentTrainingId) {
    return {
      message: '📋 Você ainda não tem um treino ativo. Acesse a plataforma para criar seu primeiro treino! 🏋️\n\nAcesse: https://athletia.site/dashboard',
      options: CHATBOT_OPTIONS
    };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'https://athletia.site';
  const treinoUrl = `${frontendUrl}/treino/${user.currentTrainingId}`;

  return {
    message: `🏋️ *Seu Treino Personalizado*\n\nAcesse seu treino pelo link abaixo:\n\n${treinoUrl}\n\n💪 Bons treinos!`,
    metadata: { treinoUrl },
    options: CHATBOT_OPTIONS
  };
}

/**
 * Opção: Informações do plano
 */
async function handlePlanoOption(userId: string): Promise<ChatbotResponse> {
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
    return {
      message: '❌ Não foi possível identificar seu usuário.',
      options: CHATBOT_OPTIONS
    };
  }

  if (user.planoAtivo && user.plano) {
    const expiracao = user.dataExpiracao
      ? new Date(user.dataExpiracao).toLocaleDateString('pt-BR')
      : 'Não definida';

    return {
      message: `📋 *Seu Plano*\n\nPlano: ${user.plano}\nStatus: ✅ Ativo\nExpira em: ${expiracao}\n\nAcesse: https://athletia.site/perfil`,
      options: CHATBOT_OPTIONS
    };
  }

  if (user.dataFimTrial && new Date(user.dataFimTrial) > new Date()) {
    const diasRestantes = Math.ceil(
      (new Date(user.dataFimTrial).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      message: `🎁 *Trial Ativo*\n\nVocê tem ${diasRestantes} dia(s) restante(s) no seu trial gratuito!\n\nAproveite para conhecer todos os recursos. Se gostar, escolha um plano para continuar! 💪\n\nAcesse: https://athletia.site/checkout`,
      options: CHATBOT_OPTIONS
    };
  }

  return {
    message: `❌ *Acesso Expirado*\n\nSeu trial ou plano expirou. Renove agora para continuar treinando! 💪\n\nAcesse: https://athletia.site/checkout`,
    options: CHATBOT_OPTIONS
  };
}

/**
 * Opção: Dúvidas frequentes
 */
function getFAQMessage(): ChatbotResponse {
  return {
    message: `📚 *Dúvidas Frequentes*\n\n• *Como criar um treino?*\nAcesse o dashboard e clique em "Criar Treino".\n\n• *Como funciona o plano?*\nVocê pode escolher entre planos mensal, trimestral ou semestral.\n\n• *Preciso de equipamentos?*\nNão! Temos exercícios que podem ser feitos em casa.\n\n• *Posso cancelar?*\nSim, você pode cancelar a qualquer momento.\n\nDeseja falar com um atendente? Escolha a opção "Falar com atendente".`,
    options: CHATBOT_OPTIONS
  };
}

/**
 * Escalar para atendimento humano
 */
async function handleEscalateToHuman(sessionId: string): Promise<ChatbotResponse> {
  // Atualizar status da sessão para human
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      status: 'human'
    }
  });

  return {
    message: '✅ Sua solicitação foi encaminhada para nosso time de atendimento. Um de nossos atendentes entrará em contato em breve. Aguarde, por favor! 😊',
    escalateToHuman: true,
    options: []
  };
}

/**
 * Mensagem de boas-vindas inicial
 */
export function getWelcomeMessage(): ChatbotResponse {
  return {
    message: '👋 *Bem-vindo ao AthletIA!*\n\nComo posso ajudar você hoje? Escolha uma das opções abaixo:',
    options: CHATBOT_OPTIONS
  };
}

