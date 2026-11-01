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
  const nomePessoa = previa?.nome && !/^(ol[aá]|admin|administrador)$/i.test(previa.nome) ? previa.nome : ''
  const frase = previa?.frase || 'Treino personalizado para a sua rotina'
  const beneficios = [
    'Treino montado para a sua rotina',
    'Cardio em toda sessão',
    'Cancele quando quiser'
  ]

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark text-light">
        Carregando...
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-dark text-light">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(249,166,32,0.22),_transparent_68%)]" />
      <ToastContainer />

      <main className="relative mx-auto w-full max-w-lg px-4 pb-40 pt-5">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-2xl shadow-lg shadow-black/40" />
          <span className="font-display text-lg font-bold tracking-tight">AthletIA</span>
        </div>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Seu plano</p>
        <h1 className="mt-1 font-display text-[1.7rem] font-bold leading-[1.15]">
          {nomePessoa ? `${nomePessoa}, seu treino está pronto` : 'Seu treino está pronto'}
        </h1>
        <p className="mt-2 text-[15px] leading-snug text-light-muted">{frase}</p>

        <section className="mt-5 overflow-hidden rounded-[28px] border border-primary/35 bg-gradient-to-b from-[#2a2114] to-dark-lighter shadow-[0_20px_50px_-24px_rgba(249,166,32,0.7)]">
          <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-4">
            <h2 className="text-sm font-bold text-light">Primeiro treino</h2>
            {previa?.treino?.tempoEstimado ? (
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
                {previa.treino.tempoEstimado} min
              </span>
            ) : (
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">Incluso</span>
            )}
          </div>

          {exercicios.length > 0 ? (
            <ol className="px-2 pb-2">
              {exercicios.map((exercicio, index) => (
                <li key={`${exercicio.nome}-${index}`} className="flex items-center gap-3 px-2 py-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black/30 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm leading-snug text-light">{exercicio.nome}</span>
                  <span className="shrink-0 text-xs font-medium text-light-muted">
                    {exercicio.cardio ? exercicio.repeticoes : `${exercicio.series}x ${exercicio.repeticoes}`}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <ul className="space-y-2 px-4 pb-4 pt-1">
              {beneficios.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-light">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-dark">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2 border-t border-white/10 bg-black/25 p-3">
            <button
              type="button"
              onClick={() => escolherPlano('MENSAL')}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-left ${
                planoSelecionado === 'MENSAL' ? 'bg-primary text-dark' : 'bg-white/5 text-light'
              }`}
            >
              <span>
                <span className="block text-sm font-bold">Mensal</span>
                <span className={`block text-xs ${planoSelecionado === 'MENSAL' ? 'text-dark/70' : 'text-light-muted'}`}>
                  Cancele quando quiser
                </span>
              </span>
              <span className="text-right">
                <span className="block font-display text-2xl font-bold leading-none">R$ 29,90</span>
                <span className={`text-xs ${planoSelecionado === 'MENSAL' ? 'text-dark/70' : 'text-light-muted'}`}>por mês</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => escolherPlano('SEMESTRAL')}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left ${
                planoSelecionado === 'SEMESTRAL' ? 'border-primary bg-primary/15' : 'border-white/10 bg-transparent'
              }`}
            >
              <span>
                <span className="block text-sm font-bold text-light">6 meses</span>
                <span className="block text-xs font-semibold text-primary">Economize R$ 89,50</span>
              </span>
              <span className="text-right">
                <span className="block text-base font-bold text-light">R$ 14,98<span className="text-xs font-medium text-light-muted">/mês</span></span>
                <span className="text-xs text-light-muted">R$ 89,90 hoje</span>
              </span>
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-[28px] border border-white/10 bg-dark-lighter p-4">
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-black/40 p-1">
            <button
              type="button"
              onClick={() => { setMeio('pix'); setError('') }}
              className={`h-11 rounded-xl text-sm font-bold ${meio === 'pix' ? 'bg-primary text-dark' : 'text-light-muted'}`}
            >
              Pix
            </button>
            <button
              type="button"
              onClick={() => { setMeio('cartao'); setPix(null); setError('') }}
              className={`h-11 rounded-xl text-sm font-bold ${meio === 'cartao' ? 'bg-primary text-dark' : 'text-light-muted'}`}
            >
              Cartão
            </button>
          </div>

          {meio === 'pix' && (
            <div className="mt-4">
              {!pix ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-light" htmlFor="cpf">CPF do pagador</label>
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
                  <p className="mt-2 text-xs text-light-muted">Usado só para gerar o Pix.</p>
                </div>
              ) : (
                <div className="text-center">
                  {pix.qrCodeBase64 && (
                    <img
                      src={`data:image/png;base64,${pix.qrCodeBase64}`}
                      alt="QR Code do Pix"
                      className="mx-auto h-44 w-44 rounded-2xl bg-white p-2"
                    />
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-light">
                    Abra o app do banco e cole o código. Pode sair desta tela: o plano entra sozinho quando o Pix for pago.
                  </p>
                </div>
              )}
            </div>
          )}

          {meio === 'cartao' && (
            <form id="form-checkout" key={planoSelecionado} className="mt-4">
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
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-dark/95 px-4 pt-3 shadow-[0_-16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md" style={{ paddingBottom: 'max(0.85rem, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto w-full max-w-lg">
          {error && <p className="mb-2 text-center text-sm font-semibold text-error">{error}</p>}
          {meio === 'cartao' ? (
            <button
              type="submit"
              form="form-checkout"
              disabled={loading || !sdkPronto}
              className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-dark shadow-lg shadow-primary/30 disabled:opacity-50"
            >
              {textoBotao}
            </button>
          ) : (
            <button
              type="button"
              onClick={acaoPrincipal}
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-dark shadow-lg shadow-primary/30 disabled:opacity-50"
            >
              {textoBotao}
            </button>
          )}
          <p className="mt-2 text-center text-[11px] text-light-muted">
            {meio === 'pix' && !pix
              ? 'O código vale 2 horas. Pode sair para o app do banco.'
              : 'Pagamento seguro pelo Mercado Pago'}
          </p>
        </div>
      </div>
    </div>
  )
}
