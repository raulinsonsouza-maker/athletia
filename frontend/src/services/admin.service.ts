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

