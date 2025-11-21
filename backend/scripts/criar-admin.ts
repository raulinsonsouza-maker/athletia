import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ⚠️ AVISO DE SEGURANÇA: Este script é APENAS para desenvolvimento/teste
  // NUNCA use estas credenciais em produção!
  // A senha 'admin' é extremamente insegura e deve ser alterada imediatamente após primeiro acesso.
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ ERRO: Este script não deve ser executado em produção!');
    console.error('   Use um método seguro para criar usuários administradores em produção.');
    process.exit(1);
  }

  const email = 'admin';
  const senha = 'admin'; // ⚠️ SENHA HARDCODED APENAS PARA DESENVOLVIMENTO
  const nome = 'Administrador';

  console.log('⚠️  AVISO: Criando usuário administrador com credenciais padrão (apenas para desenvolvimento)\n');
  console.log('🔐 Criando usuário administrador...\n');

  try {
    // Verificar se já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      if (existingUser.role === 'ADMIN') {
        console.log('✅ Usuário admin já existe!');
        console.log(`   Email: ${email}`);
        console.log(`   Senha: ${senha}`);
        console.log(`   Role: ${existingUser.role}\n`);
        return;
      } else {
        // Atualizar para admin
        await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        });
        console.log('✅ Usuário atualizado para ADMIN!');
        console.log(`   Email: ${email}`);
        console.log(`   Senha: ${senha}\n`);
        return;
      }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        email,
        senhaHash,
        nome,
        role: 'ADMIN'
      }
    });

    console.log('✅ Usuário administrador criado com sucesso!\n');
    console.log('📋 Credenciais:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${senha}`);
    console.log(`   Role: ${admin.role}\n`);
    console.log('🌐 Acesse:');
    console.log('   http://localhost:5173/admin/login\n');
  } catch (error: any) {
    console.error('❌ Erro ao criar admin:', error.message);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

