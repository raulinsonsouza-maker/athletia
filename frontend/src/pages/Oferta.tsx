import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/auth.service'
import CheckoutPagamento from '../components/CheckoutPagamento'
import LandingHero from '../components/landing/LandingHero'
import ComparisonTable from '../components/landing/ComparisonTable'
import LegalModal from '../components/legal/LegalModal'
import TermosContent from '../components/legal/TermosContent'
import PrivacidadeContent from '../components/legal/PrivacidadeContent'
import CookiesContent from '../components/legal/CookiesContent'

const inputClass =
  'h-12 w-full rounded-xl bg-dark border border-grey/40 px-3 text-base text-light placeholder:text-light-muted focus:outline-none focus:border-primary'

function mascararTelefone(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : ''
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

/** Index + checkout na mesma página. Poucos CTAs, copy direta para comprar. */
export default function Oferta() {
  const navigate = useNavigate()
  const { user, loading: authLoading, setUserFromResponse } = useAuth()
  const [plano, setPlano] = useState<'MENSAL' | 'SEMESTRAL'>('SEMESTRAL')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loadingConta, setLoadingConta] = useState(false)
  const [erroConta, setErroConta] = useState('')
  const [contaPronta, setContaPronta] = useState(false)
  const [modalTermos, setModalTermos] = useState(false)
  const [modalPrivacidade, setModalPrivacidade] = useState(false)
  const [modalCookies, setModalCookies] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    try {
      window.dispatchEvent(new CustomEvent('analytics:event', {
        detail: { eventType: 'oferta_viewed', properties: { plano: 'SEMESTRAL', path: '/' } }
      }))
    } catch {
      // analytics opcional
    }
    // Page view / config já vem do gtag no index.html; reforça evento de landing
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'page_view', {
          page_title: 'AthletIA - Index',
          page_path: '/',
          page_location: window.location.href
        })
      }
    } catch {
      // gtag opcional
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

  const scrollComprar = () => {
    // Mesma conversão de engajamento da index antiga (Google Ads)
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
        senha
      })
      setUserFromResponse(response.data.user, response.data.accessToken, response.data.refreshToken, true)
      setContaPronta(true)
      try {
        window.dispatchEvent(new CustomEvent('analytics:event', {
          detail: { eventType: 'oferta_signup', properties: { plano } }
        }))
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('event', 'sign_up', { method: 'oferta', plan: plano })
        }
      } catch {
        // analytics opcional
      }
    } catch (err: any) {
      setErroConta(err.response?.data?.error || err.response?.data?.message || 'Não foi possível criar a conta.')
    } finally {
      setLoadingConta(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark text-light">
      <header className="w-full py-4 md:py-5 px-4 md:px-6 border-b border-grey/30 sticky top-0 z-50 bg-dark/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 md:gap-3">
            <img
              src="/favicon.svg"
              alt="Logo AthletIA"
              className="w-8 h-8 md:w-10 md:h-10 rounded-2xl shadow-lg"
              loading="eager"
              width="40"
              height="40"
            />
            <div className="text-lg md:text-xl font-display font-bold tracking-tight text-light">AthletIA</div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-light-muted hover:text-primary transition-colors px-3 py-2"
          >
            Entrar
          </button>
        </div>
      </header>

      <main role="main" id="main-content">
        <LandingHero
          onStartOnboarding={scrollComprar}
          headline="Seu treino personalizado, pronto para começar hoje."
          subtitle="A IA monta o plano certo para o seu corpo e ajusta carga, séries e volume a cada sessão. Academia ou casa — você só treina."
          ctaLabel="Quero começar agora"
          microcopy=""
        />

        {/* Dor — sem botão */}
        <section className="py-14 md:py-16 px-4 md:px-6 border-t border-grey/20">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-light">
              Treino genérico trava sua evolução.
            </h2>
            <p className="text-base md:text-lg text-light-muted leading-relaxed">
              Sem ajuste de carga, volume e objetivo, você gasta tempo e não vê resultado. O AthletIA monta o treino certo e evolui com você.
            </p>
          </div>
        </section>

        {/* 3 benefícios — sem cards densos, sem CTA */}
        <section className="py-14 md:py-16 px-4 md:px-6 bg-dark-lighter/40 border-y border-grey/20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center text-2xl md:text-3xl font-display font-bold text-light mb-8">
              O que muda no seu treino
            </h2>
            <ul className="space-y-5 text-left">
              {[
                { title: 'Treino feito para o seu corpo', desc: 'Objetivo, nível e rotina entram no plano.' },
                { title: 'Evolução automática', desc: 'Peso, séries e volume se ajustam a cada sessão.' },
                { title: 'Academia ou casa', desc: 'Treine onde estiver, sem planilha.' }
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-dark">✓</span>
                  <div>
                    <p className="font-bold text-light">{item.title}</p>
                    <p className="text-sm text-light-muted">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Como funciona — 3 passos, sem CTA */}
        <section className="py-14 md:py-16 px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-8">
              Como funciona
            </h2>
            <ol className="grid sm:grid-cols-3 gap-6 text-left sm:text-center">
              {[
                { n: '1', t: 'Conta o seu objetivo', d: 'Corpo, rotina e meta.' },
                { n: '2', t: 'A IA monta o treino', d: 'Exercícios, séries e cardio.' },
                { n: '3', t: 'O plano evolui com você', d: 'Ajuste a cada sessão.' }
              ].map((p) => (
                <li key={p.n} className="space-y-2">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary sm:mx-auto">
                    {p.n}
                  </div>
                  <p className="font-bold text-light">{p.t}</p>
                  <p className="text-sm text-light-muted">{p.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Prova social — sem CTA */}
        <section className="py-14 md:py-16 px-4 md:px-6 bg-dark-lighter/40 border-y border-grey/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center text-2xl md:text-3xl font-display font-bold text-light mb-8">
              Quem usa, treina com clareza
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { texto: 'Os treinos evoluem comigo. Nunca fiquei tanto tempo consistente.', nome: 'Miguel S.' },
                { texto: 'Finalmente sei o que treinar e quando evoluir.', nome: 'Ana M.' },
                { texto: 'Simples e funciona de verdade.', nome: 'João R.' }
              ].map((item) => (
                <blockquote key={item.nome} className="border-l-2 border-primary/50 pl-4">
                  <p className="text-sm leading-relaxed text-light">“{item.texto}”</p>
                  <footer className="mt-2 text-xs text-light-muted">{item.nome}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        <ComparisonTable onStartOnboarding={scrollComprar} showCta={false} />

        {/* Garantia curta + único CTA intermediário */}
        <section className="py-12 px-4 md:px-6 text-center border-t border-grey/20">
          <p className="text-base md:text-lg text-light-muted max-w-xl mx-auto">
            Garantia de 7 dias. Não gostou, devolvemos 100%.
          </p>
          <button
            type="button"
            onClick={scrollComprar}
            className="btn-primary mt-6 text-base md:text-lg px-10 py-4 font-bold shadow-xl shadow-primary/30"
          >
            Quero meu treino
          </button>
        </section>

        {/* Checkout */}
        <section id="comprar" className="scroll-mt-24 py-14 md:py-20 px-4 md:px-6 bg-dark border-t border-primary/20">
          <div className="mx-auto w-full max-w-lg">
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Assinar agora</p>
              <h2 className="mt-3 font-display text-2xl md:text-3xl font-bold leading-tight text-light">
                Escolha o plano e libere seu treino
              </h2>
              <p className="mt-2 text-sm text-light-muted">
                Acesso na hora · Garantia de 7 dias · Cancele quando quiser
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => setPlano('SEMESTRAL')}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                  plano === 'SEMESTRAL'
                    ? 'border-primary bg-primary text-dark shadow-lg shadow-primary/25'
                    : 'border-white/10 bg-white/[0.04] text-light hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span>
                    <span className="inline-flex items-center gap-2">
                      <span className="text-sm font-bold">6 meses</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        plano === 'SEMESTRAL' ? 'bg-dark/15 text-dark' : 'bg-primary/15 text-primary'
                      }`}>
                        Melhor escolha
                      </span>
                    </span>
                    <span className={`mt-1 block text-xs ${plano === 'SEMESTRAL' ? 'text-dark/70' : 'text-light-muted'}`}>
                      Economize R$ 89,50 · equivalente a R$ 14,98/mês
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-xl font-bold tracking-tight">R$ 89,90</span>
                    <span className="text-xs opacity-70">pagamento único</span>
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPlano('MENSAL')}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                  plano === 'MENSAL'
                    ? 'border-primary/50 bg-white/[0.06] text-light'
                    : 'border-white/10 bg-transparent text-light hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-bold">Mensal</span>
                    <span className="mt-1 block text-xs text-light-muted">Flexível · renova todo mês</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-xl font-bold tracking-tight">R$ 29,90</span>
                    <span className="text-xs text-light-muted">por mês</span>
                  </span>
                </div>
              </button>
            </div>

            <div className="mt-10 border-t border-white/10 pt-8">
              <h3 className="text-lg font-bold text-light">
                {contaPronta ? 'Finalize o pagamento' : 'Crie o seu acesso'}
              </h3>
              <p className="mt-1 text-sm text-light-muted">
                {contaPronta
                  ? `Conta pronta${user?.email ? ` · ${user.email}` : ''}.`
                  : 'Dados básicos para liberar o treino depois do pagamento.'}
              </p>

              {!contaPronta ? (
                <form onSubmit={criarConta} className="mt-5 space-y-3">
                  <input id="oferta-nome" required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="Nome completo" autoComplete="name" aria-label="Nome" />
                  <input id="oferta-tel" required value={telefone} onChange={(e) => setTelefone(mascararTelefone(e.target.value))} className={inputClass} placeholder="Telefone com DDD" inputMode="tel" autoComplete="tel" aria-label="Telefone" />
                  <input id="oferta-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="E-mail" autoComplete="email" aria-label="E-mail" />
                  <input id="oferta-senha" type="password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} className={inputClass} placeholder="Senha (mín. 8 caracteres)" autoComplete="new-password" aria-label="Senha" />
                  {erroConta && <p className="text-sm font-semibold text-error">{erroConta}</p>}
                  <button type="submit" disabled={loadingConta} className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-dark shadow-lg shadow-primary/30 disabled:opacity-50">
                    {loadingConta ? 'Criando...' : 'Continuar para o pagamento'}
                  </button>
                  <p className="text-center text-xs text-light-muted">
                    Já tem conta? <Link to="/login" className="text-primary underline">Entrar</Link>
                  </p>
                </form>
              ) : (
                <div className="mt-5">
                  <CheckoutPagamento
                    planoInicial={plano}
                    planoControlado={plano}
                    onPlanoChange={(id) => setPlano(id as 'MENSAL' | 'SEMESTRAL')}
                    destacarSemestral
                    source="oferta"
                    onSuccessNavigateTo="/montar-treino"
                    mostrarSeletorPlano={false}
                    sticky={false}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 md:px-6 border-t border-grey/20 bg-dark">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-light-muted">
          <span className="text-primary font-display font-bold text-base">AthletIA</span>
          <div className="flex gap-4">
            <button onClick={() => setModalTermos(true)} className="hover:text-primary">Termos</button>
            <button onClick={() => setModalPrivacidade(true)} className="hover:text-primary">Privacidade</button>
            <button onClick={() => setModalCookies(true)} className="hover:text-primary">Cookies</button>
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
