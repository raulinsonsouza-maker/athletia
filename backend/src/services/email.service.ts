import resend from '../lib/resend';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'suporte@athletia.site';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

interface WelcomeEmailData {
  nome: string;
  email: string;
  plano: string;
  dataExpiracao: Date;
}

/**
 * Formata data para exibição em português
 */
function formatarData(data: Date): string {
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Gera template HTML do e-mail de boas-vindas
 */
function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  const { nome, plano, dataExpiracao } = data;
  const dataFormatada = formatarData(dataExpiracao);
  const loginUrl = `${FRONTEND_URL}/login`;
  const areaMembrosUrl = `${FRONTEND_URL}/meu-plano`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao AthletIA!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f4f4;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Bem-vindo ao AthletIA! 🎉</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Olá <strong>${nome}</strong>,
              </p>
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Parabéns! Seu pagamento foi confirmado e sua assinatura está ativa. Você agora tem acesso completo à plataforma AthletIA Premium.
              </p>
              
              <!-- Plano Info -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #FF6B35; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 20px; font-weight: bold;">Detalhes da sua Assinatura</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong>Plano:</strong></td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right; font-weight: bold;">${plano}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong>Expira em:</strong></td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px; text-align: right;">${dataFormatada}</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Agora você pode acessar sua área de membros e começar a usar todos os recursos premium da plataforma:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${areaMembrosUrl}" style="display: inline-block; background-color: #FF6B35; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: bold; font-size: 16px;">Acessar Área de Membros</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                <strong>Como acessar:</strong>
              </p>
              <ol style="margin: 0 0 30px 0; padding-left: 20px; color: #333333; font-size: 14px; line-height: 1.8;">
                <li>Acesse: <a href="${loginUrl}" style="color: #FF6B35; text-decoration: none;">${loginUrl}</a></li>
                <li>Faça login com o e-mail cadastrado</li>
                <li>Comece a usar seus treinos personalizados!</li>
              </ol>
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Se você tiver alguma dúvida ou precisar de ajuda, nossa equipe de suporte está pronta para ajudar.
              </p>
              
              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Bons treinos! 💪<br>
                <strong>Equipe AthletIA</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px;">
                Este é um e-mail automático, por favor não responda.
              </p>
              <p style="margin: 0; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} AthletIA. Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Envia e-mail de boas-vindas após pagamento confirmado
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Verificar se Resend está configurado
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY não configurado. E-mail de boas-vindas não será enviado.');
      console.error('❌ Verifique se a variável RESEND_API_KEY está definida no arquivo .env');
      return {
        success: false,
        error: 'RESEND_API_KEY não configurado'
      };
    }

    // Verificar se o e-mail de remetente está configurado
    if (!FROM_EMAIL || FROM_EMAIL === 'suporte@athletia.site') {
      console.warn('⚠️ RESEND_FROM_EMAIL não configurado ou usando valor padrão. Verifique se está correto.');
    }

    console.log('📧 Preparando envio de e-mail:', {
      to: data.email,
      from: FROM_EMAIL,
      subject: '🎉 Bem-vindo ao AthletIA Premium!',
      plano: data.plano
    });

    const html = generateWelcomeEmailHTML(data);

    console.log('📧 Chamando Resend API...');
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: '🎉 Bem-vindo ao AthletIA Premium!',
      html: html
    });

    console.log('📧 Resposta do Resend:', JSON.stringify({
      hasError: !!result.error,
      hasData: !!result.data,
      error: result.error ? {
        name: result.error.name,
        message: result.error.message
      } : null,
      messageId: result.data?.id
    }, null, 2));

    if (result.error) {
      console.error('❌ Erro do Resend ao enviar e-mail:', {
        name: result.error.name,
        message: result.error.message,
        fullError: JSON.stringify(result.error, null, 2)
      });
      return {
        success: false,
        error: result.error.message || 'Erro desconhecido ao enviar e-mail'
      };
    }

    if (!result.data || !result.data.id) {
      console.error('❌ Resposta do Resend não contém messageId:', result);
      return {
        success: false,
        error: 'Resposta do Resend inválida (sem messageId)'
      };
    }

    console.log('✅ E-mail de boas-vindas enviado com sucesso:', {
      email: data.email,
      messageId: result.data.id,
      from: FROM_EMAIL
    });

    return {
      success: true,
      messageId: result.data.id
    };

  } catch (error: any) {
    console.error('❌ Exceção ao enviar e-mail de boas-vindas:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao enviar e-mail'
    };
  }
}

