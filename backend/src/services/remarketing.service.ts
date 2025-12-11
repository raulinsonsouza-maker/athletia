import { prisma } from '../lib/prisma';
import { sendRemarketingEmail } from './email.service';

/**
 * Tipos de e-mail de remarketing
 */
export type TipoRemarketingEmail = '10min' | '24h' | '48h';

/**
 * Interface para dados do usuário elegível
 */
interface UsuarioElegivel {
  id: string;
  email: string;
  nome: string | null;
  createdAt: Date;
}

/**
 * Verifica se um usuário já recebeu um tipo específico de e-mail de remarketing
 */
async function jaRecebeuEmail(userId: string, tipo: TipoRemarketingEmail): Promise<boolean> {
  const emailEnviado = await prisma.remarketingEmail.findUnique({
    where: {
      userId_tipo: {
        userId,
        tipo
      }
    }
  });

  return !!emailEnviado && emailEnviado.enviado;
}

/**
 * Registra que um e-mail de remarketing foi enviado
 */
async function registrarEmailEnviado(
  userId: string,
  tipo: TipoRemarketingEmail,
  messageId?: string
): Promise<void> {
  await prisma.remarketingEmail.upsert({
    where: {
      userId_tipo: {
        userId,
        tipo
      }
    },
    create: {
      userId,
      tipo,
      enviado: true,
      dataEnvio: new Date()
    },
    update: {
      enviado: true,
      dataEnvio: new Date()
    }
  });
}

/**
 * Busca usuários elegíveis para e-mail de remarketing de 10 minutos
 * Usuários que se cadastraram entre 10 e 15 minutos atrás
 */
async function buscarUsuarios10Minutos(): Promise<UsuarioElegivel[]> {
  const agora = new Date();
  const dezMinutosAtras = new Date(agora.getTime() - 10 * 60 * 1000);
  const quinzeMinutosAtras = new Date(agora.getTime() - 15 * 60 * 1000);

  const usuarios = await prisma.user.findMany({
    where: {
      planoAtivo: false, // Apenas usuários sem plano ativo
      createdAt: {
        gte: quinzeMinutosAtras,
        lte: dezMinutosAtras
      }
    },
    select: {
      id: true,
      email: true,
      nome: true,
      createdAt: true
    }
  });

  return usuarios;
}

/**
 * Busca usuários elegíveis para e-mail de remarketing de 24 horas
 * Usuários que se cadastraram entre 24h e 24h5min atrás
 */
async function buscarUsuarios24Horas(): Promise<UsuarioElegivel[]> {
  const agora = new Date();
  const vinteQuatroHorasAtras = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
  const vinteQuatroHorasCincoMinutosAtras = new Date(agora.getTime() - (24 * 60 * 60 * 1000 + 5 * 60 * 1000));

  const usuarios = await prisma.user.findMany({
    where: {
      planoAtivo: false, // Apenas usuários sem plano ativo
      createdAt: {
        gte: vinteQuatroHorasCincoMinutosAtras,
        lte: vinteQuatroHorasAtras
      }
    },
    select: {
      id: true,
      email: true,
      nome: true,
      createdAt: true
    }
  });

  return usuarios;
}

/**
 * Busca usuários elegíveis para e-mail de remarketing de 48 horas
 * Usuários que se cadastraram entre 48h e 48h5min atrás
 */
async function buscarUsuarios48Horas(): Promise<UsuarioElegivel[]> {
  const agora = new Date();
  const quarentaOitoHorasAtras = new Date(agora.getTime() - 48 * 60 * 60 * 1000);
  const quarentaOitoHorasCincoMinutosAtras = new Date(agora.getTime() - (48 * 60 * 60 * 1000 + 5 * 60 * 1000));

  const usuarios = await prisma.user.findMany({
    where: {
      planoAtivo: false, // Apenas usuários sem plano ativo
      createdAt: {
        gte: quarentaOitoHorasCincoMinutosAtras,
        lte: quarentaOitoHorasAtras
      }
    },
    select: {
      id: true,
      email: true,
      nome: true,
      createdAt: true
    }
  });

  return usuarios;
}

/**
 * Envia e-mail de remarketing para um usuário específico
 */
async function enviarEmailRemarketing(
  usuario: UsuarioElegivel,
  tipo: TipoRemarketingEmail
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se já recebeu este tipo de e-mail
    if (await jaRecebeuEmail(usuario.id, tipo)) {
      console.log(`⏭️ Usuário ${usuario.id} já recebeu e-mail de remarketing ${tipo}, pulando...`);
      return { success: true };
    }

    // Verificar se usuário ainda não tem plano ativo (pode ter ativado entre a busca e o envio)
    const user = await prisma.user.findUnique({
      where: { id: usuario.id },
      select: { planoAtivo: true }
    });

    if (!user || user.planoAtivo) {
      console.log(`⏭️ Usuário ${usuario.id} já tem plano ativo, pulando envio de e-mail ${tipo}...`);
      return { success: true };
    }

    // Enviar e-mail
    const resultado = await sendRemarketingEmail(tipo, {
      nome: usuario.nome || 'Treinador',
      email: usuario.email
    });

    if (resultado.success) {
      // Registrar envio no banco
      await registrarEmailEnviado(usuario.id, tipo, resultado.messageId);
      console.log(`✅ E-mail de remarketing ${tipo} enviado para usuário ${usuario.id}`);
      return { success: true };
    } else {
      console.error(`❌ Erro ao enviar e-mail de remarketing ${tipo} para usuário ${usuario.id}:`, resultado.error);
      return { success: false, error: resultado.error };
    }
  } catch (error: any) {
    console.error(`❌ Exceção ao enviar e-mail de remarketing ${tipo} para usuário ${usuario.id}:`, {
      message: error.message,
      stack: error.stack
    });
    return { success: false, error: error.message || 'Erro desconhecido' };
  }
}

/**
 * Processa fila de e-mails de remarketing
 * Busca usuários elegíveis e envia e-mails para cada tipo
 */
export async function processarFilaRemarketing(): Promise<{
  enviados: number;
  erros: number;
  detalhes: Array<{ tipo: TipoRemarketingEmail; enviados: number; erros: number }>;
}> {
  console.log('[REMARKETING] Iniciando processamento da fila de remarketing...');
  const inicio = Date.now();

  let totalEnviados = 0;
  let totalErros = 0;
  const detalhes: Array<{ tipo: TipoRemarketingEmail; enviados: number; erros: number }> = [];

  // Processar e-mails de 10 minutos
  try {
    console.log('[REMARKETING] Buscando usuários elegíveis para e-mail de 10 minutos...');
    const usuarios10min = await buscarUsuarios10Minutos();
    console.log(`[REMARKETING] Encontrados ${usuarios10min.length} usuários elegíveis para e-mail de 10 minutos`);

    let enviados10min = 0;
    let erros10min = 0;

    for (const usuario of usuarios10min) {
      const resultado = await enviarEmailRemarketing(usuario, '10min');
      if (resultado.success) {
        enviados10min++;
        totalEnviados++;
      } else {
        erros10min++;
        totalErros++;
      }
    }

    detalhes.push({ tipo: '10min', enviados: enviados10min, erros: erros10min });
    console.log(`[REMARKETING] E-mails de 10 minutos: ${enviados10min} enviados, ${erros10min} erros`);
  } catch (error: any) {
    console.error('[REMARKETING] Erro ao processar e-mails de 10 minutos:', error);
    detalhes.push({ tipo: '10min', enviados: 0, erros: 1 });
    totalErros++;
  }

  // Processar e-mails de 24 horas
  try {
    console.log('[REMARKETING] Buscando usuários elegíveis para e-mail de 24 horas...');
    const usuarios24h = await buscarUsuarios24Horas();
    console.log(`[REMARKETING] Encontrados ${usuarios24h.length} usuários elegíveis para e-mail de 24 horas`);

    let enviados24h = 0;
    let erros24h = 0;

    for (const usuario of usuarios24h) {
      const resultado = await enviarEmailRemarketing(usuario, '24h');
      if (resultado.success) {
        enviados24h++;
        totalEnviados++;
      } else {
        erros24h++;
        totalErros++;
      }
    }

    detalhes.push({ tipo: '24h', enviados: enviados24h, erros: erros24h });
    console.log(`[REMARKETING] E-mails de 24 horas: ${enviados24h} enviados, ${erros24h} erros`);
  } catch (error: any) {
    console.error('[REMARKETING] Erro ao processar e-mails de 24 horas:', error);
    detalhes.push({ tipo: '24h', enviados: 0, erros: 1 });
    totalErros++;
  }

  // Processar e-mails de 48 horas
  try {
    console.log('[REMARKETING] Buscando usuários elegíveis para e-mail de 48 horas...');
    const usuarios48h = await buscarUsuarios48Horas();
    console.log(`[REMARKETING] Encontrados ${usuarios48h.length} usuários elegíveis para e-mail de 48 horas`);

    let enviados48h = 0;
    let erros48h = 0;

    for (const usuario of usuarios48h) {
      const resultado = await enviarEmailRemarketing(usuario, '48h');
      if (resultado.success) {
        enviados48h++;
        totalEnviados++;
      } else {
        erros48h++;
        totalErros++;
      }
    }

    detalhes.push({ tipo: '48h', enviados: enviados48h, erros: erros48h });
    console.log(`[REMARKETING] E-mails de 48 horas: ${enviados48h} enviados, ${erros48h} erros`);
  } catch (error: any) {
    console.error('[REMARKETING] Erro ao processar e-mails de 48 horas:', error);
    detalhes.push({ tipo: '48h', enviados: 0, erros: 1 });
    totalErros++;
  }

  const tempoTotal = ((Date.now() - inicio) / 1000).toFixed(2);

  console.log('\n[REMARKETING] Processamento concluído:');
  console.log(`  - Total enviados: ${totalEnviados}`);
  console.log(`  - Total erros: ${totalErros}`);
  console.log(`  - Tempo total: ${tempoTotal}s`);

  return {
    enviados: totalEnviados,
    erros: totalErros,
    detalhes
  };
}

