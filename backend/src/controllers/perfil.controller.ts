import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

// Buscar perfil do usuário
export const getPerfil = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const perfil = await prisma.perfil.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nome: true,
            role: true
          }
        }
      }
    });

    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil não encontrado',
        message: 'Complete seu perfil no onboarding'
      });
    }

    res.json(perfil);
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      error: 'Erro ao buscar perfil',
      message: error.message
    });
  }
};

// Criar perfil do usuário
export const createPerfil = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Verificar se já existe perfil
    const perfilExistente = await prisma.perfil.findUnique({
      where: { userId }
    });

    if (perfilExistente) {
      return res.status(400).json({
        error: 'Perfil já existe',
        message: 'Use PUT para atualizar o perfil'
      });
    }

    const {
      idade,
      sexo,
      altura,
      pesoAtual,
      percentualGordura,
      experiencia,
      objetivo,
      frequenciaSemanal,
      tempoDisponivel,
      lesoes = [],
      equipamentos = [],
      preferencias = [],
      rpePreferido
    } = req.body;

    // Validação de peso (30kg - 300kg)
    if (pesoAtual !== undefined && pesoAtual !== null && pesoAtual !== '') {
      const pesoNum = typeof pesoAtual === 'string' ? parseFloat(pesoAtual) : pesoAtual;
      if (pesoNum < 30 || pesoNum > 300) {
        return res.status(400).json({
          error: 'Peso inválido',
          message: 'O peso deve estar entre 30kg e 300kg'
        });
      }
    }

    // Converter tipos corretamente
    const perfil = await prisma.perfil.create({
      data: {
        userId,
        idade: idade !== undefined && idade !== null && idade !== '' ? (typeof idade === 'string' ? parseInt(idade) : idade) : null,
        sexo: sexo || null,
        altura: altura !== undefined && altura !== null && altura !== '' ? (typeof altura === 'string' ? parseFloat(altura) : altura) : null,
        pesoAtual: pesoAtual !== undefined && pesoAtual !== null && pesoAtual !== '' ? (typeof pesoAtual === 'string' ? parseFloat(pesoAtual) : pesoAtual) : null,
        percentualGordura: percentualGordura !== undefined && percentualGordura !== null && percentualGordura !== '' ? (typeof percentualGordura === 'string' ? parseFloat(percentualGordura) : percentualGordura) : null,
        experiencia: experiencia || null,
        objetivo: objetivo || null,
        frequenciaSemanal: frequenciaSemanal !== undefined && frequenciaSemanal !== null && frequenciaSemanal !== '' ? (typeof frequenciaSemanal === 'string' ? parseInt(frequenciaSemanal) : frequenciaSemanal) : null,
        tempoDisponivel: tempoDisponivel !== undefined && tempoDisponivel !== null && tempoDisponivel !== '' ? (typeof tempoDisponivel === 'string' ? parseInt(tempoDisponivel) : tempoDisponivel) : null,
        // SEGURANÇA: Validar que arrays contêm apenas strings e limitar tamanho
        lesoes: Array.isArray(lesoes) 
          ? lesoes.filter((item: any) => typeof item === 'string').slice(0, 20) 
          : [],
        equipamentos: Array.isArray(equipamentos) 
          ? equipamentos.filter((item: any) => typeof item === 'string').slice(0, 20) 
          : [],
        preferencias: Array.isArray(preferencias) 
          ? preferencias.filter((item: any) => typeof item === 'string').slice(0, 20) 
          : [],
        rpePreferido: rpePreferido !== undefined && rpePreferido !== null && rpePreferido !== '' ? (typeof rpePreferido === 'string' ? parseInt(rpePreferido) : rpePreferido) : null,
        ultimaAtualizacaoPeriodica: new Date() // Marcar data inicial da atualização periódica
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nome: true
          }
        }
      }
    });

    // Validação de peso antes de criar histórico
    if (pesoAtual !== undefined && pesoAtual !== null && pesoAtual !== '') {
      const pesoNum = typeof pesoAtual === 'string' ? parseFloat(pesoAtual) : pesoAtual
      if (!isNaN(pesoNum)) {
        // Validar peso (30kg - 300kg)
        if (pesoNum < 30 || pesoNum > 300) {
          return res.status(400).json({
            error: 'Peso inválido',
            message: 'O peso deve estar entre 30kg e 300kg'
          });
        }
        await prisma.historicoPeso.create({
          data: {
            userId,
            peso: pesoNum
          }
        });
      }
    }

    // Após criar o perfil, gerar treinos para os próximos 30 dias
    try {
      const { gerarTreinos30Dias } = await import('../services/treino.service');
      console.log(`🔄 Gerando treinos para os próximos 30 dias para o usuário ${userId}...`);
      const treinosGerados = await gerarTreinos30Dias(userId);
      console.log(`✅ ${treinosGerados.length} treinos gerados com sucesso!`);
      
      if (treinosGerados.length === 0) {
        console.warn('⚠️ Nenhum treino foi gerado. Verifique se há exercícios cadastrados e se a frequência semanal está configurada.');
      }
    } catch (error: any) {
      // Não falhar a criação do perfil se houver erro ao gerar treinos
      console.error('⚠️ Erro ao gerar treinos após onboarding:', error);
      console.error('⚠️ Detalhes do erro:', error.message);
      console.error('⚠️ Stack:', error.stack);
      // Continuar mesmo com erro - o usuário pode gerar treinos manualmente depois
    }

    res.status(201).json({
      message: 'Perfil criado com sucesso. Treinos para os próximos 30 dias foram gerados automaticamente.',
      perfil
    });
  } catch (error: any) {
    console.error('Erro ao criar perfil:', error);
    console.error('Dados recebidos:', req.body);
    
    // Se for erro de validação do Prisma, retornar mensagem mais clara
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Perfil já existe para este usuário',
        message: 'Use PUT para atualizar o perfil'
      });
    }
    
    // SEGURANÇA: Nunca expor stack trace em respostas
    // Logar apenas no servidor
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    res.status(500).json({
      error: 'Erro ao criar perfil',
      message: error.message
    });
  }
};

// Atualizar perfil do usuário
export const updatePerfil = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const {
      idade,
      sexo,
      altura,
      pesoAtual,
      percentualGordura,
      experiencia,
      objetivo,
      frequenciaSemanal,
      tempoDisponivel,
      lesoes,
      equipamentos,
      preferencias,
      rpePreferido,
      user
    } = req.body;

    // Verificar se perfil existe
    const perfilExistente = await prisma.perfil.findUnique({
      where: { userId }
    });

    if (!perfilExistente) {
      return res.status(404).json({
        error: 'Perfil não encontrado',
        message: 'Use POST para criar o perfil'
      });
    }

    // Preparar dados para atualização
    const dadosAtualizacao: any = {};

    if (idade !== undefined) dadosAtualizacao.idade = idade !== null && idade !== '' ? (typeof idade === 'string' ? parseInt(idade) : idade) : null;
    if (sexo !== undefined) dadosAtualizacao.sexo = sexo || null;
    if (altura !== undefined) dadosAtualizacao.altura = altura !== null && altura !== '' ? (typeof altura === 'string' ? parseFloat(altura) : altura) : null;
    if (pesoAtual !== undefined) {
      dadosAtualizacao.pesoAtual = pesoAtual !== null && pesoAtual !== '' ? (typeof pesoAtual === 'string' ? parseFloat(pesoAtual) : pesoAtual) : null;

      // Se peso mudou, criar novo registro no histórico
      if (pesoAtual && parseFloat(pesoAtual) !== perfilExistente.pesoAtual) {
        await prisma.historicoPeso.create({
          data: {
            userId,
            peso: parseFloat(pesoAtual)
          }
        });
      }
    }
    if (percentualGordura !== undefined) dadosAtualizacao.percentualGordura = percentualGordura !== null && percentualGordura !== '' ? (typeof percentualGordura === 'string' ? parseFloat(percentualGordura) : percentualGordura) : null;
    if (experiencia !== undefined) dadosAtualizacao.experiencia = experiencia || null;
    if (objetivo !== undefined) dadosAtualizacao.objetivo = objetivo || null;
    if (frequenciaSemanal !== undefined) dadosAtualizacao.frequenciaSemanal = frequenciaSemanal !== null && frequenciaSemanal !== '' ? (typeof frequenciaSemanal === 'string' ? parseInt(frequenciaSemanal) : frequenciaSemanal) : null;
    if (tempoDisponivel !== undefined) dadosAtualizacao.tempoDisponivel = tempoDisponivel !== null && tempoDisponivel !== '' ? (typeof tempoDisponivel === 'string' ? parseInt(tempoDisponivel) : tempoDisponivel) : null;
    if (lesoes !== undefined) dadosAtualizacao.lesoes = Array.isArray(lesoes) ? lesoes : [];
    if (equipamentos !== undefined) dadosAtualizacao.equipamentos = Array.isArray(equipamentos) ? equipamentos : [];
    if (preferencias !== undefined) dadosAtualizacao.preferencias = Array.isArray(preferencias) ? preferencias : [];
    if (rpePreferido !== undefined) dadosAtualizacao.rpePreferido = rpePreferido !== null && rpePreferido !== '' ? (typeof rpePreferido === 'string' ? parseInt(rpePreferido) : rpePreferido) : null;

    const perfil = await prisma.perfil.update({
      where: { userId },
      data: dadosAtualizacao,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nome: true
          }
        }
      }
    });

    // Atualizar nome do usuário, se enviado (com sanitização)
    if (user && typeof user.nome === 'string') {
      let nomeSanitizado = user.nome;
      const nomeLower = nomeSanitizado.toLowerCase();
      const palavrasTeste = ['teste', 'test', 'demo', 'trial', 'temp', 'temporary'];
      if (palavrasTeste.some(palavra => nomeLower.includes(palavra))) {
        // Se contém palavra de teste, usar apenas primeiro nome
        const primeiroNome = nomeSanitizado.split(' ')[0];
        nomeSanitizado = primeiroNome.length > 2 ? primeiroNome : nomeSanitizado;
      }
      
      await prisma.user.update({
        where: { id: perfil.user.id },
        data: { nome: nomeSanitizado }
      });
      // Atualizar objeto de retorno em memória
      (perfil as any).user.nome = nomeSanitizado;
    }

    res.json({
      message: 'Perfil atualizado com sucesso',
      perfil
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro ao atualizar perfil',
      message: error.message
    });
  }
};

// Atualização periódica (a cada 30 dias) - coleta peso, percentual de gordura e lesões
// Detecta mudanças críticas e regenera treinos quando necessário
export const atualizacaoPeriodica = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { pesoAtual, percentualGordura, lesoes, frequenciaSemanal, objetivo, experiencia } = req.body;

    console.log(`[ATUALIZAÇÃO-PERIÓDICA] Iniciando atualização periódica para usuário ${userId}`);

    // Buscar perfil atual (backup antes da atualização para comparação)
    const perfilAnterior = await prisma.perfil.findUnique({
      where: { userId }
    });

    if (!perfilAnterior) {
      return res.status(404).json({
        error: 'Perfil não encontrado'
      });
    }

    // Verificar se já passaram 30 dias desde a última atualização
    const hoje = new Date();
    const ultimaAtualizacao = perfilAnterior.ultimaAtualizacaoPeriodica || perfilAnterior.createdAt;
    const diasDesdeUltimaAtualizacao = Math.floor((hoje.getTime() - ultimaAtualizacao.getTime()) / (1000 * 60 * 60 * 24));

    // Detectar mudanças críticas que requerem regeneração de treinos
    const mudancasCriticas: string[] = [];
    
    if (frequenciaSemanal !== undefined && frequenciaSemanal !== null && frequenciaSemanal !== perfilAnterior.frequenciaSemanal) {
      mudancasCriticas.push(`frequência semanal: ${perfilAnterior.frequenciaSemanal} → ${frequenciaSemanal}`);
    }

    if (objetivo !== undefined && objetivo !== null && objetivo !== perfilAnterior.objetivo) {
      mudancasCriticas.push(`objetivo: ${perfilAnterior.objetivo} → ${objetivo}`);
    }

    if (experiencia !== undefined && experiencia !== null && experiencia !== perfilAnterior.experiencia) {
      mudancasCriticas.push(`experiência: ${perfilAnterior.experiencia} → ${experiencia}`);
    }

    // Verificar mudanças em lesões (comparar arrays)
    if (lesoes !== undefined && Array.isArray(lesoes)) {
      const lesoesAnteriores = perfilAnterior.lesoes || [];
      const lesoesAnterioresSorted = [...lesoesAnteriores].sort().join(',');
      const lesoesNovasSorted = [...lesoes].sort().join(',');
      
      if (lesoesAnterioresSorted !== lesoesNovasSorted) {
        mudancasCriticas.push(`lesões: [${lesoesAnteriores.join(', ')}] → [${lesoes.join(', ')}]`);
      }
    }

    // Se há mudanças críticas, permitir atualização mesmo antes de 30 dias
    const permiteAtualizacaoAntecipada = mudancasCriticas.length > 0;
    
    if (!permiteAtualizacaoAntecipada && diasDesdeUltimaAtualizacao < 30) {
      return res.status(400).json({
        error: 'Ainda não é hora de atualizar',
        message: `Faltam ${30 - diasDesdeUltimaAtualizacao} dias para a próxima atualização periódica`,
        diasRestantes: 30 - diasDesdeUltimaAtualizacao
      });
    }

    // Log de auditoria das mudanças
    if (mudancasCriticas.length > 0) {
      console.log(`[ATUALIZAÇÃO-PERIÓDICA] Mudanças críticas detectadas (${mudancasCriticas.length}):`);
      mudancasCriticas.forEach(mudanca => {
        console.log(`  - ${mudanca}`);
      });
      console.log(`[ATUALIZAÇÃO-PERIÓDICA] Regeneração de treinos será realizada mesmo com ${diasDesdeUltimaAtualizacao} dias desde última atualização`);
    } else {
      console.log(`[ATUALIZAÇÃO-PERIÓDICA] Sem mudanças críticas detectadas. Dias desde última atualização: ${diasDesdeUltimaAtualizacao}`);
    }

    // Preparar dados de atualização
    const dadosAtualizacao: any = {
      ultimaAtualizacaoPeriodica: hoje
    };

    if (pesoAtual !== undefined && pesoAtual !== null && pesoAtual !== '') {
      const pesoNum = typeof pesoAtual === 'string' ? parseFloat(pesoAtual) : pesoAtual;
      if (!isNaN(pesoNum)) {
        dadosAtualizacao.pesoAtual = pesoNum;
        // Criar registro no histórico
        await prisma.historicoPeso.create({
          data: {
            userId,
            peso: pesoNum
          }
        });
        console.log(`[ATUALIZAÇÃO-PERIÓDICA] Peso atualizado: ${perfilAnterior.pesoAtual || 'N/A'} → ${pesoNum} kg`);
      }
    }

    if (percentualGordura !== undefined && percentualGordura !== null && percentualGordura !== '') {
      dadosAtualizacao.percentualGordura = typeof percentualGordura === 'string' ? parseFloat(percentualGordura) : percentualGordura;
      console.log(`[ATUALIZAÇÃO-PERIÓDICA] Percentual de gordura atualizado: ${perfilAnterior.percentualGordura || 'N/A'} → ${dadosAtualizacao.percentualGordura}%`);
    }

    if (lesoes !== undefined && Array.isArray(lesoes)) {
      dadosAtualizacao.lesoes = lesoes;
    }

    // Adicionar mudanças críticas se fornecidas
    if (frequenciaSemanal !== undefined && frequenciaSemanal !== null) {
      dadosAtualizacao.frequenciaSemanal = frequenciaSemanal;
    }

    if (objetivo !== undefined && objetivo !== null) {
      dadosAtualizacao.objetivo = objetivo;
    }

    if (experiencia !== undefined && experiencia !== null) {
      dadosAtualizacao.experiencia = experiencia;
    }

    // Atualizar perfil
    const perfilAtualizado = await prisma.perfil.update({
      where: { userId },
      data: dadosAtualizacao
    });

    console.log(`[ATUALIZAÇÃO-PERIÓDICA] Perfil atualizado com sucesso`);

    // Gerar novos treinos para os próximos 30 dias baseado nos dados atualizados
    try {
      const { gerarTreinos30Dias } = await import('../services/treino.service');
      console.log(`[ATUALIZAÇÃO-PERIÓDICA] Gerando novos treinos para os próximos 30 dias...`);
      
      // Deletar treinos futuros não concluídos para regenerar
      const hojeLimpo = new Date();
      hojeLimpo.setHours(0, 0, 0, 0);
      
      const treinosDeletados = await prisma.treino.deleteMany({
        where: {
          userId,
          data: {
            gte: hojeLimpo
          },
          concluido: false
        }
      });

      console.log(`[ATUALIZAÇÃO-PERIÓDICA] ${treinosDeletados.count} treino(s) futuro(s) deletado(s) para regeneração`);

      const treinosGerados = await gerarTreinos30Dias(userId);
      console.log(`[ATUALIZAÇÃO-PERIÓDICA] ✅ ${treinosGerados.length} novos treinos gerados com sucesso!`);

      res.json({
        message: 'Atualização periódica realizada com sucesso. Novos treinos foram gerados para os próximos 30 dias.',
        perfil: perfilAtualizado,
        treinosGerados: treinosGerados.length,
        mudancasCriticas: mudancasCriticas.length > 0 ? mudancasCriticas : undefined,
        permiteAtualizacaoAntecipada,
        proximaAtualizacao: new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 dias a partir de hoje
      });
    } catch (error: any) {
      console.error('[ATUALIZAÇÃO-PERIÓDICA] ⚠️ Erro ao gerar treinos após atualização periódica:', error);
      // Retornar sucesso na atualização mesmo se houver erro ao gerar treinos
      res.json({
        message: 'Perfil atualizado com sucesso, mas houve erro ao gerar novos treinos. Tente gerar manualmente.',
        perfil: perfilAtualizado,
        erroTreinos: error.message,
        mudancasCriticas: mudancasCriticas.length > 0 ? mudancasCriticas : undefined
      });
    }
  } catch (error: any) {
    console.error('[ATUALIZAÇÃO-PERIÓDICA] Erro na atualização periódica:', error);
    res.status(500).json({
      error: 'Erro na atualização periódica',
      message: error.message
    });
  }
};

// Verificar se precisa de atualização periódica
export const verificarAtualizacaoPeriodica = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const perfil = await prisma.perfil.findUnique({
      where: { userId }
    });

    if (!perfil) {
      return res.status(404).json({
        error: 'Perfil não encontrado'
      });
    }

    const hoje = new Date();
    const ultimaAtualizacao = perfil.ultimaAtualizacaoPeriodica || perfil.createdAt;
    const diasDesdeUltimaAtualizacao = Math.floor((hoje.getTime() - ultimaAtualizacao.getTime()) / (1000 * 60 * 60 * 24));
    const diasRestantes = 30 - diasDesdeUltimaAtualizacao;
    const precisaAtualizar = diasDesdeUltimaAtualizacao >= 30;

    res.json({
      precisaAtualizar,
      diasDesdeUltimaAtualizacao,
      diasRestantes: precisaAtualizar ? 0 : diasRestantes,
      ultimaAtualizacao,
      proximaAtualizacao: new Date(ultimaAtualizacao.getTime() + 30 * 24 * 60 * 60 * 1000)
    });
  } catch (error: any) {
    console.error('Erro ao verificar atualização periódica:', error);
    res.status(500).json({
      error: 'Erro ao verificar atualização periódica',
      message: error.message
    });
  }
};
