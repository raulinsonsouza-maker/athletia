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

const FEATURES = [
  {
    title: 'Seu plano de treinamento',
    text: 'Um treino estruturado de acordo com seu objetivo e nível.',
    image: '/images/app-preview/feature-treinos.webp',
    alt: 'Plano de treinos no AthletIA'
  },
  {
    title: 'Exercícios organizados',
    text: 'Saiba quais exercícios fazer, com séries e repetições.',
    image: '/images/app-preview/feature-exercicios.webp',
    alt: 'Lista de exercícios no AthletIA'
  },
  {
    title: 'Treine onde quiser',
    text: 'Treinamentos para sua rotina em casa ou na academia.',
    image: '/images/app-preview/feature-perfil.webp',
    alt: 'Perfil e preferências de treino no AthletIA'
  },
  {
    title: 'Acompanhe sua evolução',
    text: 'Registre seus treinos e acompanhe seu progresso, com ajustes no treinamento conforme sua evolução.',
    image: '/images/app-preview/feature-progresso.webp',
    alt: 'Progresso no AthletIA'
  }
] as const

const FAQ = [
  {
    q: 'É para iniciantes?',
    a: 'Sim. O AthletIA atende diferentes níveis de experiência.'
  },
  {
    q: 'Posso treinar em casa?',
    a: 'Sim. Você pode organizar seu treinamento para casa ou academia.'
  },
  {
    q: 'Preciso pagar mensalmente?',
    a: `Não. ${PRECO_ANUAL_FORMATADO} é o pagamento único pelos 12 meses de acesso.`
  },
  {
    q: 'E se eu não gostar?',
    a: 'Você tem 7 dias de garantia, conforme as condições da compra.'
  }
] as const

const OFERTA_ITENS = [
  'Treinamento personalizado com IA.',
  'Exercícios organizados.',
  'Treinos em casa ou na academia.',
  'Acompanhamento da evolução.',
  '12 meses de acesso.'
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
    document.title = 'Treino personalizado com IA | AthletIA — 12 meses por R$ 67,90'
    setMeta('description', 'Pare de tentar descobrir sozinho qual treino fazer. Receba um treinamento personalizado para seu objetivo, nível e rotina. 12 meses por R$ 67,90.')
    setMeta('robots', 'noindex, nofollow')
    setMeta('og:title', 'Treino personalizado com IA | AthletIA', true)
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
          <div>
            <p className="text-lg font-display font-bold tracking-tight leading-none">AthletIA</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/90">
              Treinamento personalizado com IA
            </p>
          </div>
        </div>
      </header>

      <main id="main-content">
        {/* HERO */}
        <section className="relative px-4 md:px-6 pt-4 pb-14 md:pb-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.16),_transparent_55%)]" />
          <div className="relative max-w-5xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="font-display text-[1.9rem] sm:text-4xl md:text-[2.75rem] font-extrabold leading-[1.12] tracking-tight">
                Pare de tentar descobrir sozinho qual treino fazer. Tenha um plano feito para você.
              </h1>
              <p className="text-base md:text-lg text-light-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
                Receba um treinamento personalizado para seu objetivo, seu nível e sua rotina. Saiba o que fazer em
                cada treino e acompanhe sua evolução.
              </p>
              <div className="space-y-3 pt-1">
                <Cta label="QUERO MEU TREINO PERSONALIZADO" />
                <p className="text-sm text-light-muted">
                  12 meses por {PRECO_ANUAL_FORMATADO} · Pagamento único
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
                  alt="Tela de treino personalizado do AthletIA"
                  className="w-full rounded-[1.8rem]"
                  width="400"
                  height="800"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* BENEFÍCIOS + TELAS */}
        <section className="px-4 md:px-6 py-14 md:py-16 border-t border-white/5 bg-[#101012]">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-2xl md:text-4xl font-bold leading-tight text-center max-w-3xl mx-auto">
              Tudo pronto para você começar a treinar com direção.
            </h2>

            <div className="mt-10 grid sm:grid-cols-2 gap-4 md:gap-5">
              {FEATURES.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                >
                  <div className="aspect-[16/11] overflow-hidden bg-black/40">
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="h-full w-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm md:text-base text-light-muted leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* RESUMO SIMPLES */}
        <section className="px-4 md:px-6 py-12 md:py-14 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">
              Você informa seu objetivo. O AthletIA prepara seu treino. Você começa.
            </h2>
            <p className="text-light-muted leading-relaxed">
              Sem precisar montar tudo sozinho ou ficar perdido tentando decidir o que fazer.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {['Objetivo', 'Treino pronto', 'Começar'].map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-light">
                    {step}
                  </span>
                  {index < 2 ? <span className="text-primary/60 hidden sm:inline">→</span> : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OFERTA */}
        <section className="relative px-4 md:px-6 py-14 md:py-16 border-t border-white/5 bg-[#101012]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12),_transparent_60%)]" />
          <div className="relative max-w-xl mx-auto text-center">
            <p className="text-base md:text-lg text-light-muted">
              Tenha 12 meses de treinamento personalizado por apenas:
            </p>
            <p className="mt-3 font-display text-5xl md:text-6xl font-extrabold tracking-tight">
              {PRECO_ANUAL_FORMATADO}
            </p>
            <p className="mt-3 text-sm font-medium text-light">
              Pagamento único. Sem mensalidade. Sem renovação automática.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-primary/35 bg-gradient-to-b from-primary/12 to-transparent p-6 md:p-8 text-left">
              <ul className="space-y-3">
                {OFERTA_ITENS.map((item) => (
                  <li key={item} className="flex gap-3 text-sm md:text-base text-light">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-dark">
                      ✓
                    </span>
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
                Garantia de 7 dias · Pagamento seguro
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 md:px-6 py-14 md:py-16 border-t border-white/5">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
              Dúvidas rápidas
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
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Crie seu acesso
              </p>
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
                {!contaPronta ? (
                  <form onSubmit={criarConta} onFocusCapture={marcarCheckout} className="space-y-3">
                    <input id="comece-nome" required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="Nome completo" autoComplete="name" aria-label="Nome completo" />
                    <input id="comece-tel" required value={telefone} onChange={(e) => setTelefone(mascararTelefone(e.target.value))} className={inputClass} placeholder="Telefone com DDD" inputMode="tel" autoComplete="tel" aria-label="Telefone com DDD" />
                    <input id="comece-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="E-mail" autoComplete="email" aria-label="E-mail" />
                    <input id="comece-senha" type="password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} className={inputClass} placeholder="Senha" autoComplete="new-password" aria-label="Senha" />
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
                  <div>
                    <p className="mb-4 text-sm text-light-muted">
                      Conta pronta{user?.email ? ` · ${user.email}` : ''}. Finalize o pagamento.
                    </p>
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
