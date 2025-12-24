/**
 * Script para gerar chaves VAPID para notificações push
 * Execute: npm run gerar-vapid-keys
 */

import webpush from 'web-push';

console.log('🔑 Gerando chaves VAPID para notificações push...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ Chaves geradas com sucesso!\n');
console.log('Adicione estas variáveis ao seu arquivo .env:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:contato@athletia.site\n`);
console.log('⚠️  IMPORTANTE: Mantenha a chave privada em segredo! Nunca commite no Git.');

