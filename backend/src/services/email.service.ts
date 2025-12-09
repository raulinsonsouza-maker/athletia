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
  const loginUrl = 'https://athletia.site/login';
  const areaMembrosUrl = 'https://athletia.site/meu-plano';

  // SVG para ícone de celebração
  const celebrationIcon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px;">
    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#070600"/>
    <path d="M19 15L19.5 17.5L22 18L19.5 18.5L19 21L18.5 18.5L16 18L18.5 17.5L19 15Z" fill="#070600"/>
    <path d="M5 17L5.5 19.5L8 20L5.5 20.5L5 23L4.5 20.5L2 20L4.5 19.5L5 17Z" fill="#070600"/>
  </svg>`;

  // SVG para ícone de treino/halteres
  const muscleIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 6px;">
    <path d="M6.5 5C7.33 5 8 5.67 8 6.5C8 7.33 7.33 8 6.5 8C5.67 8 5 7.33 5 6.5C5 5.67 5.67 5 6.5 5ZM17.5 5C18.33 5 19 5.67 19 6.5C19 7.33 18.33 8 17.5 8C16.67 8 16 7.33 16 6.5C16 5.67 16.67 5 17.5 5ZM6.5 16C7.33 16 8 16.67 8 17.5C8 18.33 7.33 19 6.5 19C5.67 19 5 18.33 5 17.5C5 16.67 5.67 16 6.5 16ZM17.5 16C18.33 16 19 16.67 19 17.5C19 18.33 18.33 19 17.5 19C16.67 19 16 18.33 16 17.5C16 16.67 16.67 16 17.5 16ZM3 10H21V14H3V10Z" fill="#F9A620"/>
  </svg>`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao AthletIA!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #070600;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #070600;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #141210; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4); border: 1px solid #4A4946;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F9A620 0%, #E8940D 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #070600; font-size: 28px; font-weight: bold; display: inline-flex; align-items: center; justify-content: center;">
                ${celebrationIcon}
                Bem-vindo ao AthletIA!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
                Olá <strong style="color: #F9A620;">${nome}</strong>,
              </p>
              
              <p style="margin: 0 0 20px 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
                Parabéns! Seu pagamento foi confirmado e sua assinatura está ativa. Você agora tem acesso completo à plataforma AthletIA Premium.
              </p>
              
              <!-- Plano Info -->
              <div style="background-color: #1A1814; border-left: 4px solid #F9A620; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px 0; color: #F7F7FF; font-size: 20px; font-weight: bold;">Detalhes da sua Assinatura</h2>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #E0E0E8; font-size: 14px;"><strong>Plano:</strong></td>
                    <td style="padding: 8px 0; color: #F9A620; font-size: 14px; text-align: right; font-weight: bold;">${plano}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #E0E0E8; font-size: 14px;"><strong>Expira em:</strong></td>
                    <td style="padding: 8px 0; color: #F7F7FF; font-size: 14px; text-align: right;">${dataFormatada}</td>
                  </tr>
                </table>
              </div>
              
              <p style="margin: 0 0 30px 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
                Agora você pode acessar sua área de membros e começar a usar todos os recursos premium da plataforma:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${areaMembrosUrl}" style="display: inline-block; background-color: #F9A620; color: #070600; text-decoration: none; padding: 15px 40px; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);">Acessar Área de Membros</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
                <strong>Como acessar:</strong>
              </p>
              <ol style="margin: 0 0 30px 0; padding-left: 20px; color: #F7F7FF; font-size: 14px; line-height: 1.8;">
                <li>Acesse: <a href="${loginUrl}" style="color: #F9A620; text-decoration: none;">${loginUrl}</a></li>
                <li>Faça login com o e-mail cadastrado</li>
                <li>Comece a usar seus treinos personalizados!</li>
              </ol>
              
              <p style="margin: 0 0 20px 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
                Se você tiver alguma dúvida ou precisar de ajuda, nossa equipe de suporte está pronta para ajudar.
              </p>
              
              <p style="margin: 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
                ${muscleIcon}Bons treinos!<br>
                <strong style="color: #F9A620;">Equipe AthletIA</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0F0E0A; padding: 30px; text-align: center; border-top: 1px solid #4A4946;">
              <p style="margin: 0 0 10px 0; color: #63625F; font-size: 12px;">
                Este é um e-mail automático, por favor não responda.
              </p>
              <p style="margin: 0; color: #63625F; font-size: 12px;">
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
      subject: 'Bem-vindo ao AthletIA Premium!',
      plano: data.plano
    });

    const html = generateWelcomeEmailHTML(data);

    console.log('📧 Chamando Resend API...');
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'Bem-vindo ao AthletIA Premium!',
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

