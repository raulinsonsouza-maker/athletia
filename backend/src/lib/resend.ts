import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY não configurado. E-mails não serão enviados.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;

