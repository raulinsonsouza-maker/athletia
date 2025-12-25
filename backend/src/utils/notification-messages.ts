/**
 * Pool de mensagens para notificações push
 * Sistema de rotação para evitar repetição
 */

export type MessageContext = 'com_treino' | 'sem_treino';

export interface MessageHistory {
  message: string;
  date: string; // ISO date string
}

export const MENSAGENS_COM_TREINO: string[] = [
  'Vamos treinar hoje? Seu treino está esperando por você!',
  'Hora de suar! Seu treino do dia está pronto',
  'Bora treinar? Seu corpo agradece cada esforço',
  'Treino do dia chegou! Vamos conquistar seus objetivos?',
  'Não deixe seu treino esperando. Hora de evoluir!',
  'Momento de evoluir! Seu treino está pronto',
  'Hora de mostrar resultados! Treino do dia aguardando',
  'Vamos lá! Seu treino personalizado está pronto',
  'Bora transformar o corpo! Treino do dia te espera',
  'Não deixe para depois! Seu treino está pronto agora',
  'Momento de quebrar limites! Vamos treinar?',
  'Seu treino te espera! Vamos conquistar seus objetivos?',
  'Hora de suar a camisa! Treino do dia está pronto',
  'Cada treino te aproxima do objetivo. Vamos lá!',
  'Treino do dia! Seu futuro eu agradece',
  'Bora trabalhar? Seu treino personalizado está pronto',
  'Hora de evoluir! Vamos treinar agora?',
  'Não perca o ritmo! Treino do dia aguardando',
  'Seu corpo pede movimento. Treino do dia está pronto!',
  'Momento de construir! Treine agora e veja os resultados'
];

export const MENSAGENS_SEM_TREINO: string[] = [
  'Não esqueça de se hidratar hoje!',
  'Uma boa alimentação faz toda diferença',
  'Dia de descanso também é importante',
  'Cuide do seu corpo mesmo sem treino',
  'Hidratação é fundamental para seus resultados',
  'Alimentação equilibrada = resultados melhores',
  'Descanso é parte do treino',
  'Não esqueça de beber água ao longo do dia',
  'Recuperação ativa: alongue-se hoje',
  'Dia de descanso é dia de se cuidar',
  'Mantenha-se hidratado para o próximo treino',
  'Alimentação de qualidade melhora seus resultados',
  'Descanso bem aproveitado = treino melhor amanhã',
  'Cuide da hidratação! Seu corpo agradece',
  'Dia livre? Aproveite para se alimentar bem',
  'Recuperação também é treino! Descanse bem',
  'Beba água! Hidratação é essencial',
  'Alimentação correta potencializa seus ganhos',
  'Descanso ativo: alongue-se e cuide do corpo',
  'Mesmo sem treino, cuide-se! Hidrate-se bem'
];

/**
 * Seleciona uma mensagem do pool evitando repetição recente
 */
export function selecionarMensagem(
  contexto: MessageContext,
  historicoMensagens: MessageHistory[] | null | undefined,
  nomeUsuario?: string
): string {
  const pool = contexto === 'com_treino' ? MENSAGENS_COM_TREINO : MENSAGENS_SEM_TREINO;
  
  // Se não há histórico, retorna mensagem aleatória
  if (!historicoMensagens || historicoMensagens.length === 0) {
    const mensagem = pool[Math.floor(Math.random() * pool.length)];
    return personalizarMensagem(mensagem, nomeUsuario);
  }

  // Calcular data de 7 dias atrás
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const seteDiasAtrasISO = seteDiasAtras.toISOString().split('T')[0];

  // Filtrar mensagens usadas nos últimos 7 dias
  const mensagensRecentes = historicoMensagens
    .filter(h => h.date >= seteDiasAtrasISO)
    .map(h => h.message);

  // Se todas as mensagens foram usadas recentemente, resetar histórico
  const mensagensDisponiveis = pool.filter(m => !mensagensRecentes.includes(m));
  
  if (mensagensDisponiveis.length === 0) {
    // Todas foram usadas, escolher qualquer uma
    const mensagem = pool[Math.floor(Math.random() * pool.length)];
    return personalizarMensagem(mensagem, nomeUsuario);
  }

  // Escolher aleatoriamente das disponíveis
  const mensagem = mensagensDisponiveis[Math.floor(Math.random() * mensagensDisponiveis.length)];
  return personalizarMensagem(mensagem, nomeUsuario);
}

/**
 * Personaliza mensagem com nome do usuário (opcional)
 */
function personalizarMensagem(mensagem: string, nomeUsuario?: string): string {
  if (!nomeUsuario) {
    return mensagem;
  }

  const primeiroNome = nomeUsuario.split(' ')[0];
  
  // Adiciona nome de forma natural no início da mensagem
  // Capitaliza a primeira letra após o nome
  if (mensagem.startsWith('Vamos')) {
    return `${primeiroNome}, vamos ${mensagem.substring(6).toLowerCase()}`;
  }
  
  if (mensagem.startsWith('Bora')) {
    return `${primeiroNome}, bora ${mensagem.substring(5).toLowerCase()}`;
  }
  
  if (mensagem.startsWith('Hora')) {
    // Para "Hora de...", mantém "Hora" e adiciona nome antes
    return `${primeiroNome}, ${mensagem.toLowerCase()}`;
  }
  
  // Para outras mensagens, adiciona o nome no início de forma natural
  if (mensagem.startsWith('Não') || mensagem.startsWith('Momento') || mensagem.startsWith('Seu') || mensagem.startsWith('Treino') || mensagem.startsWith('Cada')) {
    return `${primeiroNome}, ${mensagem.toLowerCase()}`;
  }

  // Se não se encaixa em nenhum padrão, adiciona o nome no início
  return `${primeiroNome}, ${mensagem.toLowerCase()}`;
}

/**
 * Atualiza histórico de mensagens, mantendo apenas últimas 7
 */
export function atualizarHistorico(
  historicoMensagens: MessageHistory[] | null | undefined,
  novaMensagem: string
): MessageHistory[] {
  const hoje = new Date().toISOString().split('T')[0];
  const novoHistorico: MessageHistory[] = [
    ...(historicoMensagens || []),
    { message: novaMensagem, date: hoje }
  ];

  // Manter apenas últimas 14 mensagens (mais que 7 para segurança)
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 14);
  const seteDiasAtrasISO = seteDiasAtras.toISOString().split('T')[0];

  return novoHistorico
    .filter(h => h.date >= seteDiasAtrasISO)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);
}

