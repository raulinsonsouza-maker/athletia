import api from './auth.service';

/**
 * Testa envio de e-mail de remarketing para um usuário específico
 */
export async function testarEmailRemarketing(userId: string, tipo: '10min' | '24h' | '48h') {
  const response = await api.post(`/admin/usuarios/${userId}/testar-email-remarketing`, {
    tipo
  });
  return response.data;
}

/**
 * Estender trial por 1 dia
 */
export async function estenderTrial(userId: string) {
  const response = await api.post(`/admin/usuarios/${userId}/estender-trial`);
  return response.data;
}

/**
 * Converter trial em plano ativo manualmente
 */
export async function converterManual(userId: string, plano: 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' = 'MENSAL') {
  const response = await api.post(`/admin/usuarios/${userId}/converter-manual`, { plano });
  return response.data;
}

/**
 * Encerrar trial antecipadamente
 */
export async function encerrarTrial(userId: string) {
  const response = await api.post(`/admin/usuarios/${userId}/encerrar-trial`);
  return response.data;
}

