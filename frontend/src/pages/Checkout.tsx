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

const PLANOS: PlanoCheckout[] = PLANOS_CHECKOUT.filter((plano) => plano.id !== 'TRIMESTRAL')

const inputClass = 'h-11 w-full rounded-xl bg-dark border border-grey/40 px-3 text-sm text-light placeholder:text-light-muted focus:outline-none focus:border-primary'

function mascararCpf(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  if (digitos.length <= 3) return digitos
  if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`
  if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`
}

export default function Checkout() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user, refreshUser } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('SEMESTRAL')
  const [meio, setMeio] = useState<MeioPagamento>('cartao')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [publicKey, setPublicKey] = useState(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '')
  const [sdkPronto, setSdkPronto] = useState(Boolean(window.MercadoPago))
  const [cpf, setCpf] = useState('')
  const [pix, setPix] = useState<PixPendente | null>(null)
  const [copiado, setCopiado] = useState(false)
  const cardFormRef = useRef<any>(null)
  const planoRef = useRef(planoSelecionado)
  const userIdRef = useRef(user?.id)
  const assinanteRef = useRef(Boolean(user?.planoAtivo))
  planoRef.current = planoSelecionado
  userIdRef.current = user?.id
  assinanteRef.current = Boolean(user?.planoAtivo)

  useEffect(() => {
    window.scrollTo(0, 0)
    registrarEventoAnalytics('paywall_viewed', {
      screen: 'checkout',
      reason: 'trial_expired'
    })
    const plano = params.get('plano')?.toUpperCase()
    if (plano === 'MENSAL' || plano === 'SEMESTRAL') {
      setPlanoSelecionado(plano)
    }
  }, [params])

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
    const plano = PLANOS.find((item) => item.id === planoRef.current)
    const novoCliente = !assinanteRef.current
    await refreshUser()
    dispararConversaoAssinatura({
      transactionId,
      plano: planoRef.current,
      value: plano?.preco,
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
    if (!publicKey || !sdkPronto || !window.MercadoPago || cardFormRef.current) return
    let ativo = true
    const timer = window.setTimeout(() => {
      if (!ativo || cardFormRef.current) return
      const plano = PLANOS.find((item) => item.id === planoRef.current)
      const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' })
      cardFormRef.current = mp.cardForm({
        amount: (plano?.preco ?? 29.9).toFixed(2),
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
              const cpf = Array.from(documento.options).find((option) => option.value === 'CPF' || option.text === 'CPF')
              if (cpf) documento.value = cpf.value
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
    }
  }, [publicKey, sdkPronto])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <ToastContainer />

      <main className="container-custom section pb-20 pt-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-light mb-4">
            Desbloquear Meu Plano
          </h1>
          <p className="text-lg md:text-xl text-light-muted max-w-2xl mx-auto">
            Mantenha seu progresso e continue sua evolução
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
          {PLANOS.map((plano) => {
            const selected = planoSelecionado === plano.id
            const destaque = plano.id === 'SEMESTRAL'
            return (
              <div key={plano.id} className={`relative ${destaque ? 'sm:scale-[1.04] z-10' : ''}`}>
                <button
                  type="button"
                  onClick={() => {
                    setPlanoSelecionado(plano.id)
                    setPix(null)
                  }}
                  className={`relative w-full p-6 rounded-2xl text-left transition-all duration-300 flex flex-col h-full ${
                    selected
                      ? 'border-2 border-primary bg-gradient-to-br from-primary/30 via-primary/15 to-primary/30 shadow-2xl shadow-primary/40'
                      : destaque
                      ? 'border-2 border-primary/60 bg-dark-lighter hover:border-primary hover:shadow-xl shadow-primary/20'
                      : 'border-2 border-grey/30 bg-dark-lighter hover:border-primary/50 hover:shadow-lg'
                  }`}
                >
                  {destaque && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-primary to-primary/80 text-dark text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        MELHOR ESCOLHA
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-light mb-1">{plano.nome}</h3>
                  </div>
                  <div className="mb-4 pb-4 border-b border-grey/30">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-lg font-semibold text-light-muted">R$</span>
                      <span className={`text-4xl md:text-5xl font-bold ${selected ? 'text-primary' : 'text-primary/90'}`}>
                        {plano.precoMensal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <p className="text-sm text-light-muted mb-3">/ mês</p>
                    {plano.id !== 'MENSAL' && (
                      <div className="bg-dark/50 rounded-lg p-2 mb-2">
                        <p className="text-xs text-light-muted mb-1">Cobrança do período:</p>
                        <p className="text-xl font-bold text-light">
                          R$ {plano.preco.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    )}
                    {plano.economia && (
                      <div className="bg-success/20 border border-success/50 rounded-lg p-2">
                        <p className="text-xs text-success font-bold">{plano.economia}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    {['Treino personalizado com IA', 'Ajustes automáticos', 'Histórico completo', 'Acompanhamento de progresso'].map((beneficio) => (
                      <div key={beneficio} className="flex items-center gap-2">
                        <span className="text-xs text-light-muted">{beneficio}</span>
                      </div>
                    ))}
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          {error && (
            <div className="bg-error/20 border border-error/50 text-error px-6 py-4 rounded-xl mb-6 text-center">
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => { setMeio('cartao'); setPix(null) }}
              className={`rounded-2xl border-2 px-4 py-4 font-bold ${meio === 'cartao' ? 'border-primary bg-primary/20 text-light' : 'border-grey/30 bg-dark-lighter text-light-muted'}`}
            >
              Cartão de crédito
            </button>
            <button
              type="button"
              onClick={() => setMeio('pix')}
              className={`rounded-2xl border-2 px-4 py-4 font-bold ${meio === 'pix' ? 'border-primary bg-primary/20 text-light' : 'border-grey/30 bg-dark-lighter text-light-muted'}`}
            >
              Pix
            </button>
          </div>

          <form id="form-checkout" className={`bg-dark-lighter border border-grey/30 rounded-2xl p-4 sm:p-5 ${meio === 'cartao' ? '' : 'hidden'}`}>
              <style>{`
                #form-checkout .mp-field {
                  height: 44px;
                  min-height: 44px;
                  max-height: 44px;
                  overflow: hidden;
                  display: flex;
                  align-items: center;
                  padding: 0 12px;
                }
                #form-checkout .mp-field iframe {
                  height: 44px !important;
                  min-height: 44px !important;
                  max-height: 44px !important;
                  width: 100% !important;
                  border: 0 !important;
                  display: block;
                }
              `}</style>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div className="sm:col-span-6">
                  <label className="block text-xs text-light-muted mb-1">Número do cartão</label>
                  <div id="form-checkout__cardNumber" className="mp-field rounded-xl bg-dark border border-grey/40" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs text-light-muted mb-1">Validade</label>
                  <div id="form-checkout__expirationDate" className="mp-field rounded-xl bg-dark border border-grey/40" />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs text-light-muted mb-1">CVV</label>
                  <div id="form-checkout__securityCode" className="mp-field rounded-xl bg-dark border border-grey/40" />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-xs text-light-muted mb-1" htmlFor="form-checkout__cardholderName">Nome no cartão</label>
                  <input id="form-checkout__cardholderName" className={inputClass} placeholder="Nome impresso no cartão" />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-xs text-light-muted mb-1" htmlFor="form-checkout__identificationNumber">CPF</label>
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
              <button
                type="submit"
                disabled={loading || !sdkPronto}
                className="mt-4 w-full bg-primary text-dark text-base px-6 py-3 font-bold rounded-xl disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Assinar com cartão'}
              </button>
          </form>
          {meio === 'pix' && (
            <div className="space-y-3 bg-dark-lighter border border-grey/30 rounded-2xl p-4 sm:p-5">
              {!pix ? (
                <>
                  <div>
                    <label className="block text-sm text-light mb-2" htmlFor="cpf">CPF</label>
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
                  <button
                    type="button"
                    onClick={() => void gerarPix()}
                    disabled={loading}
                    className="w-full bg-primary text-dark text-base px-6 py-3 font-bold rounded-xl disabled:opacity-50"
                  >
                    {loading ? 'Gerando Pix...' : 'Gerar Pix'}
                  </button>
                </>
              ) : (
                <div className="space-y-4 text-center">
                  {pix.qrCodeBase64 && (
                    <img
                      src={`data:image/png;base64,${pix.qrCodeBase64}`}
                      alt="QR Code do Pix"
                      className="mx-auto w-56 h-56 rounded-xl bg-white p-2"
                    />
                  )}
                  <p className="text-sm text-light-muted break-all">{pix.qrCode}</p>
                  <button type="button" onClick={() => void copiarPix()} className="w-full border border-primary text-primary font-bold rounded-2xl py-3">
                    {copiado ? 'Código copiado' : 'Copiar código Pix'}
                  </button>
                  <p className="text-sm text-light">Aguardando a confirmação do pagamento. Você entra no app assim que ele aprovar.</p>
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-light-muted text-center mt-4 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Feito pelo Mercado Pago
          </p>
        </div>
      </main>
    </div>
  )
}
