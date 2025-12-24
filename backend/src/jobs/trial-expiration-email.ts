import { prisma } from '../lib/prisma';
import { sendTrialExpirationWarningEmail } from '../services/email.service';

/**
 * Job para enviar e-mail de aviso de expiração do trial
 * Executa periodicamente para verificar usuários com trial próximo de expirar
 * e enviar e-mail de aviso quando faltam 4-6 horas para expirar
 */
export async function verificarETrialsExpirando(): Promise<void> {
  try {
    const agora = new Date();
    
    // Calcular janela de tempo: 4-6 horas no futuro
    const limiteInferior = new Date(agora);
    limiteInferior.setHours(agora.getHours() + 4);
    
    const limiteSuperior = new Date(agora);
    limiteSuperior.setHours(agora.getHours() + 6);

    console.log('🔍 Verificando usuários com trial expirando entre:', {
      de: limiteInferior.toISOString(),
      ate: limiteSuperior.toISOString()
    });

    // Buscar usuários com trial expirando na janela de 4-6 horas
    const usuarios = await prisma.user.findMany({
      where: {
        planoAtivo: false,
        trialUtilizado: true,
        dataFimTrial: {
          gte: limiteInferior,
          lte: limiteSuperior
        },
        // Verificar se já não recebeu o e-mail de aviso
        // Usando campo trialExpirationEmailSent se existir, ou verificar por outra forma
        // Por enquanto, vamos enviar apenas uma vez por usuário verificando se já foi enviado
      },
      select: {
        id: true,
        nome: true,
        email: true,
        dataFimTrial: true
      }
    });

    console.log(`📊 Encontrados ${usuarios.length} usuários com trial expirando em 4-6 horas`);

    let enviados = 0;
    let erros = 0;

    for (const usuario of usuarios) {
      if (!usuario.dataFimTrial) {
        continue;
      }

      // Calcular horas restantes
      const diffMs = usuario.dataFimTrial.getTime() - agora.getTime();
      const horasRestantes = diffMs / (1000 * 60 * 60);

      // Verificar se está na janela correta (4-6 horas)
      if (horasRestantes < 4 || horasRestantes > 6) {
        continue;
      }

      // Verificar se já recebeu e-mail de aviso de expiração
      // Usa tabela RemarketingEmail para evitar envios duplicados
      try {
        const emailJaEnviado = await prisma.remarketingEmail.findUnique({
          where: {
            userId_tipo: {
              userId: usuario.id,
              tipo: 'trial_expiration_warning'
            }
          }
        });

        if (emailJaEnviado && emailJaEnviado.enviado) {
          console.log(`⏭️ E-mail de aviso já enviado anteriormente para ${usuario.email.substring(0, 3)}***. Pulando.`);
          continue;
        }
      } catch (error: any) {
        // Se tabela não existir ou houver erro, continuar mesmo assim
        console.warn('⚠️ Erro ao verificar histórico de e-mails (continuando):', error.message);
      }

      try {
        console.log(`📧 Enviando e-mail de aviso para ${usuario.email.substring(0, 3)}*** (${horasRestantes.toFixed(1)}h restantes)`);
        
        const resultado = await sendTrialExpirationWarningEmail({
          nome: usuario.nome || 'Usuário',
          email: usuario.email,
          horasRestantes: horasRestantes,
          dataFimTrial: usuario.dataFimTrial
        });

        if (resultado.success) {
          enviados++;
          
          // Registrar envio no histórico para evitar duplicados
          try {
            await prisma.remarketingEmail.upsert({
              where: {
                userId_tipo: {
                  userId: usuario.id,
                  tipo: 'trial_expiration_warning'
                }
              },
              create: {
                userId: usuario.id,
                tipo: 'trial_expiration_warning',
                enviado: true,
                dataEnvio: new Date()
              },
              update: {
                enviado: true,
                dataEnvio: new Date()
              }
            });
          } catch (error: any) {
            // Se não conseguir salvar histórico, apenas logar (não crítico)
            console.warn('⚠️ Não foi possível salvar histórico de e-mail (não crítico):', error.message);
          }
          
          console.log(`✅ E-mail de aviso enviado com sucesso para ${usuario.email.substring(0, 3)}***`);
        } else {
          erros++;
          console.error(`❌ Erro ao enviar e-mail para ${usuario.email.substring(0, 3)}***:`, resultado.error);
        }
      } catch (error: any) {
        erros++;
        console.error(`❌ Exceção ao processar usuário ${usuario.id}:`, error.message);
      }
    }

    console.log(`✅ Job concluído: ${enviados} e-mails enviados, ${erros} erros`);
  } catch (error: any) {
    console.error('❌ Erro no job de verificação de trials expirando:', {
      message: error.message,
      stack: error.stack
    });
  }
}

/**
 * Executa o job de verificação de trials expirando
 * Pode ser chamado manualmente ou agendado via cron
 */
export async function executarJobTrialExpiration(): Promise<void> {
  console.log('🔄 Iniciando job de verificação de trials expirando...');
  await verificarETrialsExpirando();
  console.log('✅ Job de verificação de trials expirando concluído');
}
