import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

const uploadPath = '/opt/athletia/backend/upload/exercicios';

async function restaurarGifs() {
  try {
    console.log('🔍 Verificando arquivos em:', uploadPath);
    
    if (!fs.existsSync(uploadPath)) {
      console.error('❌ Pasta não encontrada:', uploadPath);
      process.exit(1);
    }

    // Listar todos os diretórios
    const diretorios = fs.readdirSync(uploadPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`📁 Encontrados ${diretorios.length} diretórios`);
    console.log('');

    let atualizados = 0;
    let naoEncontrados = 0;
    const detalhes: string[] = [];

    for (const dirName of diretorios) {
      const gifPath = path.join(uploadPath, dirName, 'exercicio.gif');
      
      if (!fs.existsSync(gifPath)) {
        continue;
      }

      // Tentar encontrar exercício pelo ID (se dirName for UUID)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      let exercicio = null;
      
      if (uuidPattern.test(dirName)) {
        // É um UUID, buscar pelo ID
        exercicio = await prisma.exercicio.findUnique({
          where: { id: dirName },
          select: { id: true, nome: true, gifUrl: true }
        });
      }
      
      // Se não encontrou pelo UUID, tentar buscar pelo nome (normalizar)
      if (!exercicio) {
        const nomeNormalizado = dirName
          .toLowerCase()
          .replace(/-/g, ' ')
          .replace(/_/g, ' ');
        
        // Buscar exercícios e tentar encontrar por similaridade de nome
        const todosExercicios = await prisma.exercicio.findMany({
          select: { id: true, nome: true, gifUrl: true }
        });
        
        // Tentar match exato (case insensitive)
        exercicio = todosExercicios.find(
          ex => ex.nome.toLowerCase().replace(/[^a-z0-9]/g, ' ') === nomeNormalizado
        );
        
        // Se não encontrou, tentar match parcial
        if (!exercicio) {
          exercicio = todosExercicios.find(
            ex => ex.nome.toLowerCase().includes(nomeNormalizado) || 
                  nomeNormalizado.includes(ex.nome.toLowerCase().replace(/[^a-z0-9]/g, ' '))
          );
        }
      }

      if (!exercicio) {
        naoEncontrados++;
        detalhes.push(`   ❌ ${dirName}: Exercício não encontrado no banco`);
        continue;
      }

      const novaUrl = `/api/uploads/exercicios/${exercicio.id}/exercicio.gif`;
      
      // Atualizar apenas se a URL for diferente
      if (exercicio.gifUrl !== novaUrl) {
        await prisma.exercicio.update({
          where: { id: exercicio.id },
          data: { gifUrl: novaUrl }
        });
        
        atualizados++;
        detalhes.push(`   ✅ ${exercicio.nome} (${exercicio.id}): URL atualizada`);
      } else {
        detalhes.push(`   ✓ ${exercicio.nome}: Já estava correto`);
      }
    }

    console.log('📊 Resumo:');
    console.log(`   Atualizados: ${atualizados}`);
    console.log(`   Não encontrados no banco: ${naoEncontrados}`);
    console.log('');
    
    if (detalhes.length > 0) {
      console.log('📝 Detalhes:');
      detalhes.forEach(d => console.log(d));
    }

    console.log('');
    console.log('✨ Processo concluído!');

  } catch (error: any) {
    console.error('❌ Erro:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

restaurarGifs();

