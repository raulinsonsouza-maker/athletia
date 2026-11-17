import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/auth.service'
import CheckoutPagamento from '../components/CheckoutPagamento'
import LegalModal from '../components/legal/LegalModal'
import TermosContent from '../components/legal/TermosContent'
import PrivacidadeContent from '../components/legal/PrivacidadeContent'
import CookiesContent from '../components/legal/CookiesContent'
import { PRECO_ANUAL_FORMATADO } from '../constants/planos-precos'
import { capturarUtmDaUrl, dispararGtag, lerUtm } from '../utils/utm'

const inputClass =
  'h-12 w-full rounded-xl bg-dark border border-grey/40 px-3 text-base text-light placeholder:text-light-muted focus:outline-none focus:border-primary'

const FAQ = [
  {
    q: 'Preciso ter experiência com academia?',
    a: 'Não. O AthletIA atende diferentes níveis de experiência, inclusive iniciantes.'
  },
  {
    q: 'Posso treinar em casa?',
    a: 'Sim. Você pode estruturar seus treinamentos para casa ou academia.'
  },
  {
    q: 'O pagamento é mensal?',
    a: `Não. Você paga ${PRECO_ANUAL_FORMATADO} uma única vez e tem 12 meses de acesso.`
  },
  {
    q: 'Como funciona a garantia?',
    a: 'Você tem 7 dias para conhecer o AthletIA e solicitar o reembolso, conforme as condições da garantia.'
  }
] as const

const DOR_CARDS = [
  {
    title: 'Roupas que incomodam',
    text: 'Peças que já não vestem como antes e acabam ficando no fundo do armário.'
  },
  {
    title: 'Fotos que você evita',
    text: 'O reflexo e as fotos mostram uma versão de você com a qual você não se identifica.'
  },
  {
    title: 'Sempre “segunda-feira”',
    text: 'A promessa de começar volta toda semana — e o tempo continua passando.'
  }
] as const

const BENEFICIOS = [
  {
    title: 'Treinos personalizados',
    text: 'Montados para o seu perfil, nível e objetivo.'
  },
  {
    title: 'Casa ou academia',
    text: 'Estruture o treino no lugar onde você realmente vai treinar.'
  },
  {
    title: 'Evolução acompanhada',
    text: 'Ajustes conforme você avança — sem montar tudo sozinho.'
  }
] as const

const PASSOS = [
  {
    n: '1',
    title: 'Informe seu objetivo',
    text: 'Conte ao AthletIA o que deseja alcançar.'
  },
  {
    n: '2',
    title: 'Receba seu treinamento',
    text: 'Seu plano é criado de acordo com seu perfil.'
  },
  {
    n: '3',
    title: 'Comece a treinar',
    text: 'Siga seu plano e acompanhe sua evolução.'
  }
] as const

function mascararTelefone(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : ''
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function IconMirror() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 7h6M9 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconClothes() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M8 5l4 2 4-2 3 3-2 2v9H7v-9L5 8l3-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const DOR_ICONS = [IconClothes, IconMirror, IconClock]

/** Landing curta de conversão — /comece */
export default function Comece() {
  const navigate = useNavigate()
  const { user, loading: authLoading, setUserFromResponse } = useAuth()
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loadingConta, setLoadingConta] = useState(false)
  const [erroConta, setErroConta] = useState('')
  const [contaPronta, setContaPronta] = useState(false)
  const [faqAberto, setFaqAberto] = useState<number | null>(0)
  const [modalTermos, setModalTermos] = useState(false)
  const [modalPrivacidade, setModalPrivacidade] = useState(false)
  const [modalCookies, setModalCookies] = useState(false)
  const checkoutIniciado = useRef(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const utm = capturarUtmDaUrl()

    const prevTitle = document.title
    document.title = 'Comece sua mudança | AthletIA — 12 meses por R$ 67,90'
    setMeta('description', 'Você não está feliz com seu corpo. O AthletIA cria um treinamento personalizado para você começar. 12 meses por R$ 67,90, pagamento único.')
    setMeta('robots', 'noindex, nofollow')
    setMeta('og:title', 'Comece sua mudança | AthletIA', true)
    setMeta('og:description', '12 meses de acesso ao AthletIA por R$ 67,90. Pagamento único, sem renovação automática.', true)
    setMeta('og:url', 'https://athletia.site/comece', true)
    setMeta('og:type', 'website', true)

    dispararGtag('page_view', {
      page_title: 'AthletIA - Comece',
      page_path: '/comece',
      page_location: window.location.href,
      ...utm
    })
    dispararGtag('view_item', {
      currency: 'BRL',
      value: 67.9,
      items: [{ item_id: 'ANUAL', item_name: 'AthletIA — Plano Anual', price: 67.9, quantity: 1 }]
    })

    try {
      window.dispatchEvent(new CustomEvent('analytics:event', {
        detail: { eventType: 'comece_viewed', properties: { plano: 'ANUAL', path: '/comece', ...utm } }
      }))
    } catch {
      // analytics opcional
    }

    return () => {
      document.title = prevTitle
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setContaPronta(false)
      return
    }
    if (user.planoAtivo && user.precisaOnboarding) {
      navigate('/montar-treino', { replace: true })
      return
    }
    if (user.planoAtivo && !user.precisaOnboarding) {
      navigate('/meu-plano', { replace: true })
      return
    }
    setContaPronta(true)
  }, [authLoading, user, navigate])

  const marcarCheckout = () => {
    if (checkoutIniciado.current) return
    checkoutIniciado.current = true
    dispararGtag('begin_checkout', {
      currency: 'BRL',
      value: 67.9,
      items: [{ item_id: 'ANUAL', item_name: 'AthletIA — Plano Anual', price: 67.9, quantity: 1 }],
      ...lerUtm()
    })
  }

  const scrollComprar = () => {
    marcarCheckout()
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'conversion', {
          send_to: 'AW-448210685/2_AoCMyDkM8bEP3N3NUB',
          value: 1.0,
          currency: 'BRL'
        })
      }
    } catch {
      // gtag opcional
    }
    document.getElementById('comprar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const criarConta = async (event: React.FormEvent) => {
    event.preventDefault()
    setErroConta('')
    setLoadingConta(true)
    marcarCheckout()
    try {
      const telefoneDigitos = telefone.replace(/\D/g, '')
      if (telefoneDigitos.length < 10) {
        setErroConta('Informe um telefone válido com DDD.')
        setLoadingConta(false)
        return
      }
      if (senha.length < 8) {
        setErroConta('A senha precisa ter no mínimo 8 caracteres.')
        setLoadingConta(false)
        return
      }
      const response = await api.post('/auth/cadastro-oferta', {
        nome: nome.trim(),
        telefone: telefoneDigitos,
        email: email.trim().toLowerCase(),
        senha,
        source: 'comece',
        utm: lerUtm()
      })
      setUserFromResponse(response.data.user, response.data.accessToken, response.data.refreshToken, true)
      setContaPronta(true)
      try {
        window.dispatchEvent(new CustomEvent('analytics:event', {
          detail: { eventType: 'comece_signup', properties: { plano: 'ANUAL', ...lerUtm() } }
        }))
        dispararGtag('sign_up', { method: 'comece', plan: 'ANUAL', ...lerUtm() })
      } catch {
        // analytics opcional
      }
    } catch (err: any) {
      setErroConta(err.response?.data?.error || err.response?.data?.message || 'Não foi possível criar a conta.')
    } finally {
      setLoadingConta(false)
    }
  }

  const Cta = ({ label }: { label: string }) => (
    <button
      type="button"
      onClick={scrollComprar}
      className="btn-primary w-full sm:w-auto text-base md:text-lg px-8 py-4 font-bold shadow-xl shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-transform"
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-light overflow-x-hidden">
      <header className="relative z-20 w-full py-4 px-4 md:px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="w-8 h-8 rounded-2xl" width="32" height="32" />
          <span className="text-lg font-display font-bold tracking-tight">AthletIA</span>
        </div>
      </header>

      <main id="main-content">
        {/* 1 — HERO */}
        <section className="relative px-4 md:px-6 pt-6 pb-16 md:pb-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.16),_transparent_55%)]" />
          <div className="relative max-w-5xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Plano anual · pagamento único
              </p>
              <h1 className="font-display text-[2rem] sm:text-4xl md:text-5xl font-extrabold leading-[1.12] tracking-tight">
                Você não está feliz com seu corpo. E sabe disso.
              </h1>
              <div className="space-y-3 text-base md:text-lg text-light-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
                <p>
                  Talvez você evite algumas fotos, não goste mais de certas roupas ou simplesmente não se reconheça
                  quando olha no espelho.
                </p>
                <p>
                  Quantas vezes você já prometeu que iria mudar, começou e acabou deixando para depois?
                </p>
                <p className="text-light font-medium">Você não precisa continuar nesse ciclo.</p>
                <p>
                  Com o AthletIA, você recebe um treinamento personalizado para começar a trabalhar na mudança que
                  deseja.
                </p>
              </div>
              <div className="space-y-3 pt-1">
                <Cta label="QUERO COMEÇAR AGORA" />
                <p className="text-sm text-light-muted">
                  12 meses de acesso por {PRECO_ANUAL_FORMATADO} · Pagamento único.
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[280px] lg:max-w-[320px]">
              <div className="absolute -inset-8 rounded-full bg-primary/20 blur-3xl" />
              <div className="relative rounded-[2.2rem] border border-white/15 bg-black/40 p-2 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
                <img
                  src="/images/app-preview/Editadas/Hero_nova-400x800.webp"
                  srcSet="/images/app-preview/Editadas/Hero_nova-400x800.webp 400w, /images/app-preview/Editadas/Hero_nova-800x1600.webp 800w"
                  sizes="(max-width: 1024px) 260px, 300px"
                  alt="Tela de treinos do aplicativo AthletIA"
                  className="w-full rounded-[1.8rem]"
                  width="400"
                  height="800"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2 — IDENTIFICAÇÃO */}
        <section className="relative px-4 md:px-6 py-14 md:py-16 border-t border-white/5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(245,158,11,0.08),_transparent_50%)]" />
          <div className="relative max-w-5xl mx-auto">
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl md:text-4xl font-bold leading-tight">
                O pior não é perceber que você precisa mudar. É perceber que o tempo está passando.
              </h2>
              <div className="mt-5 space-y-3 text-light-muted leading-relaxed">
                <p>
                  Enquanto você adia, as roupas continuam incomodando. As fotos continuam sendo evitadas. E aquela
                  promessa de começar continua ficando para a próxima segunda-feira.
                </p>
                <p>Talvez você já tenha tentado várias vezes.</p>
                <p className="text-light font-medium">
                  O que falta não é mais uma promessa. É ter um plano e começar a seguir.
                </p>
              </div>
            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-3 md:gap-4">
              {DOR_CARDS.map((item, index) => {
                const Icon = DOR_ICONS[index]
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon />
                    </div>
                    <p className="mt-4 font-bold text-light">{item.title}</p>
                    <p className="mt-2 text-sm text-light-muted leading-relaxed">{item.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* 3 — SOLUÇÃO */}
        <section className="px-4 md:px-6 py-14 md:py-16 border-t border-white/5 bg-[#101012]">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <h2 className="font-display text-2xl md:text-4xl font-bold leading-tight">
                Seu treino. Seu objetivo. Um caminho para começar.
              </h2>
              <p className="mt-4 text-light-muted leading-relaxed">
                O AthletIA cria um treinamento personalizado de acordo com seu perfil, seu nível e seus objetivos.
              </p>

              <ul className="mt-8 space-y-4">
                {BENEFICIOS.map((b) => (
                  <li key={b.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-dark">
                      ✓
                    </span>
                    <div>
                      <p className="font-bold text-light">{b.title}</p>
                      <p className="text-sm text-light-muted">{b.text}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Cta label="QUERO MEU TREINO PERSONALIZADO" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-3 md:space-y-4 pt-6">
                <img
                  src="/images/app-preview/feature-treinos.webp"
                  alt="Lista de treinos no AthletIA"
                  className="w-full rounded-2xl border border-white/10 shadow-lg shadow-black/40"
                  loading="lazy"
                />
                <img
                  src="/images/app-preview/feature-exercicios.webp"
                  alt="Exercícios do treino no AthletIA"
                  className="w-full rounded-2xl border border-white/10 shadow-lg shadow-black/40"
                  loading="lazy"
                />
              </div>
              <div className="space-y-3 md:space-y-4">
                <img
                  src="/images/app-preview/feature-progresso.webp"
                  alt="Progresso no AthletIA"
                  className="w-full rounded-2xl border border-white/10 shadow-lg shadow-black/40"
                  loading="lazy"
                />
                <img
                  src="/images/app-preview/feature-historico.webp"
                  alt="Histórico de treinos no AthletIA"
                  className="w-full rounded-2xl border border-white/10 shadow-lg shadow-black/40"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4 — COMO FUNCIONA */}
        <section className="px-4 md:px-6 py-14 md:py-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl md:text-4xl font-bold leading-tight text-center">
              Você só precisa dar o primeiro passo.
            </h2>

            <ol className="mt-10 grid md:grid-cols-3 gap-6 relative">
              <div className="pointer-events-none absolute top-8 left-[16%] right-[16%] hidden md:block h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              {PASSOS.map((p) => (
                <li key={p.n} className="relative text-center md:text-left">
                  <div className="mx-auto md:mx-0 flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-lg font-bold text-primary">
                    {p.n}
                  </div>
                  <p className="mt-4 font-bold text-light text-lg">{p.title}</p>
                  <p className="mt-2 text-sm text-light-muted leading-relaxed">{p.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 5 — OFERTA */}
        <section className="relative px-4 md:px-6 py-14 md:py-16 border-t border-white/5 bg-[#101012]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12),_transparent_60%)]" />
          <div className="relative max-w-xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-4xl font-bold leading-tight">
              Pare de adiar. Comece a cuidar de você.
            </h2>
            <p className="mt-4 text-light-muted leading-relaxed">
              Tenha 12 meses para começar a construir uma rotina de treinamento e trabalhar na mudança que deseja.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-primary/40 bg-gradient-to-b from-primary/15 to-transparent p-6 md:p-8 text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                AthletIA — Plano Anual
              </p>
              <div className="mt-3 flex items-end gap-2">
                <span className="font-display text-5xl font-extrabold tracking-tight">{PRECO_ANUAL_FORMATADO}</span>
              </div>
              <p className="mt-2 text-sm text-light-muted">
                Pagamento único. Sem mensalidade e sem renovação automática.
              </p>

              <ul className="mt-6 space-y-2.5">
                {[
                  '12 meses de acesso.',
                  'Treinamento personalizado.',
                  'Treinos em casa ou na academia.',
                  'Garantia de 7 dias.'
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-light">
                    <span className="text-primary font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={scrollComprar}
                className="mt-7 h-14 w-full rounded-2xl bg-primary text-base font-bold text-dark shadow-lg shadow-primary/35"
              >
                QUERO COMEÇAR AGORA
              </button>
              <p className="mt-3 text-center text-xs text-light-muted">
                Pagamento seguro · Acesso após confirmação do pagamento.
              </p>
            </div>
          </div>
        </section>

        {/* 6 — FAQ */}
        <section className="px-4 md:px-6 py-14 md:py-16 border-t border-white/5">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
              Perguntas frequentes
            </h2>
            <div className="space-y-2">
              {FAQ.map((item, index) => {
                const aberto = faqAberto === index
                return (
                  <div key={item.q} className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setFaqAberto(aberto ? null : index)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
                      aria-expanded={aberto}
                    >
                      <span className="font-semibold text-sm md:text-base">{item.q}</span>
                      <span className={`text-primary text-xl leading-none transition-transform ${aberto ? 'rotate-45' : ''}`}>
                        +
                      </span>
                    </button>
                    {aberto ? (
                      <p className="px-4 pb-4 text-sm text-light-muted leading-relaxed">{item.a}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CHECKOUT */}
        <section id="comprar" className="scroll-mt-20 px-4 md:px-6 py-14 md:py-16 border-t border-primary/20 bg-[#0c0c0e]">
          <div className="max-w-lg mx-auto">
            <div className="rounded-[1.75rem] border border-white/10 bg-[#141416] p-5 md:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Seu pedido</p>
              <h3 className="mt-2 text-center font-display text-xl font-bold">AthletIA — Plano Anual</h3>
              <p className="mt-1 text-center text-sm text-light-muted">12 meses de acesso.</p>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <span className="text-sm text-light-muted">Total</span>
                <span className="font-display text-2xl font-extrabold">{PRECO_ANUAL_FORMATADO}</span>
              </div>
              <p className="mt-2 text-center text-xs text-light-muted">
                Pagamento único · Sem renovação automática
              </p>

              <div className="mt-8 border-t border-white/10 pt-6">
                <h4 className="text-lg font-bold">
                  {contaPronta ? 'Finalize o pagamento' : 'Crie seu acesso'}
                </h4>
                <p className="mt-1 text-sm text-light-muted">
                  {contaPronta
                    ? `Conta pronta${user?.email ? ` · ${user.email}` : ''}.`
                    : 'Preencha seus dados para liberar seu treinamento após a confirmação do pagamento.'}
                </p>

                {!contaPronta ? (
                  <form onSubmit={criarConta} onFocusCapture={marcarCheckout} className="mt-5 space-y-3">
                    <input id="comece-nome" required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="Nome completo" autoComplete="name" aria-label="Nome completo" />
                    <input id="comece-tel" required value={telefone} onChange={(e) => setTelefone(mascararTelefone(e.target.value))} className={inputClass} placeholder="Telefone com DDD" inputMode="tel" autoComplete="tel" aria-label="Telefone com DDD" />
                    <input id="comece-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="E-mail" autoComplete="email" aria-label="E-mail" />
                    <input id="comece-senha" type="password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} className={inputClass} placeholder="Senha (mínimo de 8 caracteres)" autoComplete="new-password" aria-label="Senha" />
                    {erroConta && <p className="text-sm font-semibold text-error">{erroConta}</p>}
                    <button
                      type="submit"
                      disabled={loadingConta}
                      className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-dark shadow-lg shadow-primary/30 disabled:opacity-50"
                    >
                      {loadingConta ? 'Criando...' : 'CONTINUAR PARA O PAGAMENTO'}
                    </button>
                    <p className="text-center text-xs text-light-muted">Pagamento seguro.</p>
                  </form>
                ) : (
                  <div className="mt-5">
                    <CheckoutPagamento
                      planoInicial="ANUAL"
                      planoControlado="ANUAL"
                      source="comece"
                      onSuccessNavigateTo="/montar-treino"
                      mostrarSeletorPlano={false}
                      sticky={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3 text-xs text-light-muted">
          <span className="text-primary font-display font-bold text-base">AthletIA</span>
          <div className="flex flex-wrap justify-center gap-4">
            <button type="button" onClick={() => setModalTermos(true)} className="hover:text-primary">Termos de Uso</button>
            <button type="button" onClick={() => setModalPrivacidade(true)} className="hover:text-primary">Política de Privacidade</button>
            <button type="button" onClick={() => setModalCookies(true)} className="hover:text-primary">Cookies</button>
          </div>
          <p>© 2026 AthletIA</p>
        </div>
      </footer>

      <LegalModal isOpen={modalTermos} onClose={() => setModalTermos(false)} title="Termos de Uso">
        <TermosContent />
      </LegalModal>
      <LegalModal isOpen={modalPrivacidade} onClose={() => setModalPrivacidade(false)} title="Política de Privacidade">
        <PrivacidadeContent />
      </LegalModal>
      <LegalModal isOpen={modalCookies} onClose={() => setModalCookies(false)} title="Política de Cookies">
        <CookiesContent />
      </LegalModal>
    </div>
  )
}
