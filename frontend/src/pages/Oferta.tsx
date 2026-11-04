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
          subtitle="Treino certo para o seu corpo, que evolui sozinho a cada sessão. No plano de 6 meses sai por R$ 14,98/mês."
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
        <section id="comprar" className="scroll-mt-24 py-14 md:py-16 px-4 md:px-6 bg-dark border-t border-primary/20">
          <div className="mx-auto w-full max-w-lg pb-28">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Assinar agora</p>
            <h2 className="mt-2 text-center font-display text-2xl md:text-3xl font-bold leading-tight">
              6 meses pelo preço de 3
            </h2>
            <p className="mt-2 text-center text-sm text-light-muted">
              R$ 14,98/mês · R$ 89,90 hoje · economize R$ 89,50
            </p>

            <div className="mt-6 space-y-2">
              <button
                type="button"
                onClick={() => setPlano('SEMESTRAL')}
                className={`w-full rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                  plano === 'SEMESTRAL'
                    ? 'border-primary bg-primary text-dark'
                    : 'border-white/10 bg-white/5 text-light'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block text-sm font-bold">6 meses</span>
                    <span className={`block text-xs ${plano === 'SEMESTRAL' ? 'text-dark/70' : 'text-primary'}`}>
                      Melhor escolha · economize R$ 89,50
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-base font-bold">R$ 14,98<span className="text-xs font-medium opacity-70">/mês</span></span>
                    <span className="text-xs opacity-70">R$ 89,90 hoje</span>
                  </span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPlano('MENSAL')}
                className={`w-full rounded-2xl border px-4 py-3.5 text-left transition-colors ${
                  plano === 'MENSAL' ? 'border-primary/40 bg-white/5' : 'border-white/10 bg-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block text-sm font-bold text-light">Mensal</span>
                    <span className="block text-xs text-light-muted">R$ 179,40 em 6 meses</span>
                  </span>
                  <span className="text-right text-light">
                    <span className="block text-sm font-bold">R$ 29,90</span>
                    <span className="text-xs text-light-muted">por mês</span>
                  </span>
                </div>
              </button>
            </div>

            <h3 className="mt-8 text-lg font-bold">Crie o seu acesso</h3>

            {!contaPronta ? (
              <form onSubmit={criarConta} className="mt-4 space-y-3">
                <input id="oferta-nome" required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="Nome completo" autoComplete="name" aria-label="Nome" />
                <input id="oferta-tel" required value={telefone} onChange={(e) => setTelefone(mascararTelefone(e.target.value))} className={inputClass} placeholder="Telefone com DDD" inputMode="tel" autoComplete="tel" aria-label="Telefone" />
                <input id="oferta-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="E-mail" autoComplete="email" aria-label="E-mail" />
                <input id="oferta-senha" type="password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} className={inputClass} placeholder="Senha (mín. 8 caracteres)" autoComplete="new-password" aria-label="Senha" />
                {erroConta && <p className="text-sm font-semibold text-error">{erroConta}</p>}
                <button type="submit" disabled={loadingConta} className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-dark disabled:opacity-50">
                  {loadingConta ? 'Criando...' : 'Continuar'}
                </button>
                <p className="text-center text-xs text-light-muted">
                  Já tem conta? <Link to="/login" className="text-primary underline">Entrar</Link>
                </p>
              </form>
            ) : (
              <div className="mt-4">
                <p className="mb-3 text-sm text-light-muted">
                  Conta pronta{user?.email ? ` · ${user.email}` : ''}. Finalize o pagamento.
                </p>
                <CheckoutPagamento
                  planoInicial={plano}
                  planoControlado={plano}
                  onPlanoChange={(id) => setPlano(id as 'MENSAL' | 'SEMESTRAL')}
                  destacarSemestral
                  source="oferta"
                  onSuccessNavigateTo="/montar-treino"
                  mostrarSeletorPlano={false}
                  sticky
                />
              </div>
            )}
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
