"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    // Pegar email do argumento da linha de comando ou usar padrão
    const email = process.argv[2] || process.env.ADMIN_EMAIL;
    if (!email) {
        console.error('❌ Erro: Email é obrigatório');
        console.log('\n📝 Uso:');
        console.log('  npm run tornar-admin <email>');
        console.log('  ou');
        console.log('  npx tsx scripts/tornar-admin.ts <email>');
        console.log('\n💡 Exemplo:');
        console.log('  npm run tornar-admin admin@athletia.com');
        process.exit(1);
    }
    try {
        // Verificar se usuário existe
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            console.error(`❌ Usuário com email "${email}" não encontrado!`);
            process.exit(1);
        }
        if (user.role === 'ADMIN') {
            console.log(`✅ Usuário "${email}" já é ADMIN!`);
            process.exit(0);
        }
        // Atualizar role para ADMIN
        await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });
        console.log(`\n✅ Sucesso! Usuário "${email}" agora é ADMIN!`);
        console.log('\n📋 Próximos passos:');
        console.log('  1. Faça logout no sistema');
        console.log('  2. Faça login novamente');
        console.log('  3. Acesse http://localhost:5173/admin');
        console.log('\n💡 Dica: O card "⚙️ Painel Admin" aparecerá no Dashboard!\n');
    }
    catch (error) {
        console.error('❌ Erro ao tornar usuário admin:', error.message);
        process.exit(1);
    }
}
main()
    .catch(console.error)
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=tornar-admin.js.map