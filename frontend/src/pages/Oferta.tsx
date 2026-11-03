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

/** Index atual + checkout na mesma página (sem onboarding antes do pagamento). */
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
        detail: { eventType: 'oferta_viewed', properties: { plano: 'SEMESTRAL' } }
      }))
    } catch {
      // analytics opcional
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
              alt="Logo AthletIA - Treino Personalizado Inteligente com IA"
              className="w-8 h-8 md:w-10 md:h-10 rounded-2xl shadow-lg"
              loading="eager"
              width="40"
              height="40"
            />
            <div className="text-lg md:text-xl font-display font-bold tracking-tight text-light">AthletIA</div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm md:text-base font-semibold bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-dark px-4 py-2 md:px-5 md:py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Entrar
          </button>
        </div>
      </header>

      <main role="main" id="main-content" aria-label="Conteúdo principal da landing page">
        <LandingHero onStartOnboarding={scrollComprar} />

        <section aria-label="A dor que impede sua evolução" className="py-16 md:py-20 px-4 md:px-6 border-t border-grey/20">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
              A dor que impede sua evolução
            </h2>
            <p className="text-lg md:text-xl text-light-muted leading-relaxed">
              Você não evolui porque treina com rotinas genéricas que não foram feitas para o seu corpo.
            </p>
            <p className="text-xl md:text-2xl font-display font-semibold text-light">
              Seu corpo muda. Seu treino precisa mudar junto.
            </p>
            <div className="pt-6">
              <button
                type="button"
                onClick={scrollComprar}
                className="btn-primary text-base md:text-lg px-10 md:px-14 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Quero meu treino personalizado
              </button>
            </div>
          </div>
        </section>

        <section aria-label="O que você ganha" className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-b from-dark via-dark-lighter/30 to-dark">
          <div className="max-w-6xl mx-auto space-y-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
              O que você ganha
            </h2>
            <p className="text-lg md:text-xl text-light-muted max-w-3xl mx-auto">
              Conteúdo sobre treino, saúde, evolução física e qualidade de vida. Aprenda estratégias práticas para acelerar seus resultados.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  ),
                  title: 'Treinos personalizados',
                  description: 'O AthletIA cria um plano de treinamento exclusivo com base no seu nível de condicionamento físico, objetivos e equipamentos disponíveis.'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ),
                  title: 'Evolução automática',
                  description: 'A IA ajusta automaticamente peso, repetições e volume a cada treino baseado no seu desempenho real. Você só treina, o sistema evolui.'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  title: 'Progresso visível',
                  description: 'Mantenha-se motivado com acompanhamento de progresso em tempo real, estatísticas detalhadas e conquistas para comemorar suas vitórias.'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ),
                  title: '300 exercícios validados',
                  description: 'Do iniciante ao avançado, explore uma biblioteca com mais de 300 exercícios com guias em vídeo para garantir a forma correta e maximizar os resultados.'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  ),
                  title: 'Funciona em qualquer academia',
                  description: 'Em casa ou na academia, o AthletIA adapta seu plano ao seu ambiente. Sem equipamentos? Sem problemas. Treine onde e quando quiser.'
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: 'Garantia',
                  description: 'Teste por 7 dias. Não gostou, devolvemos 100% do valor. Zero riscos. Comece sua jornada de transformação com total segurança e confiança.'
                }
              ].map((beneficio, index) => (
                <div key={index} className="bg-dark-lighter rounded-xl p-6 border border-grey/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all h-full flex flex-col group">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 group-hover:bg-primary/30 mb-5 mx-auto transition-colors">
                    <div className="text-primary">{beneficio.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold text-light mb-3 text-center">{beneficio.title}</h3>
                  <p className="text-light-muted text-sm leading-relaxed flex-grow text-center">{beneficio.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" aria-label="Como funciona" className="py-16 md:py-20 px-4 md:px-6 bg-dark-lighter/50 border-y border-grey/20">
          <div className="max-w-6xl mx-auto space-y-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
              Como funciona
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pt-8">
              {[
                { numero: 1, titulo: 'Crie seu acesso em 1 minuto' },
                { numero: 2, titulo: 'Pague e libere o plano na hora' },
                { numero: 3, titulo: 'Responda perguntas rápidas' },
                { numero: 4, titulo: 'A IA monta e evolui seu treino' }
              ].map((passo) => (
                <div key={passo.numero} className="space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary mx-auto">
                    {passo.numero}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-light">{passo.titulo}</h3>
                </div>
              ))}
            </div>
            <div className="pt-8">
              <button
                type="button"
                onClick={scrollComprar}
                className="btn-primary text-lg md:text-xl px-10 md:px-16 py-5 md:py-6 font-bold shadow-2xl shadow-primary/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
              >
                Quero começar agora
              </button>
            </div>
          </div>
        </section>

        <section aria-label="Depoimentos" className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-b from-dark-lighter/50 to-dark">
          <div className="max-w-6xl mx-auto space-y-8 md:space-y-10">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
                O que as pessoas estão dizendo sobre o <span className="text-primary">AthletIA</span> por aí?
              </h2>
              <p className="text-lg md:text-xl text-light-muted max-w-3xl mx-auto">
                Junte-se a milhares de usuários em todo o mundo e experimente o futuro do treinamento personalizado.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                { texto: 'Aplicativo incrível! Os treinos personalizados me mantêm motivado e estou vendo um progresso real!', nome: 'Miguel S.' },
                { texto: 'Super fácil de usar e repleto de recursos incríveis. Acompanhar meu progresso nunca foi tão simples!', nome: 'Ana M.' },
                { texto: 'Em casa ou na academia, o AthletIA adapta seu plano ao seu ambiente. Sem equipamentos? Sem problemas.', nome: 'João R.' }
              ].map((item) => (
                <div key={item.nome} className="rounded-2xl border border-grey/20 bg-dark-lighter p-6 space-y-4 shadow-xl h-full flex flex-col">
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-base md:text-lg font-medium text-light leading-relaxed flex-grow">"{item.texto}"</p>
                  <p className="text-sm text-light-muted font-semibold">{item.nome}</p>
                </div>
              ))}
            </div>
            <div className="pt-6 text-center">
              <button
                onClick={scrollComprar}
                className="btn-primary text-base md:text-lg px-10 md:px-14 py-4 md:py-5 font-bold shadow-xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Quero resultados assim
              </button>
            </div>
          </div>
        </section>

        <ComparisonTable onStartOnboarding={scrollComprar} />

        <section aria-label="Por que AthletIA" className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-br from-dark via-dark-lighter/30 to-dark">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-10 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">
                Por que <span className="text-primary">AthletIA</span>?
              </h2>
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {[
                  { title: 'Inteligente e adaptável', description: 'A IA do AthletIA aprende com seu desempenho e se ajusta para mantê-lo desafiado.' },
                  { title: 'Todos os níveis são bem-vindos', description: 'De iniciantes a entusiastas do fitness, o AthletIA atende a todos os níveis de experiência.' },
                  { title: 'Conveniência em primeiro lugar', description: 'Treine quando e onde quiser. Chega de perder treinos por falta de planejamento.' },
                  { title: 'Sem suposições', description: 'Obtenha orientação especializada sem o alto custo de um personal trainer.' }
                ].map((beneficio, index) => (
                  <div key={index} className="flex items-start gap-4 group bg-dark-lighter/50 rounded-xl p-6 border border-grey/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-xl font-bold text-light mb-2">{beneficio.title}</h3>
                      <p className="text-light-muted leading-relaxed">{beneficio.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Garantia" className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-br from-primary/20 via-primary/10 to-dark border-y border-primary/30">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light">Garantia</h2>
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-primary leading-relaxed">
              Teste por 7 dias. Não gostou, devolvemos 100% do valor. Zero riscos.
            </p>
          </div>
        </section>

        {/* Checkout na mesma página */}
        <section id="comprar" className="scroll-mt-24 py-16 md:py-20 px-4 md:px-6 bg-dark">
          <div className="mx-auto w-full max-w-lg pb-28">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Melhor escolha</p>
            <h2 className="mt-2 text-center font-display text-3xl md:text-4xl font-bold leading-tight">
              6 meses de treino certo pelo preço de 3.
            </h2>
            <p className="mt-3 text-center text-light-muted">Sai por R$ 14,98/mês. Começa hoje.</p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setPlano('SEMESTRAL')}
                className={`w-full rounded-2xl border px-4 py-4 text-left ${
                  plano === 'SEMESTRAL'
                    ? 'border-primary bg-gradient-to-b from-[#2a2114] to-dark-lighter shadow-[0_16px_40px_-20px_rgba(249,166,32,0.8)]'
                    : 'border-white/10 bg-transparent'
                }`}
              >
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-dark">Melhor escolha</span>
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">Economize R$ 89,50</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">6 meses</p>
                    <p className="mt-1 text-xs text-light-muted">R$ 89,90 hoje</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-bold leading-none text-primary">R$ 14,98</p>
                    <p className="text-xs text-light-muted">por mês</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPlano('MENSAL')}
                className={`w-full rounded-2xl border px-4 py-4 text-left ${
                  plano === 'MENSAL' ? 'border-primary/50 bg-white/5' : 'border-white/10 bg-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">Mensal</p>
                    <p className="mt-1 text-xs text-light-muted">Flexível, mas sai mais caro.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">R$ 29,90/mês</p>
                    <p className="text-xs text-light-muted">R$ 179,40 em 6 meses</p>
                  </div>
                </div>
              </button>
            </div>
            <p className="mt-4 text-center text-sm font-medium text-light">Mesmo treino. Metade do preço no período.</p>

            <h3 className="mt-10 font-display text-xl font-bold">Crie seu acesso e pague em 1 minuto</h3>
            <p className="mt-2 text-sm text-light-muted">Sem questionário agora. Você monta o treino depois de pagar.</p>

            {!contaPronta ? (
              <form onSubmit={criarConta} className="mt-5 space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-light-muted" htmlFor="oferta-nome">Nome</label>
                  <input id="oferta-nome" required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} placeholder="Seu nome" autoComplete="name" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-light-muted" htmlFor="oferta-tel">Telefone</label>
                  <input id="oferta-tel" required value={telefone} onChange={(e) => setTelefone(mascararTelefone(e.target.value))} className={inputClass} placeholder="(00) 00000-0000" inputMode="tel" autoComplete="tel" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-light-muted" htmlFor="oferta-email">E-mail</label>
                  <input id="oferta-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="seu@email.com" autoComplete="email" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-light-muted" htmlFor="oferta-senha">Senha</label>
                  <input id="oferta-senha" type="password" required minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} className={inputClass} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
                </div>
                {erroConta && <p className="text-sm font-semibold text-error">{erroConta}</p>}
                <button type="submit" disabled={loadingConta} className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-dark disabled:opacity-50">
                  {loadingConta ? 'Criando acesso...' : 'Continuar para pagar'}
                </button>
                <p className="text-center text-xs text-light-muted">
                  Já tem conta? <Link to="/login" className="text-primary underline">Entrar</Link>
                </p>
              </form>
            ) : (
              <div className="mt-5">
                <p className="mb-3 text-sm text-light-muted">
                  Conta pronta{user?.email ? ` · ${user.email}` : ''}. Escolha o plano e pague.
                </p>
                <CheckoutPagamento
                  planoInicial={plano}
                  planoControlado={plano}
                  onPlanoChange={(id) => setPlano(id as 'MENSAL' | 'SEMESTRAL')}
                  destacarSemestral
                  source="oferta"
                  onSuccessNavigateTo="/montar-treino"
                  mostrarSeletorPlano
                  sticky
                />
              </div>
            )}
          </div>
        </section>
      </main>

      <footer role="contentinfo" className="py-10 md:py-12 px-4 md:px-6 border-t border-grey/20 bg-dark">
        <div className="max-w-6xl mx-auto space-y-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-primary font-display font-bold text-lg md:text-xl">AthletIA</span>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 text-xs md:text-sm text-light-muted">
              <button onClick={() => setModalTermos(true)} className="hover:text-primary transition-colors">Termos</button>
              <button onClick={() => setModalPrivacidade(true)} className="hover:text-primary transition-colors">Privacidade</button>
              <button onClick={() => setModalCookies(true)} className="hover:text-primary transition-colors">Cookies</button>
            </div>
          </div>
          <div className="text-[11px] md:text-xs text-light-muted space-y-1">
            <p>Consulte seu médico antes de iniciar qualquer programa de exercícios</p>
            <p>© 2026 AthletIA</p>
          </div>
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
