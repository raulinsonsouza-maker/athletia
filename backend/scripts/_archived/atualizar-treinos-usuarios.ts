import { PrismaClient } from '@prisma/client';
import { gerarTreinoDoDia } from '../src/services/treino.service';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface RelatorioAtualizacao {
  usuariosProcessados: number;
  usuariosSemPerfil: number;
  treinosAtualizados: number;
  treinosMantidos: number;
  treinosComErro: number;
  erros: Array<{ userId: string; treinoId: string; erro: string }>;
  usuariosSemPerfilCompleto: string[];
}

/**
 * Verifica se o perfil está completo
 */
function isPerfilCompleto(perfil: any): boolean {
  return !!(
    perfil &&
    perfil.objetivo &&
    perfil.experiencia &&
    perfil.frequenciaSemanal
  );
}

/**
 * Identifica treinos a atualizar
 */
function deveAtualizarTreino(
  treino: any,
  hoje: Date,
  modo: 'conservador' | 'completo'
): boolean {
  const dataTreino = new Date(treino.data);
  dataTreino.setHours(0, 0, 0, 0);
  const hojeNormalizado = new Date(hoje);
  hojeNormalizado.setHours(0, 0, 0, 0);

  // Modo completo: atualiza todos os treinos
  if (modo === 'completo') {
    return true;
  }

  // Modo conservador: apenas futuros e não concluídos recentes
  if (modo === 'conservador') {
    // Treinos futuros
    if (dataTreino >= hojeNormalizado) {
      return true;
    }

    // Treinos não concluídos dos últimos 7 dias
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    seteDiasAtras.setHours(0, 0, 0, 0);

    if (!treino.concluido && dataTreino >= seteDiasAtras) {
      return true;
    }
  }

  return false;
}

/**
 * Script principal
 */
async function atualizarTreinosUsuarios(
  preview: boolean = true,
  modo: 'conservador' | 'completo' = 'conservador'
) {
  console.log('📝 Iniciando atualização de treinos dos usuários...\n');
  console.log(`📋 Modo: ${preview ? 'PREVIEW' : 'APLICAÇÃO'}`);
  console.log(`📋 Estratégia: ${modo === 'conservador' ? 'Conservador (futuros + não concluídos recentes)' : 'Completo (todos os treinos)'}\n`);

  const relatorio: RelatorioAtualizacao = {
    usuariosProcessados: 0,
    usuariosSemPerfil: 0,
    treinosAtualizados: 0,
    treinosMantidos: 0,
    treinosComErro: 0,
    erros: [],
    usuariosSemPerfilCompleto: []
  };

  const hoje = new Date();

  try {
    // 1. Buscar todos os usuários com perfis
    console.log('🔍 Buscando usuários com perfis...');
    const usuarios = await prisma.user.findMany({
      include: {
        perfil: true,
        treinos: {
          include: {
            exercicios: {
              include: {
                exercicio: true
              },
              orderBy: { ordem: 'asc' }
            }
          },
          orderBy: { data: 'asc' }
        }
      }
    });

    console.log(`📊 Total de usuários encontrados: ${usuarios.length}\n`);

    // 2. Processar cada usuário
    for (const usuario of usuarios) {
      // Verificar se tem perfil
      if (!usuario.perfil) {
        console.log(`⚠️  Usuário ${usuario.email} não tem perfil. Pulando...`);
        relatorio.usuariosSemPerfil++;
        continue;
      }

      // Verificar se perfil está completo
      if (!isPerfilCompleto(usuario.perfil)) {
        console.log(`⚠️  Usuário ${usuario.email} tem perfil incompleto. Pulando...`);
        relatorio.usuariosSemPerfilCompleto.push(usuario.email);
        continue;
      }

      relatorio.usuariosProcessados++;
      console.log(`\n👤 Processando usuário: ${usuario.email}`);
      console.log(`   Perfil: ${usuario.perfil.objetivo} | ${usuario.perfil.experiencia} | ${usuario.perfil.frequenciaSemanal}x/semana`);
      console.log(`   Total de treinos: ${usuario.treinos.length}`);

      // 3. Identificar treinos a atualizar
      const treinosParaAtualizar = usuario.treinos.filter(treino =>
        deveAtualizarTreino(treino, hoje, modo)
      );

      const treinosParaManter = usuario.treinos.filter(treino =>
        !deveAtualizarTreino(treino, hoje, modo)
      );

      console.log(`   Treinos para atualizar: ${treinosParaAtualizar.length}`);
      console.log(`   Treinos para manter: ${treinosParaManter.length}`);

      relatorio.treinosMantidos += treinosParaManter.length;

      // 4. Atualizar cada treino
      for (const treino of treinosParaAtualizar) {
        const dataTreino = new Date(treino.data);
        const dataFormatada = dataTreino.toLocaleDateString('pt-BR');

        try {
          if (preview) {
            console.log(`   📋 [PREVIEW] Treino de ${dataFormatada} seria atualizado`);
            relatorio.treinosAtualizados++;
            continue;
          }

          console.log(`   🔄 Atualizando treino de ${dataFormatada}...`);

          // Salvar dados do treino original
          const treinoIdOriginal = treino.id;
          const tipoOriginal = treino.tipo;
          const concluidoOriginal = treino.concluido;
          const createdAtOriginal = treino.createdAt;

          // Deletar exercícios existentes do treino
          await prisma.exercicioTreino.deleteMany({
            where: { treinoId: treinoIdOriginal }
          });

          // Deletar o treino temporariamente para que gerarTreinoDoDia crie um novo
          await prisma.treino.delete({
            where: { id: treinoIdOriginal }
          });

          // Regenerar treino usando inteligência centralizada
          const treinoRegenerado = await gerarTreinoDoDia(usuario.id, dataTreino);
          
          if (!treinoRegenerado) {
            throw new Error('Falha ao regenerar treino');
          }

          // Se gerou um novo treino, precisamos mover os exercícios
          if (treinoRegenerado.id !== treinoIdOriginal) {
            // Primeiro, restaurar o treino original
            await prisma.treino.create({
              data: {
                id: treinoIdOriginal,
                userId: usuario.id,
                data: dataTreino,
                tipo: tipoOriginal,
                tempoEstimado: treinoRegenerado.tempoEstimado,
                concluido: concluidoOriginal,
                createdAt: createdAtOriginal,
                updatedAt: new Date()
              }
            });

            // Agora mover os exercícios para o treino original
            await prisma.exercicioTreino.updateMany({
              where: { treinoId: treinoRegenerado.id },
              data: { treinoId: treinoIdOriginal }
            });
            
            // Deletar o treino novo criado
            await prisma.treino.delete({
              where: { id: treinoRegenerado.id }
            });
          } else {
            // Se o ID é o mesmo, apenas atualizar os dados do treino
            await prisma.treino.update({
              where: { id: treinoIdOriginal },
              data: {
                tempoEstimado: treinoRegenerado.tempoEstimado,
                tipo: tipoOriginal,
                updatedAt: new Date()
              }
            });
          }

          if (!treinoRegenerado) {
            throw new Error('Falha ao regenerar treino');
          }

          // Atualizar tempo estimado do treino original
          await prisma.treino.update({
            where: { id: treino.id },
            data: {
              tempoEstimado: treinoRegenerado.tempoEstimado
            }
          });

          console.log(`   ✅ Treino atualizado com sucesso! ${treinoRegenerado.exercicios.length} exercícios`);
          relatorio.treinosAtualizados++;

        } catch (error: any) {
          console.error(`   ❌ Erro ao atualizar treino de ${dataFormatada}:`, error.message);
          relatorio.treinosComErro++;
          relatorio.erros.push({
            userId: usuario.id,
            treinoId: treino.id,
            erro: error.message
          });

          // Tentar restaurar exercícios se possível (mas não crítico)
          // O treino ficará sem exercícios, mas pode ser regenerado manualmente
        }
      }
    }

    // 5. Gerar relatório
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO DE ATUALIZAÇÃO');
    console.log('='.repeat(80));
    console.log(`✅ Usuários processados: ${relatorio.usuariosProcessados}`);
    console.log(`⚠️  Usuários sem perfil: ${relatorio.usuariosSemPerfil}`);
    console.log(`⚠️  Usuários com perfil incompleto: ${relatorio.usuariosSemPerfilCompleto.length}`);
    if (relatorio.usuariosSemPerfilCompleto.length > 0) {
      console.log(`   Emails: ${relatorio.usuariosSemPerfilCompleto.join(', ')}`);
    }
    console.log(`\n📝 Treinos:`);
    console.log(`   ✅ Atualizados: ${relatorio.treinosAtualizados}`);
    console.log(`   📌 Mantidos: ${relatorio.treinosMantidos}`);
    console.log(`   ❌ Com erro: ${relatorio.treinosComErro}`);

    if (relatorio.erros.length > 0) {
      console.log(`\n❌ Erros encontrados:`);
      relatorio.erros.slice(0, 10).forEach((erro, i) => {
        console.log(`   ${i + 1}. Treino ${erro.treinoId}: ${erro.erro}`);
      });
      if (relatorio.erros.length > 10) {
        console.log(`   ... e mais ${relatorio.erros.length - 10} erros`);
      }
    }

    console.log('='.repeat(80) + '\n');

    // Salvar relatório JSON
    const relatorioPath = path.join(__dirname, 'atualizacao-treinos-relatorio.json');
    fs.writeFileSync(
      relatorioPath,
      JSON.stringify(relatorio, null, 2),
      'utf-8'
    );
    console.log(`💾 Relatório salvo em: ${relatorioPath}\n`);

    if (preview) {
      console.log('ℹ️  Modo PREVIEW ativado. Use --apply para aplicar as mudanças.\n');
    } else {
      console.log('✅ Atualização concluída!\n');
    }

  } catch (error: any) {
    console.error('❌ Erro ao atualizar treinos:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar script
const args = process.argv.slice(2);
const preview = !args.includes('--apply');
const modo = args.includes('--all') ? 'completo' : 'conservador';

atualizarTreinosUsuarios(preview, modo)
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

