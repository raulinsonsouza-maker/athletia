import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testarBanco() {
  console.log('🔍 Testando conexão com o banco de dados...\n');

  try {
    // Teste 1: Conectar ao banco
    console.log('1️⃣ Testando conexão...');
    await prisma.$connect();
    console.log('   ✅ Conexão estabelecida com sucesso!\n');

    // Teste 2: Verificar se as tabelas existem
    console.log('2️⃣ Verificando tabelas...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Tabela 'users' existe (${userCount} usuários)\n`);

    // Teste 3: Listar usuários
    console.log('3️⃣ Listando usuários...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nome: true,
        role: true,
        createdAt: true
      },
      take: 5
    });

    if (users.length === 0) {
      console.log('   ⚠️  Nenhum usuário encontrado no banco\n');
    } else {
      console.log(`   ✅ ${users.length} usuário(s) encontrado(s):\n`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${user.nome || 'Sem nome'}`);
      });
      console.log('');
    }

    // Teste 4: Verificar exercícios
    console.log('4️⃣ Verificando exercícios...');
    const exercicioCount = await prisma.exercicio.count();
    console.log(`   ✅ Tabela 'exercicios' existe (${exercicioCount} exercícios)\n`);

    // Teste 5: Verificar perfis
    console.log('5️⃣ Verificando perfis...');
    const perfilCount = await prisma.perfil.count();
    console.log(`   ✅ Tabela 'perfis' existe (${perfilCount} perfis)\n`);

    // Teste 6: Verificar treinos
    console.log('6️⃣ Verificando treinos...');
    const treinoCount = await prisma.treino.count();
    console.log(`   ✅ Tabela 'treinos' existe (${treinoCount} treinos)\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ BANCO DE DADOS ESTÁ FUNCIONANDO CORRETAMENTE!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error: any) {
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ ERRO AO TESTAR BANCO DE DADOS');
    console.error('═══════════════════════════════════════════════════════════\n');
    console.error('Erro:', error.message);
    console.error('\nPossíveis causas:');
    console.error('1. PostgreSQL não está rodando');
    console.error('2. DATABASE_URL incorreto no arquivo .env');
    console.error('3. Banco de dados "athletia" não existe');
    console.error('4. Migrations não foram executadas');
    console.error('\nSoluções:');
    console.error('1. Inicie o PostgreSQL');
    console.error('2. Verifique o arquivo backend/.env');
    console.error('3. Execute: npm run prisma:migrate');
    console.error('4. Execute: npm run prisma:seed\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testarBanco()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

