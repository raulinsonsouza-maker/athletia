import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import { PLANOS_CHECKOUT } from '../constants/planos-precos'
import { dispararConversaoAssinatura } from '../utils/ads-conversion'

declare global {
  interface Window {
    MercadoPago?: any
  }
}

const registrarEventoAnalytics = (eventType: string, properties?: any) => {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('analytics:event', {
        detail: { eventType, properties }
      }))
    }
  } catch (error) {
    console.error('Erro ao registrar evento de analytics:', error)
  }
}

type PlanoCheckout = (typeof PLANOS_CHECKOUT)[number]
type MeioPagamento = 'cartao' | 'pix'

type PixPendente = {
  paymentId: string
  qrCode: string
  qrCodeBase64: string
}

type ExercicioPrevia = {
  nome: string
  series: number
  repeticoes: string
  cardio: boolean
}

type PreviaCheckout = {
  planoAtivo: boolean
  nome?: string
  frase?: string
  treino?: {
    nome: string
    tempoEstimado: number
    exercicios: ExercicioPrevia[]
  } | null
}

const PLANOS: PlanoCheckout[] = PLANOS_CHECKOUT.filter((plano) => plano.id !== 'TRIMESTRAL')

const inputClass = 'h-12 w-full rounded-xl bg-dark border border-grey/40 px-3 text-base text-light placeholder:text-light-muted focus:outline-none focus:border-primary'

function mascararCpf(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  if (digitos.length <= 3) return digitos
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`
  if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`
}

function precoTexto(valor: number) {
  return valor.toFixed(2).replace('.', ',')
}

export default function Checkout() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user, refreshUser, loading: authLoading } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('MENSAL')
  const [meio, setMeio] = useState<MeioPagamento>('pix')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [publicKey, setPublicKey] = useState(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '')
  const [sdkPronto, setSdkPronto] = useState(Boolean(window.MercadoPago))
  const [cpf, setCpf] = useState('')
  const [pix, setPix] = useState<PixPendente | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [previa, setPrevia] = useState<PreviaCheckout | null>(null)
  const cardFormRef = useRef<any>(null)
  const planoRef = useRef(planoSelecionado)
  const userIdRef = useRef(user?.id)
  const assinanteRef = useRef(Boolean(user?.planoAtivo))
  planoRef.current = planoSelecionado
  userIdRef.current = user?.id
  assinanteRef.current = Boolean(user?.planoAtivo)

  const plano = PLANOS.find((item) => item.id === planoSelecionado) || PLANOS[0]
  const preco = precoTexto(plano.preco)

  useEffect(() => {
    if (authLoading) return
    if (!user) navigate('/login', { replace: true })
  }, [authLoading, user, navigate])

  useEffect(() => {
    window.scrollTo(0, 0)
    registrarEventoAnalytics('paywall_viewed', {
      screen: 'checkout',
      reason: 'trial_expired'
    })
    const planoUrl = params.get('plano')?.toUpperCase()
    if (planoUrl === 'MENSAL' || planoUrl === 'SEMESTRAL') {
      setPlanoSelecionado(planoUrl)
    }
  }, [params])

  useEffect(() => {
    if (!user?.id) return
    let ativo = true
    api.get('/payment/previa')
      .then((response) => {
        if (!ativo) return
        if (response.data?.planoAtivo) {
          navigate('/meu-plano', { replace: true })
          return
        }
        setPrevia(response.data)
      })
      .catch(() => {
        if (ativo) setPrevia(null)
      })
    return () => {
      ativo = false
    }
  }, [user?.id, navigate])

  useEffect(() => {
    if (publicKey) return
    api.get('/payment/config')
      .then((response) => setPublicKey(response.data?.publicKey || ''))
      .catch(() => setError('Pagamento indisponível no momento.'))
  }, [publicKey])

  useEffect(() => {
    if (window.MercadoPago) {
      setSdkPronto(true)
      return
    }
    const existente = document.getElementById('mercadopago-sdk') as HTMLScriptElement | null
    if (existente) {
      existente.addEventListener('load', () => setSdkPronto(true))
      return
    }
    const script = document.createElement('script')
    script.id = 'mercadopago-sdk'
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.async = true
    script.onload = () => setSdkPronto(true)
    script.onerror = () => setError('Não foi possível carregar o pagamento seguro.')
    document.body.appendChild(script)
  }, [])

  const concluirAssinatura = async (transactionId?: string) => {
    const planoAtual = PLANOS.find((item) => item.id === planoRef.current)
    const novoCliente = !assinanteRef.current
    await refreshUser()
    dispararConversaoAssinatura({
      transactionId,
      plano: planoRef.current,
      value: planoAtual?.preco,
      newCustomer: novoCliente
    })
    registrarEventoAnalytics('subscription_started', {
      plan: planoRef.current,
      source: 'checkout'
    })
    navigate('/treinos')
  }

  const confirmarCartao = async (cardTokenId: string) => {
    if (!userIdRef.current) {
      showToast('Faça login novamente.', 'error')
      navigate('/login')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/payment/subscribe', {
        plano: planoRef.current,
        cardTokenId,
        idempotencyKey: crypto.randomUUID()
      })
      if (response.data?.status === 'authorized' && response.data?.planoAtivo) {
        await concluirAssinatura(response.data?.transactionId)
        return
      }
      setError(response.data?.message || 'O pagamento do cartão ainda não foi aprovado.')
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Não foi possível concluir a assinatura.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (meio !== 'cartao' || !publicKey || !sdkPronto || !window.MercadoPago) return
    let ativo = true
    const timer = window.setTimeout(() => {
      if (!ativo) return
      try {
        cardFormRef.current?.unmount?.()
      } catch {
        // O formulário anterior já saiu da tela.
      }
      const planoAtual = PLANOS.find((item) => item.id === planoRef.current)
      const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' })
      cardFormRef.current = mp.cardForm({
        amount: (planoAtual?.preco ?? 29.9).toFixed(2),
        iframe: true,
        form: {
          id: 'form-checkout',
          cardNumber: { id: 'form-checkout__cardNumber', placeholder: 'Número do cartão' },
          expirationDate: { id: 'form-checkout__expirationDate', placeholder: 'MM/AA' },
          securityCode: { id: 'form-checkout__securityCode', placeholder: 'CVV' },
          cardholderName: { id: 'form-checkout__cardholderName', placeholder: 'Nome impresso no cartão' },
          issuer: { id: 'form-checkout__issuer', placeholder: 'Banco emissor' },
          installments: { id: 'form-checkout__installments', placeholder: 'Parcelas' },
          identificationType: { id: 'form-checkout__identificationType', placeholder: 'Documento' },
          identificationNumber: { id: 'form-checkout__identificationNumber', placeholder: '000.000.000-00' },
          cardholderEmail: { id: 'form-checkout__cardholderEmail', placeholder: 'E-mail' }
        },
        callbacks: {
          onFormMounted: (mountError: unknown) => {
            if (mountError) setError('Não foi possível carregar o formulário do cartão.')
            const parcelas = document.getElementById('form-checkout__installments') as HTMLSelectElement | null
            if (parcelas && parcelas.options.length > 0) parcelas.selectedIndex = 0
            const documento = document.getElementById('form-checkout__identificationType') as HTMLSelectElement | null
            if (documento) {
              const cpfOption = Array.from(documento.options).find((option) => option.value === 'CPF' || option.text === 'CPF')
              if (cpfOption) documento.value = cpfOption.value
            }
          },
          onSubmit: (event: Event) => {
            event.preventDefault()
            const dados = cardFormRef.current?.getCardFormData?.()
            if (!dados?.token) {
              setError('Não foi possível ler o cartão. Confira os dados.')
              return
            }
            void confirmarCartao(dados.token)
          }
        }
      })
    }, 50)

    return () => {
      ativo = false
      window.clearTimeout(timer)
      try {
        cardFormRef.current?.unmount?.()
      } catch {
        // O formulário anterior já saiu da tela.
      }
      cardFormRef.current = null
    }
  }, [publicKey, sdkPronto, meio, planoSelecionado])

  useEffect(() => {
    if (!pix?.paymentId) return
    const interval = window.setInterval(async () => {
      try {
        const response = await api.get(`/payment/pix/${pix.paymentId}`)
        const status = response.data?.status
        if (status === 'approved') {
          window.clearInterval(interval)
          await concluirAssinatura(pix.paymentId)
          return
        }
        if (status === 'rejected' || status === 'cancelled' || status === 'expired') {
          window.clearInterval(interval)
          setPix(null)
          setError(response.data?.message || 'O Pix expirou. Gere um novo código.')
        }
      } catch {
        // A próxima consulta tenta de novo.
      }
    }, 3000)
    return () => window.clearInterval(interval)
  }, [pix?.paymentId])

  const gerarPix = async () => {
    if (!user?.id) {
      showToast('Faça login novamente.', 'error')
      navigate('/login')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/payment/pix', {
        plano: planoSelecionado,
        cpf,
        idempotencyKey: crypto.randomUUID()
      })
      if (response.data?.status === 'approved') {
        await concluirAssinatura(response.data.paymentId)
        return
      }
      if (!response.data?.qrCode) {
        throw new Error('Código Pix não recebido')
      }
      setPix({
        paymentId: response.data.paymentId,
        qrCode: response.data.qrCode,
        qrCodeBase64: response.data.qrCodeBase64 || ''
      })
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Não foi possível gerar o Pix.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const copiarPix = async () => {
    if (!pix?.qrCode) return
    await navigator.clipboard.writeText(pix.qrCode)
    setCopiado(true)
    window.setTimeout(() => setCopiado(false), 2000)
  }

  const escolherPlano = (id: string) => {
    setPlanoSelecionado(id)
    setPix(null)
    setError('')
  }

  const acaoPrincipal = () => {
    if (meio === 'pix' && pix) {
      void copiarPix()
      return
    }
    if (meio === 'pix') void gerarPix()
  }

  const textoBotao = meio === 'cartao'
    ? (loading ? 'Processando...' : `Assinar por R$ ${preco}`)
    : pix
      ? (copiado ? 'Código copiado' : 'Copiar código Pix')
      : (loading ? 'Gerando Pix...' : `Pagar R$ ${preco} com Pix`)

  const exercicios = previa?.treino?.exercicios || []

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark text-light">
        Carregando...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <ToastContainer />

      <main className="mx-auto w-full max-w-lg px-4 pb-40 pt-6">
        <h1 className="text-2xl font-display font-bold text-light">
          {previa?.nome ? `${previa.nome}, seu plano está pronto` : 'Seu plano está pronto'}
        </h1>
        <p className="mt-2 text-base text-light-muted">
          {previa?.frase || 'Treino personalizado para a sua rotina'}
        </p>

        {exercicios.length > 0 && (
          <section className="mt-5 rounded-2xl border border-grey/30 bg-dark-lighter p-4">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-primary">Primeiro treino</h2>
              {previa?.treino?.tempoEstimado ? (
                <span className="text-sm text-light-muted">{previa.treino.tempoEstimado} min</span>
              ) : null}
            </div>
            <ol className="space-y-2">
              {exercicios.map((exercicio, index) => (
                <li key={`${exercicio.nome}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-light">{exercicio.nome}</span>
                  <span className="shrink-0 text-light-muted">
                    {exercicio.cardio ? exercicio.repeticoes : `${exercicio.series}x ${exercicio.repeticoes}`}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <button
          type="button"
          onClick={() => escolherPlano('MENSAL')}
          className={`mt-5 w-full rounded-2xl border-2 p-4 text-left ${
            planoSelecionado === 'MENSAL' ? 'border-primary bg-primary/15' : 'border-grey/30 bg-dark-lighter'
          }`}
        >
          <p className="text-sm font-bold text-light">Mensal</p>
          <p className="mt-1 text-4xl font-bold text-primary">R$ 29,90</p>
          <p className="text-sm text-light-muted">por mês, cancele quando quiser</p>
        </button>

        <button
          type="button"
          onClick={() => escolherPlano('SEMESTRAL')}
          className={`mt-3 w-full rounded-2xl border px-4 py-3 text-left text-sm ${
            planoSelecionado === 'SEMESTRAL' ? 'border-primary bg-primary/15 text-light' : 'border-grey/30 bg-dark-lighter text-light-muted'
          }`}
        >
          Ou 6 meses por R$ 89,90 (R$ 14,98/mês)
        </button>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => { setMeio('pix'); setError('') }}
            className={`h-12 rounded-2xl border-2 text-sm font-bold ${meio === 'pix' ? 'border-primary bg-primary/20 text-light' : 'border-grey/30 bg-dark-lighter text-light-muted'}`}
          >
            Pix
          </button>
          <button
            type="button"
            onClick={() => { setMeio('cartao'); setPix(null); setError('') }}
            className={`h-12 rounded-2xl border-2 text-sm font-bold ${meio === 'cartao' ? 'border-primary bg-primary/20 text-light' : 'border-grey/30 bg-dark-lighter text-light-muted'}`}
          >
            Cartão
          </button>
        </div>

        {meio === 'pix' && (
          <div className="mt-4 space-y-3">
            {!pix ? (
              <div>
                <label className="mb-2 block text-sm text-light" htmlFor="cpf">CPF do pagador</label>
                <input
                  id="cpf"
                  inputMode="numeric"
                  autoComplete="off"
                  value={cpf}
                  onChange={(event) => setCpf(mascararCpf(event.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={inputClass}
                />
              </div>
            ) : (
              <div className="space-y-3 text-center">
                {pix.qrCodeBase64 && (
                  <img
                    src={`data:image/png;base64,${pix.qrCodeBase64}`}
                    alt="QR Code do Pix"
                    className="mx-auto h-44 w-44 rounded-xl bg-white p-2"
                  />
                )}
                <p className="text-sm text-light">
                  O código vale 2 horas. Abra o app do banco e cole. Pode sair desta tela: se o Pix for pago, o plano entra sozinho.
                </p>
              </div>
            )}
          </div>
        )}

        {meio === 'cartao' && (
          <form id="form-checkout" key={planoSelecionado} className="mt-4 rounded-2xl border border-grey/30 bg-dark-lighter p-4">
            <style>{`
              #form-checkout .mp-field {
                height: 48px;
                min-height: 48px;
                max-height: 48px;
                overflow: hidden;
                display: flex;
                align-items: center;
                padding: 0 12px;
              }
              #form-checkout .mp-field iframe {
                height: 48px !important;
                min-height: 48px !important;
                max-height: 48px !important;
                width: 100% !important;
                border: 0 !important;
                display: block;
              }
            `}</style>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs text-light-muted">Número do cartão</label>
                <div id="form-checkout__cardNumber" className="mp-field rounded-xl border border-grey/40 bg-dark" />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs text-light-muted">Validade</label>
                <div id="form-checkout__expirationDate" className="mp-field rounded-xl border border-grey/40 bg-dark" />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs text-light-muted">CVV</label>
                <div id="form-checkout__securityCode" className="mp-field rounded-xl border border-grey/40 bg-dark" />
              </div>
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs text-light-muted" htmlFor="form-checkout__cardholderName">Nome no cartão</label>
                <input id="form-checkout__cardholderName" className={inputClass} placeholder="Nome impresso no cartão" />
              </div>
              <div className="sm:col-span-6">
                <label className="mb-1 block text-xs text-light-muted" htmlFor="form-checkout__identificationNumber">CPF</label>
                <input
                  id="form-checkout__identificationNumber"
                  className={inputClass}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  maxLength={14}
                  onInput={(event) => {
                    const campo = event.currentTarget
                    const mascarado = mascararCpf(campo.value)
                    if (campo.value !== mascarado) campo.value = mascarado
                  }}
                />
              </div>
            </div>
            <select id="form-checkout__identificationType" className="hidden" aria-hidden="true" />
            <select id="form-checkout__issuer" className="hidden" aria-hidden="true" />
            <select id="form-checkout__installments" className="hidden" aria-hidden="true" />
            <input id="form-checkout__cardholderEmail" type="email" className="hidden" defaultValue={user?.email || ''} />
          </form>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-grey/30 bg-dark/95 px-4 pt-3 backdrop-blur-md" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto w-full max-w-lg">
          {error && <p className="mb-2 text-center text-sm font-semibold text-error">{error}</p>}
          {meio === 'cartao' ? (
            <button
              type="submit"
              form="form-checkout"
              disabled={loading || !sdkPronto}
              className="h-12 w-full rounded-xl bg-primary text-base font-bold text-dark disabled:opacity-50"
            >
              {textoBotao}
            </button>
          ) : (
            <button
              type="button"
              onClick={acaoPrincipal}
              disabled={loading}
              className="h-12 w-full rounded-xl bg-primary text-base font-bold text-dark disabled:opacity-50"
            >
              {textoBotao}
            </button>
          )}
          <p className="mt-2 text-center text-xs text-light-muted">
            {meio === 'pix' && !pix
              ? 'O código vale 2 horas. Pode sair para o app do banco.'
              : 'Feito pelo Mercado Pago'}
          </p>
        </div>
      </div>
    </div>
  )
}
