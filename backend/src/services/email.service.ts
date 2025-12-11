import resend from '../lib/resend';

const FROM_EMAIL = 'AthletIA <suporte@athletia.site>';
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
  const { nome, email, plano, dataExpiracao } = data;
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
              
              <!-- Box de Credenciais Destacado -->
              <div style="background-color: #1A1814; border: 2px solid #F9A620; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <h2 style="margin: 0 0 20px 0; color: #F9A620; font-size: 20px; font-weight: bold; text-align: center;">
                  🔐 Suas Credenciais de Acesso
                </h2>
                <div style="background-color: #0F0E0A; border-radius: 6px; padding: 20px; margin: 15px 0; text-align: center;">
                  <p style="margin: 0 0 10px 0; color: #E0E0E8; font-size: 14px; font-weight: 600;">Seu e-mail de login:</p>
                  <p style="margin: 0; color: #F9A620; font-size: 20px; font-weight: bold; word-break: break-all;">${email}</p>
                </div>
                <p style="margin: 15px 0 0 0; color: #E0E0E8; font-size: 14px; text-align: center; line-height: 1.6;">
                  ⚠️ <strong>Importante:</strong> Use este e-mail para fazer login na plataforma. Este é o mesmo e-mail que você usou no cadastro.
                </p>
              </div>
              
              <!-- Seção Como Acessar - Melhorada -->
              <div style="background-color: #1A1814; border-left: 4px solid #F9A620; padding: 25px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 25px 0; color: #F7F7FF; font-size: 20px; font-weight: bold;">
                  📋 Como Acessar Sua Área de Membros
                </h2>
                
                <!-- Passo 1 -->
                <div style="margin: 0 0 20px 0; padding: 15px; background-color: #0F0E0A; border-radius: 6px;">
                  <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <div style="background-color: #F9A620; color: #070600; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0;">1</div>
                    <div style="flex: 1;">
                      <p style="margin: 0 0 8px 0; color: #F7F7FF; font-size: 16px; font-weight: 600;">Acesse a página de login</p>
                      <p style="margin: 0 0 12px 0; color: #E0E0E8; font-size: 14px; line-height: 1.6;">Clique no botão abaixo ou acesse diretamente:</p>
                      <a href="${loginUrl}" style="display: inline-block; background-color: #F9A620; color: #070600; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">${loginUrl}</a>
                    </div>
                  </div>
                </div>
                
                <!-- Passo 2 -->
                <div style="margin: 0 0 20px 0; padding: 15px; background-color: #0F0E0A; border-radius: 6px;">
                  <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <div style="background-color: #F9A620; color: #070600; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0;">2</div>
                    <div style="flex: 1;">
                      <p style="margin: 0 0 8px 0; color: #F7F7FF; font-size: 16px; font-weight: 600;">Digite seu e-mail</p>
                      <p style="margin: 0 0 8px 0; color: #E0E0E8; font-size: 14px; line-height: 1.6;">No campo "E-mail", digite:</p>
                      <div style="background-color: #070600; border: 1px solid #F9A620; border-radius: 4px; padding: 10px; margin: 8px 0;">
                        <p style="margin: 0; color: #F9A620; font-size: 16px; font-weight: bold; word-break: break-all; text-align: center;">${email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Passo 3 -->
                <div style="margin: 0 0 20px 0; padding: 15px; background-color: #0F0E0A; border-radius: 6px;">
                  <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <div style="background-color: #F9A620; color: #070600; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0;">3</div>
                    <div style="flex: 1;">
                      <p style="margin: 0 0 8px 0; color: #F7F7FF; font-size: 16px; font-weight: 600;">Digite sua senha</p>
                      <p style="margin: 0; color: #E0E0E8; font-size: 14px; line-height: 1.6;">Use a senha que você criou durante o cadastro. Se esqueceu sua senha, você pode recuperá-la na página de login.</p>
                    </div>
                  </div>
                </div>
                
                <!-- Passo 4 -->
                <div style="margin: 0; padding: 15px; background-color: #0F0E0A; border-radius: 6px;">
                  <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <div style="background-color: #F9A620; color: #070600; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0;">4</div>
                    <div style="flex: 1;">
                      <p style="margin: 0 0 8px 0; color: #F7F7FF; font-size: 16px; font-weight: 600;">Comece a treinar!</p>
                      <p style="margin: 0; color: #E0E0E8; font-size: 14px; line-height: 1.6;">Após fazer login, você terá acesso completo aos seus treinos personalizados, histórico de treinos, progresso e muito mais!</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- CTA Button Principal - Maior e Mais Visível -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${loginUrl}" style="display: inline-block; background-color: #F9A620; color: #070600; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(249, 166, 32, 0.4); transition: all 0.3s ease;">
                      🚀 Acessar Minha Área de Membros Agora
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #E0E0E8; font-size: 14px; text-align: center; line-height: 1.6;">
                💡 <strong>Dica:</strong> Salve este e-mail ou anote suas credenciais em local seguro para facilitar o acesso futuro.
              </p>
              
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

interface PasswordResetEmailData {
  nome: string;
  email: string;
  token: string;
}

/**
 * Gera template HTML do e-mail de redefinição de senha
 */
function generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
  const { nome, email, token } = data;
  const resetUrl = `https://athletia.site/reset-password?token=${token}`;

  // SVG para ícone de cadeado
  const lockIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px;">
    <path d="M12 1C9.24 1 7 3.24 7 6V8H5C3.9 8 3 8.9 3 10V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V10C21 8.9 20.1 8 19 8H17V6C17 3.24 14.76 1 12 1ZM12 3C13.66 3 15 4.34 15 6V8H9V6C9 4.34 10.34 3 12 3ZM5 10H19V20H5V10Z" fill="#F9A620"/>
  </svg>`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir sua senha - AthletIA</title>
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
                ${lockIcon}
                Redefinir sua senha
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
                Recebemos uma solicitação para redefinir a senha da sua conta AthletIA associada ao e-mail <strong style="color: #F9A620;">${email}</strong>.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
                Clique no botão abaixo para criar uma nova senha:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${resetUrl}" style="display: inline-block; background-color: #F9A620; color: #070600; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(249, 166, 32, 0.4);">
                      🔐 Redefinir Minha Senha
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #E0E0E8; font-size: 14px; text-align: center; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:<br>
                <a href="${resetUrl}" style="color: #F9A620; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <!-- Aviso de Expiração -->
              <div style="background-color: #1A1814; border-left: 4px solid #F9A620; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px 0; color: #F7F7FF; font-size: 14px; font-weight: bold;">
                  ⚠️ Importante:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #E0E0E8; font-size: 14px; line-height: 1.8;">
                  <li>Este link expira em <strong>1 hora</strong></li>
                  <li>Se você não solicitou esta redefinição, ignore este e-mail</li>
                  <li>Por segurança, não compartilhe este link com ninguém</li>
                </ul>
              </div>
              
              <p style="margin: 30px 0 0 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
                Se você tiver alguma dúvida ou precisar de ajuda, nossa equipe de suporte está pronta para ajudar.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
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
 * Envia e-mail de redefinição de senha
 */
export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Verificar se Resend está configurado
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY não configurado. E-mail de redefinição não será enviado.');
      return {
        success: false,
        error: 'RESEND_API_KEY não configurado'
      };
    }

    console.log('📧 Preparando envio de e-mail de redefinição:', {
      to: data.email,
      from: FROM_EMAIL,
      subject: 'Redefinir sua senha do AthletIA'
    });

    const html = generatePasswordResetEmailHTML(data);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'Redefinir sua senha do AthletIA',
      html: html
    });

    if (result.error) {
      console.error('❌ Erro do Resend ao enviar e-mail:', result.error);
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

    console.log('✅ E-mail de redefinição enviado com sucesso:', {
      email: data.email.substring(0, 3) + '***',
      messageId: result.data.id
    });

    return {
      success: true,
      messageId: result.data.id
    };

  } catch (error: any) {
    console.error('❌ Exceção ao enviar e-mail de redefinição:', {
      message: error.message,
      stack: error.stack
    });
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao enviar e-mail'
    };
  }
}

interface RemarketingEmailData {
  nome: string;
  email: string;
}

/**
 * Gera template HTML do e-mail de remarketing 1 (10 minutos)
 * Gatilhos: Escassez, urgência, personalização
 */
function generateRemarketingEmail1HTML(data: RemarketingEmailData): string {
  const { nome, email } = data;
  const checkoutUrl = `${FRONTEND_URL}/checkout?utm_source=remarketing&utm_medium=email&utm_campaign=remarketing_10min`;

  // SVG para ícone de relógio (urgência)
  const clockIcon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px;">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 13H11V7H13V13ZM13 17H11V15H13V17Z" fill="#070600"/>
  </svg>`;

  // SVG para ícone de check (personalização)
  const checkIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 6px;">
    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#F9A620"/>
  </svg>`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu treino personalizado está quase pronto!</title>
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
                ${clockIcon}
                Seu treino personalizado está quase pronto!
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
                Você já respondeu todas as perguntas e seu treino personalizado está <strong style="color: #F9A620;">quase pronto</strong>! Falta apenas um passo para você começar a transformar seu corpo.
              </p>
              
              <!-- Destaque Personalização -->
              <div style="background-color: #1A1814; border-left: 4px solid #F9A620; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px 0; color: #F7F7FF; font-size: 20px; font-weight: bold;">O que você já fez:</h2>
                <div style="color: #E0E0E8; font-size: 14px; line-height: 2;">
                  <div style="display: flex; align-items: center; margin: 8px 0;">
                    ${checkIcon}
                    <span>Informou seu objetivo e nível de experiência</span>
                  </div>
                  <div style="display: flex; align-items: center; margin: 8px 0;">
                    ${checkIcon}
                    <span>Definiu sua rotina e disponibilidade</span>
                  </div>
                  <div style="display: flex; align-items: center; margin: 8px 0;">
                    ${checkIcon}
                    <span>Configurou seu perfil completo</span>
                  </div>
                </div>
              </div>
              
              <p style="margin: 20px 0; color: #F7F7FF; font-size: 18px; line-height: 1.6; text-align: center;">
                <strong style="color: #F9A620;">Agora é só finalizar e começar a treinar!</strong>
              </p>
              
              <!-- CTA Button Principal -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${checkoutUrl}" style="display: inline-block; background-color: #F9A620; color: #070600; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(249, 166, 32, 0.4);">
                      Finalizar e Começar Agora
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #E0E0E8; font-size: 14px; text-align: center; line-height: 1.6;">
                Seu treino personalizado está esperando por você. Não deixe para depois!
              </p>
              
              <p style="margin: 30px 0 0 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
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
 * Gera template HTML do e-mail de remarketing 2 (24 horas)
 * Gatilhos: Perda, prova social, benefícios específicos
 */
function generateRemarketingEmail2HTML(data: RemarketingEmailData): string {
  const { nome, email } = data;
  const checkoutUrl = `${FRONTEND_URL}/checkout?utm_source=remarketing&utm_medium=email&utm_campaign=remarketing_24h`;

  // SVG para ícone de pessoas (prova social)
  const peopleIcon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px;">
    <path d="M16 11C17.66 11 19 9.66 19 8C19 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 11 9.66 11 8C11 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="#070600"/>
  </svg>`;

  // SVG para ícone de estrela (benefícios)
  const starIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 6px;">
    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="#F9A620"/>
  </svg>`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Última chance: Seu treino personalizado te espera</title>
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
                ${peopleIcon}
                Última chance: Seu treino personalizado te espera
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
                Mais de <strong style="color: #F9A620;">milhares de pessoas</strong> já transformaram seus corpos com o AthletIA. Seu treino personalizado está pronto e esperando por você.
              </p>
              
              <!-- Prova Social -->
              <div style="background-color: #1A1814; border-left: 4px solid #F9A620; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 15px 0; color: #F7F7FF; font-size: 20px; font-weight: bold;">Por que o AthletIA funciona:</h2>
                <div style="color: #E0E0E8; font-size: 14px; line-height: 2;">
                  <div style="display: flex; align-items: center; margin: 8px 0;">
                    ${starIcon}
                    <span><strong>Personalização total</strong> - Treino criado especificamente para você</span>
                  </div>
                  <div style="display: flex; align-items: center; margin: 8px 0;">
                    ${starIcon}
                    <span><strong>Ajustes automáticos</strong> - Evolui junto com seu progresso</span>
                  </div>
                  <div style="display: flex; align-items: center; margin: 8px 0;">
                    ${starIcon}
                    <span><strong>Resultados reais</strong> - Comprovados por milhares de usuários</span>
                  </div>
                  <div style="display: flex; align-items: center; margin: 8px 0;">
                    ${starIcon}
                    <span><strong>Acesso imediato</strong> - Comece a treinar hoje mesmo</span>
                  </div>
                </div>
              </div>
              
              <p style="margin: 20px 0; color: #F7F7FF; font-size: 18px; line-height: 1.6; text-align: center;">
                <strong style="color: #F9A620;">Não perca a oportunidade de transformar seu corpo!</strong>
              </p>
              
              <!-- CTA Button Principal -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${checkoutUrl}" style="display: inline-block; background-color: #F9A620; color: #070600; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(249, 166, 32, 0.4);">
                      Finalizar Agora e Começar
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #E0E0E8; font-size: 14px; text-align: center; line-height: 1.6;">
                Seu treino personalizado está pronto. Não deixe seus objetivos para depois.
              </p>
              
              <p style="margin: 30px 0 0 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
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
 * Gera template HTML do e-mail de remarketing 3 (48 horas)
 * Gatilhos: FOMO, autoridade, garantia
 */
function generateRemarketingEmail3HTML(data: RemarketingEmailData): string {
  const { nome, email } = data;
  const checkoutUrl = `${FRONTEND_URL}/checkout?utm_source=remarketing&utm_medium=email&utm_campaign=remarketing_48h`;

  // SVG para ícone de escudo (garantia)
  const shieldIcon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px;">
    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 21C8.13 19.92 5 16.09 5 11.22V6.3L12 3.18L19 6.3V11.22C19 16.09 15.87 19.92 12 21Z" fill="#070600"/>
    <path d="M12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7ZM12 13C9.79 13 8 11.21 8 9C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 11.21 14.21 13 12 13Z" fill="#F9A620"/>
  </svg>`;

  // SVG para ícone de check (garantia)
  const checkIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 6px;">
    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#F9A620"/>
  </svg>`;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Não deixe seus objetivos para depois</title>
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
                ${shieldIcon}
                Não deixe seus objetivos para depois
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
                Cada dia que passa é uma oportunidade perdida de começar sua transformação. Seu treino personalizado está pronto e esperando por você há 2 dias.
              </p>
              
              <!-- Garantia Destacada -->
              <div style="background-color: #1A1814; border: 2px solid #F9A620; padding: 25px; margin: 30px 0; border-radius: 8px; text-align: center;">
                <h2 style="margin: 0 0 15px 0; color: #F9A620; font-size: 24px; font-weight: bold;">
                  Garantia Incondicional de 7 Dias
                </h2>
                <p style="margin: 0 0 20px 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
                  Teste por 7 dias. Não gostou? Devolvemos 100% do valor.
                </p>
                <div style="color: #E0E0E8; font-size: 14px; line-height: 2; text-align: left; max-width: 400px; margin: 0 auto;">
                  <div style="display: flex; align-items: center; margin: 8px 0;">
                    ${checkIcon}
                    <span>Sem perguntas</span>
                  </div>
                  <div style="display: flex; align-items: center; margin: 8px 0;">
                    ${checkIcon}
                    <span>Sem formulários</span>
                  </div>
                  <div style="display: flex; align-items: center; margin: 8px 0;">
                    ${checkIcon}
                    <span>Sem burocracia</span>
                  </div>
                  <div style="display: flex; align-items: center; margin: 8px 0;">
                    ${checkIcon}
                    <span>O risco é totalmente nosso</span>
                  </div>
                </div>
              </div>
              
              <p style="margin: 20px 0; color: #F7F7FF; font-size: 18px; line-height: 1.6; text-align: center;">
                <strong style="color: #F9A620;">O melhor momento para começar é agora!</strong>
              </p>
              
              <!-- CTA Button Principal -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${checkoutUrl}" style="display: inline-block; background-color: #F9A620; color: #070600; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(249, 166, 32, 0.4);">
                      Finalizar Agora - Sem Riscos
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #E0E0E8; font-size: 14px; text-align: center; line-height: 1.6;">
                Seu treino personalizado está a apenas um clique de distância. Não deixe seus objetivos para depois.
              </p>
              
              <p style="margin: 30px 0 0 0; color: #F7F7FF; font-size: 16px; line-height: 1.6;">
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
 * Envia e-mail de remarketing
 */
export async function sendRemarketingEmail(
  tipo: '10min' | '24h' | '48h',
  data: RemarketingEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Verificar se Resend está configurado
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY não configurado. E-mail de remarketing não será enviado.');
      return {
        success: false,
        error: 'RESEND_API_KEY não configurado'
      };
    }

    let html: string;
    let subject: string;

    switch (tipo) {
      case '10min':
        html = generateRemarketingEmail1HTML(data);
        subject = 'Seu treino personalizado está quase pronto!';
        break;
      case '24h':
        html = generateRemarketingEmail2HTML(data);
        subject = 'Última chance: Seu treino personalizado te espera';
        break;
      case '48h':
        html = generateRemarketingEmail3HTML(data);
        subject = 'Não deixe seus objetivos para depois';
        break;
      default:
        throw new Error(`Tipo de e-mail de remarketing inválido: ${tipo}`);
    }

    console.log('📧 Preparando envio de e-mail de remarketing:', {
      to: data.email.substring(0, 3) + '***',
      from: FROM_EMAIL,
      subject,
      tipo
    });

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html
    });

    if (result.error) {
      console.error('❌ Erro do Resend ao enviar e-mail:', result.error);
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

    console.log('✅ E-mail de remarketing enviado com sucesso:', {
      email: data.email.substring(0, 3) + '***',
      messageId: result.data.id,
      tipo
    });

    return {
      success: true,
      messageId: result.data.id
    };

  } catch (error: any) {
    console.error('❌ Exceção ao enviar e-mail de remarketing:', {
      message: error.message,
      stack: error.stack,
      tipo
    });
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao enviar e-mail'
    };
  }
}

