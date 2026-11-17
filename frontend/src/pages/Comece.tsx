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
    q: 'Preciso já ter experiência com academia?',
    a: 'Não. O AthletIA atende pessoas com diferentes níveis de experiência, inclusive quem está começando.'
  },
  {
    q: 'Posso treinar em casa?',
    a: 'Sim. O aplicativo permite estruturar treinamentos para casa ou academia.'
  },
  {
    q: 'Como recebo meu treinamento?',
    a: 'Após a confirmação da compra e a conclusão do cadastro, você poderá acessar o AthletIA e seguir as orientações para criar seu treinamento.'
  },
  {
    q: 'O acesso dura quanto tempo?',
    a: 'O plano anunciado oferece 12 meses de acesso.'
  },
  {
    q: 'Existe cobrança mensal?',
    a: `Não. O valor de ${PRECO_ANUAL_FORMATADO} é pago uma única vez, sem mensalidade ou renovação automática.`
  },
  {
    q: 'E se eu não gostar?',
    a: 'Você conta com 7 dias de garantia, conforme as condições apresentadas na compra.'
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

/** Landing de conversão paga — rota /comece. Não altera a home. */
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
    setMeta('description', 'Você já passou tempo demais adiando a mudança. O AthletIA monta um plano de treino para o seu corpo, objetivo e rotina. 12 meses por R$ 67,90, pagamento único.')
    setMeta('robots', 'noindex, nofollow')
    setMeta('og:title', 'Comece sua mudança | AthletIA', true)
    setMeta('og:description', '12 meses de acesso ao AthletIA por R$ 67,90. Pagamento único, sem renovação automática.', true)
    setMeta('og:url', 'https://athletia.site/comece', true)
    setMeta('og:type', 'website', true)
    setMeta('twitter:title', 'Comece sua mudança | AthletIA')
    setMeta('twitter:description', '12 meses de acesso ao AthletIA por R$ 67,90. Pagamento único.')

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

  const CtaButton = ({ label, className = '' }: { label: string; className?: string }) => (
    <button
      type="button"
      onClick={scrollComprar}
      className={`btn-primary w-full sm:w-auto text-base md:text-lg px-8 py-4 font-bold shadow-xl shadow-primary/30 ${className}`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark text-light">
      <header className="w-full py-4 md:py-5 px-4 md:px-6 border-b border-grey/30 bg-dark/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center gap-2.5">
          <img
            src="/favicon.svg"
            alt=""
            className="w-8 h-8 md:w-9 md:h-9 rounded-2xl"
            width="36"
            height="36"
            loading="eager"
          />
          <span className="text-lg md:text-xl font-display font-bold tracking-tight text-light">AthletIA</span>
        </div>
      </header>

      <main id="main-content">
        {/* 1 — Hero */}
        <section className="px-4 md:px-6 py-14 md:py-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="font-display text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-light">
              Você já passou tempo demais adiando a mudança que deseja ver no espelho.
            </h1>
            <div className="space-y-4 text-base md:text-lg text-light-muted leading-relaxed text-left sm:text-center">
              <p>Você promete que vai começar, tenta novamente e, quando percebe, mais um mês passou.</p>
              <p>Mas você não precisa continuar nesse ciclo.</p>
              <p>
                O AthletIA ajuda você a transformar a vontade de mudar em um plano de treinamento feito para seu corpo,
                seu objetivo e sua rotina.
              </p>
            </div>
            <div className="pt-2 space-y-3">
              <CtaButton label="QUERO COMEÇAR MINHA MUDANÇA" />
              <p className="text-sm text-light-muted">12 meses de acesso por {PRECO_ANUAL_FORMATADO} · Pagamento único</p>
            </div>
            <div className="pt-6 flex justify-center">
              <img
                src="/images/app-preview/Editadas/Hero_nova-400x800.webp"
                srcSet="/images/app-preview/Editadas/Hero_nova-400x800.webp 400w, /images/app-preview/Editadas/Hero_nova-800x1600.webp 800w"
                sizes="(max-width: 640px) 220px, 280px"
                alt="Prévia do aplicativo AthletIA"
                className="w-[220px] md:w-[280px] rounded-[2rem] shadow-2xl shadow-black/50 border border-white/10"
                width="400"
                height="800"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* 2 — Dor */}
        <section className="px-4 md:px-6 py-14 md:py-16 border-t border-grey/20 bg-dark-lighter/40">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-light leading-tight">
              Você sabe que precisa mudar. O que dói é perceber que continua adiando.
            </h2>
            <p className="text-light-muted">Talvez você já tenha passado por isso:</p>
            <ul className="space-y-3 text-light">
              {[
                'Comprar roupas maiores porque as antigas já não vestem como antes.',
                'Evitar determinadas fotos porque não gosta de como aparece.',
                'Olhar para o espelho e sentir que está distante da pessoa que gostaria de ser.',
                'Prometer que segunda-feira será diferente, mas acabar deixando para depois.',
                'Começar a treinar, perder o ritmo e sentir que voltou à estaca zero.'
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-sm md:text-base leading-relaxed text-light-muted">{item}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-3 text-light-muted leading-relaxed">
              <p>E o mais difícil não é apenas o que você vê no espelho.</p>
              <p>É perceber quanto tempo está passando enquanto você espera o momento certo para mudar.</p>
            </div>
          </div>
        </section>

        {/* 3 — Virada */}
        <section className="px-4 md:px-6 py-14 md:py-16">
          <div className="max-w-3xl mx-auto space-y-5">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-light leading-tight">
              E se dessa vez você tivesse um caminho para seguir?
            </h2>
            <div className="space-y-4 text-light-muted leading-relaxed">
              <p>Você não precisa esperar sentir mais motivação.</p>
              <p>
                Também não precisa tentar descobrir sozinho qual treino fazer, quantas vezes treinar ou como organizar
                sua rotina.
              </p>
              <p>O primeiro passo é ter uma direção.</p>
              <p>Um plano que considere seu objetivo, seu nível e a realidade da sua rotina.</p>
              <p className="text-light font-medium">É para isso que existe o AthletIA.</p>
            </div>
          </div>
        </section>

        {/* 4 — Produto */}
        <section className="px-4 md:px-6 py-14 md:py-16 border-y border-grey/20 bg-dark-lighter/40">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-light leading-tight">
              Conheça o AthletIA. Seu próximo passo para cuidar de você.
            </h2>
            <div className="space-y-4 text-light-muted leading-relaxed">
              <p>
                O AthletIA é um aplicativo de treinamento personalizado com inteligência artificial, desenvolvido para
                ajudar você a começar e acompanhar sua evolução.
              </p>
              <p>
                Você informa seus objetivos e recebe um treinamento estruturado de acordo com seu perfil.
              </p>
              <p>
                Sem precisar montar tudo sozinho ou ficar perdido tentando decidir o que fazer a cada treino.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                'Treinamento personalizado para seu objetivo e nível.',
                'Possibilidade de treinar em casa ou na academia.',
                'Acompanhamento e ajustes do treinamento conforme sua evolução.'
              ].map((b) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-dark">✓</span>
                  <span className="text-light">{b}</span>
                </li>
              ))}
            </ul>
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <img
                src="/images/app-preview/feature-treinos.webp"
                alt="Tela de treinos do AthletIA"
                className="rounded-2xl border border-white/10 w-full"
                loading="lazy"
              />
              <img
                src="/images/app-preview/feature-progresso.webp"
                alt="Tela de progresso do AthletIA"
                className="rounded-2xl border border-white/10 w-full"
                loading="lazy"
              />
            </div>
            <div className="pt-2">
              <CtaButton label="QUERO COMEÇAR AGORA" />
            </div>
          </div>
        </section>

        {/* 5 — Como funciona */}
        <section className="px-4 md:px-6 py-14 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-light leading-tight text-center mb-10">
              Começar é mais simples do que você imagina.
            </h2>
            <ol className="space-y-8">
              {[
                {
                  n: '1',
                  t: 'Conte onde quer chegar',
                  d: 'Informe seu objetivo, seu nível e as características da sua rotina.'
                },
                {
                  n: '2',
                  t: 'Receba seu treinamento',
                  d: 'O AthletIA prepara um plano de treinamento personalizado para você.'
                },
                {
                  n: '3',
                  t: 'Comece a cuidar de você',
                  d: 'Siga seu treinamento, acompanhe sua evolução e continue avançando.'
                }
              ].map((p) => (
                <li key={p.n} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {p.n}
                  </div>
                  <div>
                    <p className="font-bold text-light">{p.t}</p>
                    <p className="mt-1 text-sm text-light-muted leading-relaxed">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 6 — Futuro */}
        <section className="px-4 md:px-6 py-14 md:py-16 border-y border-grey/20 bg-dark-lighter/40">
          <div className="max-w-3xl mx-auto space-y-5">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-light leading-tight">
              Imagine olhar para trás daqui a um ano e perceber que você finalmente começou.
            </h2>
            <div className="space-y-4 text-light-muted leading-relaxed">
              <p>Imagine não precisar mais adiar aquela mudança.</p>
              <p>
                Imagine voltar a se sentir confortável com suas roupas, ter mais disposição para suas atividades e
                perceber que está fazendo algo por você.
              </p>
              <p>Não existe transformação instantânea.</p>
              <p>
                Mas existe uma diferença enorme entre continuar prometendo que vai começar e finalmente dar o primeiro
                passo.
              </p>
              <p>Você não precisa resolver tudo hoje.</p>
              <p className="text-light font-medium">Precisa começar.</p>
            </div>
          </div>
        </section>

        {/* 7 — Oferta */}
        <section className="px-4 md:px-6 py-14 md:py-16">
          <div className="max-w-lg mx-auto text-center space-y-5">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-light leading-tight">
              Seu próximo passo começa aqui.
            </h2>
            <p className="text-light-muted leading-relaxed">
              Tenha acesso ao AthletIA por 12 meses e comece a construir uma rotina de treinamento alinhada aos seus
              objetivos.
            </p>
            <div className="rounded-3xl border border-primary/40 bg-primary/10 px-6 py-8 text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">AthletIA — Plano Anual</p>
              <p className="mt-3 font-display text-4xl font-extrabold text-light">{PRECO_ANUAL_FORMATADO}</p>
              <p className="mt-1 text-sm text-light-muted">Pagamento único.</p>
              <ul className="mt-5 space-y-2 text-sm text-light">
                {[
                  '12 meses de acesso.',
                  'Treinamento personalizado.',
                  'Acesso pelo período contratado.',
                  'Sem mensalidade.',
                  'Sem renovação automática.'
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <CtaButton label="QUERO MEU ACESSO AO ATHLETIA" />
            <p className="text-sm text-light-muted">Pagamento seguro · Garantia de 7 dias</p>
          </div>
        </section>

        {/* 8 — Garantia */}
        <section className="px-4 md:px-6 py-14 md:py-16 border-y border-grey/20 bg-dark-lighter/40">
          <div className="max-w-3xl mx-auto space-y-4 text-center sm:text-left">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-light leading-tight">
              Experimente sem assumir um risco desnecessário.
            </h2>
            <p className="text-light-muted leading-relaxed">
              Você tem 7 dias para conhecer o AthletIA.
            </p>
            <p className="text-light-muted leading-relaxed">
              Se decidir que o aplicativo não é para você, poderá solicitar o reembolso dentro do prazo da garantia,
              conforme as condições informadas no momento da compra.
            </p>
          </div>
        </section>

        {/* 9 — FAQ */}
        <section className="px-4 md:px-6 py-14 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-light text-center mb-8">
              Perguntas frequentes
            </h2>
            <div className="space-y-2">
              {FAQ.map((item, index) => {
                const aberto = faqAberto === index
                return (
                  <div key={item.q} className="border border-white/10 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setFaqAberto(aberto ? null : index)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
                      aria-expanded={aberto}
                    >
                      <span className="font-semibold text-light text-sm md:text-base">{item.q}</span>
                      <span className="text-primary text-xl leading-none">{aberto ? '−' : '+'}</span>
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

        {/* 10 — CTA final + checkout */}
        <section className="px-4 md:px-6 py-14 md:py-16 border-t border-grey/20 bg-dark">
          <div className="max-w-lg mx-auto text-center space-y-5 mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-light leading-tight">
              A mudança que você deseja começa com uma decisão.
            </h2>
            <div className="space-y-3 text-light-muted leading-relaxed">
              <p>Você já passou tempo demais esperando o momento perfeito.</p>
              <p>Não precisa esperar mais um mês para começar a cuidar de você.</p>
              <p className="text-light">Dê o primeiro passo com o AthletIA.</p>
            </div>
            <CtaButton label="QUERO COMEÇAR MINHA MUDANÇA" />
            <p className="text-sm text-light-muted">12 meses de acesso por {PRECO_ANUAL_FORMATADO} · Pagamento único</p>
          </div>

          <div id="comprar" className="scroll-mt-24 max-w-lg mx-auto">
            <div className="rounded-3xl border border-white/10 bg-dark-lighter/60 p-5 md:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary text-center">Pedido</p>
              <h3 className="mt-2 text-center font-display text-xl font-bold text-light">AthletIA — Plano Anual</h3>
              <p className="mt-1 text-center text-sm text-light-muted">12 meses de acesso.</p>
              <p className="mt-4 text-center font-display text-3xl font-extrabold text-light">
                Total: {PRECO_ANUAL_FORMATADO}
              </p>
              <p className="mt-1 text-center text-xs text-light-muted">Pagamento único · Sem renovação automática</p>

              <div className="mt-8 border-t border-white/10 pt-6">
                <h4 className="text-lg font-bold text-light">
                  {contaPronta ? 'Finalize o pagamento' : 'Crie seu acesso'}
                </h4>
                <p className="mt-1 text-sm text-light-muted">
                  {contaPronta
                    ? `Conta pronta${user?.email ? ` · ${user.email}` : ''}.`
                    : 'Preencha os dados para liberar o treino após o pagamento.'}
                </p>

                {!contaPronta ? (
                  <form
                    onSubmit={criarConta}
                    onFocusCapture={marcarCheckout}
                    className="mt-5 space-y-3"
                  >
                    <input
                      id="comece-nome"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className={inputClass}
                      placeholder="Nome completo"
                      autoComplete="name"
                      aria-label="Nome"
                    />
                    <input
                      id="comece-tel"
                      required
                      value={telefone}
                      onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                      className={inputClass}
                      placeholder="Telefone com DDD"
                      inputMode="tel"
                      autoComplete="tel"
                      aria-label="Telefone"
                    />
                    <input
                      id="comece-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="E-mail"
                      autoComplete="email"
                      aria-label="E-mail"
                    />
                    <input
                      id="comece-senha"
                      type="password"
                      required
                      minLength={8}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className={inputClass}
                      placeholder="Senha (mín. 8 caracteres)"
                      autoComplete="new-password"
                      aria-label="Senha"
                    />
                    {erroConta && <p className="text-sm font-semibold text-error">{erroConta}</p>}
                    <button
                      type="submit"
                      disabled={loadingConta}
                      className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-dark shadow-lg shadow-primary/30 disabled:opacity-50"
                    >
                      {loadingConta ? 'Criando...' : 'Continuar para o pagamento'}
                    </button>
                  </form>
                ) : (
                  <div className="mt-5">
                    <CheckoutPagamento
                      planoInicial="ANUAL"
                      planoControlado="ANUAL"
                      destacarSemestral={false}
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

      <footer className="py-8 px-4 md:px-6 border-t border-grey/20 bg-dark">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3 text-xs text-light-muted">
          <span className="text-primary font-display font-bold text-base">AthletIA</span>
          <div className="flex gap-4">
            <button type="button" onClick={() => setModalTermos(true)} className="hover:text-primary">
              Termos de Uso
            </button>
            <button type="button" onClick={() => setModalPrivacidade(true)} className="hover:text-primary">
              Política de Privacidade
            </button>
            <button type="button" onClick={() => setModalCookies(true)} className="hover:text-primary">
              Cookies
            </button>
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
