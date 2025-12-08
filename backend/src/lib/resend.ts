import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY não configurado. E-mails não serão enviados.');
  console.error('❌ Verifique se a variável RESEND_API_KEY está definida no arquivo .env');
} else {
  // Validar formato da chave (deve começar com 're_')
  if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    console.warn('⚠️ RESEND_API_KEY não parece ter formato válido (deve começar com "re_")');
  } else {
    console.log('✅ RESEND_API_KEY configurado:', process.env.RESEND_API_KEY.substring(0, 10) + '...');
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;

