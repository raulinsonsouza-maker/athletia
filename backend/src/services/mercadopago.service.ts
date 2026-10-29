import crypto from 'crypto';
import axios from 'axios';
import { prisma } from '../lib/prisma';

const MP_API = 'https://api.mercadopago.com';

export type PlanoId = 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL';

const PLANOS: Record<PlanoId, { nome: string; preco: number; meses: number }> = {
  MENSAL: { nome: 'Mensal', preco: 29.9, meses: 1 },
  TRIMESTRAL: { nome: 'Trimestral', preco: 49.9, meses: 3 },
  SEMESTRAL: { nome: 'Semestral', preco: 89.9, meses: 6 }
};

const planIdCache: Partial<Record<PlanoId, string>> = {};
const locks = new Set<string>();

export function isPlanoId(value: string): value is PlanoId {
  return value === 'MENSAL' || value === 'TRIMESTRAL' || value === 'SEMESTRAL';
}

export function cpfValido(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

  const digito = (base: string, fatorInicial: number) => {
    let total = 0;
    let fator = fatorInicial;
    for (const char of base) {
      total += Number(char) * fator;
      fator -= 1;
    }
    const resto = (total * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return digito(digits.slice(0, 9), 10) === Number(digits[9])
    && digito(digits.slice(0, 10), 11) === Number(digits[10]);
}

export function somenteDigitosCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

function accessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado');
  }
  return token;
}

export function publicKey(): string {
  return process.env.MERCADOPAGO_PUBLIC_KEY || '';
}

function headers(idempotencyKey?: string): Record<string, string> {
  const result: Record<string, string> = {
    Authorization: `Bearer ${accessToken()}`,
    'Content-Type': 'application/json'
  };
  if (idempotencyKey) {
    result['X-Idempotency-Key'] = idempotencyKey;
  }
  return result;
}

function frontendUrl(): string {
  return process.env.FRONTEND_URL || 'https://athletia.site';
}

function notificationUrl(): string | undefined {
  const url = process.env.MERCADOPAGO_WEBHOOK_URL;
  if (url && url.startsWith('https://')) return url;
  return undefined;
}

function logMpError(context: string, error: any) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || error?.message;
  console.error(`[MP] ${context}:`, status || '', message || 'erro');
}

export function calcularDataExpiracao(plano: PlanoId, base?: Date | null): Date {
  const data = base && base.getTime() > Date.now() ? new Date(base) : new Date();
  data.setMonth(data.getMonth() + PLANOS[plano].meses);
  return data;
}

function referencia(userId: string, plano: PlanoId): string {
  return `${userId}:${plano}`;
}

function lerReferencia(value?: string | null): { userId: string; plano: PlanoId | null } | null {
  if (!value) return null;
  const [userId, plano] = value.split(':');
  if (!userId) return null;
  return { userId, plano: plano && isPlanoId(plano) ? plano : null };
}

async function withUserLock<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  if (locks.has(userId)) {
    throw Object.assign(new Error('Já existe uma assinatura em processamento.'), { statusCode: 409 });
  }
  locks.add(userId);
  try {
    return await fn();
  } finally {
    locks.delete(userId);
  }
}

async function garantirPlano(plano: PlanoId): Promise<string> {
  if (planIdCache[plano]) return planIdCache[plano] as string;

  const config = PLANOS[plano];
  const reason = `AthletIA ${config.nome}`;

  const search = await axios.get(`${MP_API}/preapproval_plan/search`, {
    headers: headers(),
    params: { status: 'active', limit: 50 }
  });

  const existente = (search.data?.results || []).find((item: any) => item.reason === reason);
  if (existente?.id) {
    planIdCache[plano] = existente.id;
    return existente.id;
  }

  const created = await axios.post(`${MP_API}/preapproval_plan`, {
    reason,
    auto_recurring: {
      frequency: config.meses,
      frequency_type: 'months',
      transaction_amount: config.preco,
      currency_id: 'BRL'
    },
    back_url: `${frontendUrl()}/treinos`,
    payment_methods_allowed: {
      payment_types: [{ id: 'credit_card' }]
    }
  }, { headers: headers() });

  planIdCache[plano] = created.data.id;
  return created.data.id;
}

async function gerarTreinosEEmail(user: { id: string; email: string; nome: string | null; perfil: any }, plano: PlanoId, dataExpiracao: Date, primeiraVez: boolean) {
  if (!primeiraVez) return;

  try {
    const { gerarTreinos30Dias } = await import('./treino.service');
    if (user.perfil?.objetivo && user.perfil?.experiencia && user.perfil?.frequenciaSemanal) {
      await gerarTreinos30Dias(user.id);
    }
  } catch (error: any) {
    console.error('[MP] Treinos não gerados:', error?.message);
  }

  try {
    const { sendWelcomeEmail } = await import('./email.service');
    await sendWelcomeEmail({
      nome: user.nome || 'Usuário',
      email: user.email,
      plano,
      dataExpiracao
    });
  } catch (error: any) {
    console.error('[MP] E-mail de confirmação não enviado:', error?.message);
  }

  try {
    const { registrarEventoAsync } = await import('./analytics.service');
    registrarEventoAsync(user.id, 'subscription_started', {
      plan: plano,
      price: PLANOS[plano].preco,
      source: 'mercadopago'
    });
  } catch (error: any) {
    console.error('[MP] Analytics não registrado:', error?.message);
  }
}

async function ativarPlano(params: {
  userId: string;
  plano: PlanoId;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  meio: 'cartao' | 'pix';
  preapprovalId?: string | null;
  cpf?: string | null;
  raw?: unknown;
}) {
  const existente = await prisma.paymentHistory.findUnique({
    where: { transactionId: params.transactionId }
  });
  if (existente?.status === 'completed') {
    return { already: true, planoAtivo: true, plano: params.plano };
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: { perfil: true }
  });
  if (!user) {
    throw Object.assign(new Error('Usuário não encontrado'), { statusCode: 404 });
  }

  const pagamentoRecente = user.dataPagamento
    && user.planoAtivo
    && Date.now() - user.dataPagamento.getTime() < 10 * 60 * 1000
    && user.dataExpiracao
    && user.dataExpiracao.getTime() > Date.now();

  const primeiraVez = !user.planoAtivo;
  const dataExpiracao = pagamentoRecente && user.dataExpiracao
    ? user.dataExpiracao
    : calcularDataExpiracao(params.plano, user.dataExpiracao);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planoAtivo: true,
      plano: params.plano,
      dataPagamento: pagamentoRecente ? user.dataPagamento : new Date(),
      dataExpiracao,
      meioPagamento: params.meio,
      cancelamentoAgendado: false,
      ...(params.preapprovalId ? { mpPreapprovalId: params.preapprovalId } : {}),
      ...(params.cpf ? { cpf: params.cpf } : {})
    }
  });

  if (existente) {
    await prisma.paymentHistory.update({
      where: { id: existente.id },
      data: {
        status: 'completed',
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        plano: params.plano,
        gateway: 'mercadopago',
        eventType: 'purchase_approved',
        caktoData: (params.raw ?? existente.caktoData) as any
      }
    });
  } else {
    await prisma.paymentHistory.create({
      data: {
        userId: user.id,
        transactionId: params.transactionId,
        amount: params.amount,
        currency: 'BRL',
        status: 'completed',
        paymentMethod: params.paymentMethod,
        plano: params.plano,
        gateway: 'mercadopago',
        eventType: 'purchase_approved',
        caktoData: (params.raw ?? undefined) as any
      }
    });
  }

  await gerarTreinosEEmail(user, params.plano, dataExpiracao, primeiraVez && !pagamentoRecente);

  return { already: false, planoAtivo: true, plano: params.plano, dataExpiracao };
}

async function registrarPendente(params: {
  userId: string;
  plano: PlanoId;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  raw?: unknown;
}) {
  const existente = await prisma.paymentHistory.findUnique({
    where: { transactionId: params.transactionId }
  });
  if (existente) return;

  await prisma.paymentHistory.create({
    data: {
      userId: params.userId,
      transactionId: params.transactionId,
      amount: params.amount,
      currency: 'BRL',
      status: 'pending',
      paymentMethod: params.paymentMethod,
      plano: params.plano,
      gateway: 'mercadopago',
      eventType: 'payment_pending',
      caktoData: (params.raw ?? undefined) as any
    }
  });
}

function exigirUsuarioAtivoLivre(user: { planoAtivo: boolean; dataExpiracao: Date | null }) {
  if (user.planoAtivo && user.dataExpiracao && user.dataExpiracao.getTime() > Date.now()) {
    throw Object.assign(new Error('Você já tem uma assinatura ativa.'), { statusCode: 409 });
  }
}

export async function assinarComCartao(params: {
  userId: string;
  plano: PlanoId;
  cardTokenId: string;
  idempotencyKey: string;
}) {
  return withUserLock(params.userId, async () => {
    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    if (!user) throw Object.assign(new Error('Usuário não encontrado'), { statusCode: 404 });
    exigirUsuarioAtivoLivre(user);

    const planId = await garantirPlano(params.plano);
    const config = PLANOS[params.plano];

    let response;
    try {
      response = await axios.post(`${MP_API}/preapproval`, {
        preapproval_plan_id: planId,
        reason: `AthletIA ${config.nome}`,
        external_reference: referencia(params.userId, params.plano),
        payer_email: user.email,
        card_token_id: params.cardTokenId,
        status: 'authorized',
        back_url: `${frontendUrl()}/treinos`
      }, { headers: headers(params.idempotencyKey) });
    } catch (error: any) {
      logMpError('criar assinatura', error);
      throw Object.assign(new Error('Não foi possível autorizar o cartão. Confira os dados ou use outro cartão.'), { statusCode: 402 });
    }

    const status = response.data?.status as string;
    const preapprovalId = String(response.data?.id || '');

    if (status === 'authorized') {
      const ativacao = await ativarPlano({
        userId: params.userId,
        plano: params.plano,
        transactionId: `preapproval:${preapprovalId}`,
        amount: config.preco,
        paymentMethod: 'credit_card',
        meio: 'cartao',
        preapprovalId,
        raw: { id: preapprovalId, status }
      });
      return { success: true, status: 'authorized', ...ativacao };
    }

    if (status === 'pending' || status === 'in_process') {
      return {
        success: true,
        status: 'pending',
        planoAtivo: false,
        message: 'O pagamento do cartão ainda está em análise. O plano entra assim que for aprovado.'
      };
    }

    return {
      success: false,
      status: status || 'rejected',
      planoAtivo: false,
      message: 'O cartão foi recusado. Confira os dados ou use outro cartão.'
    };
  });
}

export async function criarPagamentoPix(params: {
  userId: string;
  plano: PlanoId;
  cpf: string;
  idempotencyKey: string;
  renovacao?: boolean;
}) {
  return withUserLock(params.userId, async () => {
    const user = await prisma.user.findUnique({ where: { id: params.userId } });
    if (!user) throw Object.assign(new Error('Usuário não encontrado'), { statusCode: 404 });
    if (!params.renovacao) exigirUsuarioAtivoLivre(user);

    const pendente = await prisma.paymentHistory.findFirst({
      where: {
        userId: user.id,
        plano: params.plano,
        gateway: 'mercadopago',
        status: 'pending',
        paymentMethod: 'pix',
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (pendente) {
      const atual = await consultarPagamentoPix(user.id, pendente.transactionId);
      if (atual.status === 'pending' && atual.qrCode) return atual;
    }

    const config = PLANOS[params.plano];
    const expira = new Date(Date.now() + 30 * 60 * 1000);
    const body: Record<string, unknown> = {
      transaction_amount: config.preco,
      description: `AthletIA ${config.nome}`,
      payment_method_id: 'pix',
      date_of_expiration: expira.toISOString(),
      external_reference: referencia(params.userId, params.plano),
      payer: {
        email: user.email,
        identification: { type: 'CPF', number: somenteDigitosCpf(params.cpf) }
      }
    };
    const webhook = notificationUrl();
    if (webhook) body.notification_url = webhook;

    let response;
    try {
      response = await axios.post(`${MP_API}/v1/payments`, body, {
        headers: headers(params.idempotencyKey)
      });
    } catch (error: any) {
      logMpError('criar pix', error);
      throw Object.assign(new Error('Não foi possível gerar o Pix. Tente novamente.'), { statusCode: 502 });
    }

    const payment = response.data;
    const paymentId = String(payment.id);
    const transactionData = payment.point_of_interaction?.transaction_data || {};

    await prisma.user.update({
      where: { id: user.id },
      data: { cpf: somenteDigitosCpf(params.cpf), meioPagamento: 'pix' }
    });

    await registrarPendente({
      userId: user.id,
      plano: params.plano,
      transactionId: paymentId,
      amount: config.preco,
      paymentMethod: 'pix',
      raw: { id: paymentId, status: payment.status }
    });

    if (payment.status === 'approved') {
      const ativacao = await ativarPlano({
        userId: user.id,
        plano: params.plano,
        transactionId: paymentId,
        amount: config.preco,
        paymentMethod: 'pix',
        meio: 'pix',
        cpf: somenteDigitosCpf(params.cpf),
        raw: { id: paymentId, status: payment.status }
      });
      return { success: true, status: 'approved', paymentId, ...ativacao };
    }

    return {
      success: true,
      status: payment.status || 'pending',
      paymentId,
      qrCode: transactionData.qr_code || '',
      qrCodeBase64: transactionData.qr_code_base64 || '',
      expiresAt: expira.toISOString(),
      planoAtivo: false
    };
  });
}

export async function consultarPagamentoPix(userId: string, paymentId: string) {
  const historico = await prisma.paymentHistory.findUnique({
    where: { transactionId: paymentId }
  });
  if (!historico || historico.userId !== userId || historico.gateway !== 'mercadopago') {
    throw Object.assign(new Error('Pagamento não encontrado'), { statusCode: 404 });
  }

  if (historico.status === 'completed') {
    return { success: true, status: 'approved', paymentId, planoAtivo: true, plano: historico.plano };
  }

  let payment;
  try {
    const response = await axios.get(`${MP_API}/v1/payments/${paymentId}`, { headers: headers() });
    payment = response.data;
  } catch (error: any) {
    logMpError('consultar pix', error);
    throw Object.assign(new Error('Não foi possível consultar o Pix.'), { statusCode: 502 });
  }

  const referenciaPagamento = lerReferencia(payment.external_reference);
  if (!referenciaPagamento || referenciaPagamento.userId !== userId) {
    throw Object.assign(new Error('Pagamento não encontrado'), { statusCode: 404 });
  }

  const plano = (historico.plano && isPlanoId(historico.plano) ? historico.plano : referenciaPagamento.plano) as PlanoId | null;
  const transactionData = payment.point_of_interaction?.transaction_data || {};

  if (payment.status === 'approved' && plano) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const ativacao = await ativarPlano({
      userId,
      plano,
      transactionId: paymentId,
      amount: Number(payment.transaction_amount || historico.amount),
      paymentMethod: 'pix',
      meio: 'pix',
      cpf: user?.cpf,
      raw: { id: paymentId, status: payment.status }
    });
    return { success: true, status: 'approved', paymentId, ...ativacao };
  }

  if (payment.status === 'rejected' || payment.status === 'cancelled' || payment.status === 'expired') {
    await prisma.paymentHistory.update({
      where: { id: historico.id },
      data: { status: payment.status === 'rejected' ? 'rejected' : 'cancelled' }
    });
    return {
      success: true,
      status: payment.status,
      paymentId,
      planoAtivo: false,
      message: payment.status === 'rejected'
        ? 'O Pix foi recusado.'
        : 'O Pix expirou. Gere um novo código para assinar.'
    };
  }

  return {
    success: true,
    status: 'pending',
    paymentId,
    qrCode: transactionData.qr_code || '',
    qrCodeBase64: transactionData.qr_code_base64 || '',
    planoAtivo: false
  };
}

export async function cancelarAssinatura(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Object.assign(new Error('Usuário não encontrado'), { statusCode: 404 });
  if (!user.planoAtivo) {
    throw Object.assign(new Error('Não há assinatura ativa para cancelar.'), { statusCode: 400 });
  }

  if (user.meioPagamento === 'cartao' && user.mpPreapprovalId) {
    try {
      await axios.put(`${MP_API}/preapproval/${user.mpPreapprovalId}`, {
        status: 'canceled'
      }, { headers: headers() });
    } catch (error: any) {
      logMpError('cancelar assinatura', error);
      throw Object.assign(new Error('Não foi possível cancelar a cobrança no cartão. Tente novamente.'), { statusCode: 502 });
    }
  } else if (user.meioPagamento !== 'pix' && user.meioPagamento !== 'cartao') {
    throw Object.assign(new Error('Esta assinatura foi feita no meio de pagamento anterior. Fale com o suporte para encerrar a cobrança.'), { statusCode: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { cancelamentoAgendado: true }
  });

  await prisma.paymentHistory.create({
    data: {
      userId: user.id,
      transactionId: `cancel_${user.id}_${Date.now()}`,
      amount: 0,
      currency: 'BRL',
      status: 'cancelled',
      paymentMethod: user.meioPagamento || 'cancellation',
      plano: user.plano,
      gateway: 'mercadopago',
      eventType: 'subscription_cancelled'
    }
  });

  return {
    success: true,
    cancelamentoAgendado: true,
    acessoAte: user.dataExpiracao,
    planoAtivo: true
  };
}

async function desativarPorEstorno(userId: string, transactionId: string, amount: number, eventType: string, raw?: unknown) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      planoAtivo: false,
      plano: null,
      dataPagamento: null,
      dataExpiracao: null,
      cancelamentoAgendado: true
    }
  });

  const id = `${eventType}_${transactionId}`;
  const existe = await prisma.paymentHistory.findUnique({ where: { transactionId: id } });
  if (!existe) {
    await prisma.paymentHistory.create({
      data: {
        userId,
        transactionId: id,
        amount: -Math.abs(amount),
        currency: 'BRL',
        status: eventType === 'chargeback' ? 'charged_back' : 'refunded',
        paymentMethod: eventType,
        plano: user.plano,
        gateway: 'mercadopago',
        eventType,
        caktoData: (raw ?? undefined) as any
      }
    });
  }
}

async function processarPagamento(paymentId: string) {
  const response = await axios.get(`${MP_API}/v1/payments/${paymentId}`, { headers: headers() });
  const payment = response.data;
  const ref = lerReferencia(payment.external_reference);
  if (!ref) return;

  const plano = ref.plano;
  if (payment.status === 'approved' && plano) {
    const user = await prisma.user.findUnique({ where: { id: ref.userId } });
    await ativarPlano({
      userId: ref.userId,
      plano,
      transactionId: String(payment.id),
      amount: Number(payment.transaction_amount || (plano ? PLANOS[plano].preco : 0)),
      paymentMethod: payment.payment_method_id || 'pix',
      meio: payment.payment_method_id === 'pix' ? 'pix' : 'cartao',
      cpf: user?.cpf,
      raw: { id: payment.id, status: payment.status }
    });
    return;
  }

  if (payment.status === 'refunded' || payment.status === 'charged_back') {
    await desativarPorEstorno(
      ref.userId,
      String(payment.id),
      Number(payment.transaction_amount || 0),
      payment.status === 'charged_back' ? 'chargeback' : 'refund',
      { id: payment.id, status: payment.status }
    );
  }
}

async function processarPreapproval(preapprovalId: string) {
  const response = await axios.get(`${MP_API}/preapproval/${preapprovalId}`, { headers: headers() });
  const preapproval = response.data;
  const ref = lerReferencia(preapproval.external_reference);
  if (!ref) return;

  if (preapproval.status === 'paused' || preapproval.status === 'cancelled' || preapproval.status === 'canceled') {
    await prisma.user.updateMany({
      where: { id: ref.userId },
      data: { cancelamentoAgendado: true, mpPreapprovalId: preapprovalId }
    });
  }
}

async function processarPagamentoAutorizado(authorizedPaymentId: string) {
  const response = await axios.get(`${MP_API}/authorized_payments/${authorizedPaymentId}`, { headers: headers() });
  const authorized = response.data;
  const paymentId = authorized.payment?.id || authorized.payment_id;
  if (paymentId) {
    await processarPagamento(String(paymentId));
    return;
  }

  const preapprovalId = authorized.preapproval_id;
  if (!preapprovalId || authorized.status !== 'approved' && authorized.status !== 'processed') return;

  const preapproval = await axios.get(`${MP_API}/preapproval/${preapprovalId}`, { headers: headers() });
  const ref = lerReferencia(preapproval.data?.external_reference);
  if (!ref?.plano) return;

  await ativarPlano({
    userId: ref.userId,
    plano: ref.plano,
    transactionId: `authorized:${authorizedPaymentId}`,
    amount: Number(authorized.transaction_amount || PLANOS[ref.plano].preco),
    paymentMethod: 'credit_card',
    meio: 'cartao',
    preapprovalId,
    raw: { id: authorizedPaymentId, status: authorized.status }
  });
}

export async function processarNotificacao(tipo: string, dataId: string) {
  if (tipo === 'payment' || tipo.startsWith('payment.')) {
    await processarPagamento(dataId);
    return;
  }
  if (tipo === 'subscription_preapproval' || tipo.includes('preapproval') && !tipo.includes('authorized')) {
    await processarPreapproval(dataId);
    return;
  }
  if (tipo === 'subscription_authorized_payment' || tipo.includes('authorized_payment')) {
    await processarPagamentoAutorizado(dataId);
  }
}

export function validarAssinaturaWebhook(params: {
  xSignature: string | undefined;
  xRequestId: string | undefined;
  dataId: string | undefined;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
  if (!secret || !params.xSignature || !params.dataId) return false;

  let ts = '';
  let hash = '';
  for (const part of params.xSignature.split(',')) {
    const [key, value] = part.split('=').map((item) => item?.trim());
    if (key === 'ts') ts = value || '';
    if (key === 'v1') hash = value || '';
  }
  if (!ts || !hash) return false;

  const id = /[a-z]/i.test(params.dataId) ? params.dataId.toLowerCase() : params.dataId;
  const manifest = `id:${id};request-id:${params.xRequestId || ''};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  const expectedBuffer = Buffer.from(expected);
  const hashBuffer = Buffer.from(hash);
  if (expectedBuffer.length !== hashBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, hashBuffer);
}

export async function obterStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      plano: true,
      planoAtivo: true,
      dataPagamento: true,
      dataExpiracao: true,
      meioPagamento: true,
      cancelamentoAgendado: true
    }
  });
  if (!user) return { success: false, message: 'Usuário não encontrado' };

  return {
    success: true,
    user: {
      ...user,
      isPremium: user.planoAtivo
    }
  };
}

export async function renovarPixProximosDoVencimento() {
  const limite = new Date();
  limite.setDate(limite.getDate() + 3);

  const usuarios = await prisma.user.findMany({
    where: {
      planoAtivo: true,
      meioPagamento: 'pix',
      cancelamentoAgendado: false,
      dataExpiracao: { lte: limite, gt: new Date() },
      cpf: { not: null },
      plano: { in: ['MENSAL', 'TRIMESTRAL', 'SEMESTRAL'] }
    }
  });

  for (const user of usuarios) {
    if (!user.plano || !isPlanoId(user.plano) || !user.cpf) continue;

    const pendente = await prisma.paymentHistory.findFirst({
      where: {
        userId: user.id,
        gateway: 'mercadopago',
        paymentMethod: 'pix',
        status: 'pending',
        createdAt: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
      }
    });
    if (pendente) continue;

    try {
      const cobranca = await criarPagamentoPix({
        userId: user.id,
        plano: user.plano,
        cpf: user.cpf,
        idempotencyKey: `pix-renovacao-${user.id}-${user.dataExpiracao?.toISOString().slice(0, 10)}`,
        renovacao: true
      });

      if (cobranca.status === 'pending' && cobranca.qrCode && user.dataExpiracao) {
        const { sendPixRenewalEmail } = await import('./email.service');
        await sendPixRenewalEmail({
          nome: user.nome || 'Usuário',
          email: user.email,
          plano: user.plano,
          dataExpiracao: user.dataExpiracao,
          qrCode: cobranca.qrCode
        });
      }
    } catch (error: any) {
      if (error?.statusCode === 409) continue;
      console.error('[MP] Falha ao renovar Pix:', error?.message);
    }
  }
}

export async function expirarPlanosVencidos() {
  const agora = new Date();
  const toleranciaCartao = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
  await prisma.user.updateMany({
    where: {
      planoAtivo: true,
      OR: [
        { meioPagamento: 'pix', dataExpiracao: { lt: agora } },
        { cancelamentoAgendado: true, dataExpiracao: { lt: agora } },
        { meioPagamento: 'cartao', cancelamentoAgendado: false, dataExpiracao: { lt: toleranciaCartao } }
      ]
    },
    data: {
      planoAtivo: false
    }
  });
}
