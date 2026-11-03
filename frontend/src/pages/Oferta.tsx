import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/auth.service'
import CheckoutPagamento from '../components/CheckoutPagamento'

const inputClass =
  'h-12 w-full rounded-xl bg-dark border border-grey/40 px-3 text-base text-light placeholder:text-light-muted focus:outline-none focus:border-primary'

function mascararTelefone(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  if (digitos.length <= 2) return digitos.length ? `(${digitos}` : ''
  if (digitos.length <= 7) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

const DEPOIMENTOS = [
  { texto: 'Os treinos evoluem comigo. Nunca fiquei tanto tempo consistente.', nome: 'Miguel S.' },
  { texto: 'Finalmente sei exatamente o que treinar e quando evoluir.', nome: 'Ana M.' },
  { texto: 'Simples, inteligente e funciona de verdade.', nome: 'João R.' }
]

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
    <div className="relative min-h-screen overflow-x-hidden bg-dark text-light">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(ellipse_at_top,_rgba(249,166,32,0.28),_transparent_65%)]" />

      <main className="relative mx-auto w-full max-w-lg px-4 pb-36 pt-5">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-10 w-10 rounded-2xl shadow-lg shadow-black/40" />
          <span className="font-display text-xl font-bold tracking-tight">AthletIA</span>
        </div>

        <section className="mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Melhor escolha</p>
          <h1 className="mt-2 font-display text-[2rem] font-bold leading-[1.1]">
            6 meses de treino certo pelo preço de 3.
          </h1>
          <p className="mt-3 text-base text-light-muted">Sai por R$ 14,98/mês. Começa hoje.</p>
          <div className="mt-5">
            <p className="font-display text-5xl font-bold leading-none text-primary">R$ 89,90</p>
            <p className="mt-1 text-sm text-light-muted">R$ 14,98/mês · acesso imediato</p>
          </div>
          <button
            type="button"
            onClick={scrollComprar}
            className="mt-6 h-14 w-full rounded-2xl bg-primary text-base font-bold text-dark shadow-lg shadow-primary/35"
          >
            Quero 6 meses agora
          </button>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold leading-snug">
            Não é planilha. É o treino certo para o seu corpo.
          </h2>
          <ul className="mt-4 space-y-3 text-[15px] text-light">
            <li>Personalizado para o seu objetivo</li>
            <li>Evolui sozinho a cada treino</li>
            <li>Academia ou em casa</li>
          </ul>
          <div className="mt-6 space-y-4">
            {DEPOIMENTOS.map((item) => (
              <blockquote key={item.nome} className="border-l-2 border-primary/60 pl-3">
                <p className="text-sm leading-relaxed text-light">“{item.texto}”</p>
                <footer className="mt-1 text-xs text-light-muted">{item.nome}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold leading-snug">
            Pagar mês a mês custa quase o dobro.
          </h2>
          <div className="mt-4 space-y-3">
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

            <button
              type="button"
              onClick={() => setPlano('SEMESTRAL')}
              className={`w-full rounded-2xl border px-4 py-4 text-left shadow-[0_16px_40px_-20px_rgba(249,166,32,0.8)] ${
                plano === 'SEMESTRAL'
                  ? 'border-primary bg-gradient-to-b from-[#2a2114] to-dark-lighter'
                  : 'border-white/10 bg-transparent'
              }`}
            >
              <div className="mb-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-dark">
                  Melhor escolha
                </span>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  Economize R$ 89,50
                </span>
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
          </div>
          <p className="mt-4 text-sm font-medium text-light">Mesmo treino. Metade do preço no período.</p>
          <p className="mt-2 text-xs text-light-muted">7 dias. Não gostou, devolvemos.</p>
        </section>

        <section id="comprar" className="mt-12 scroll-mt-4">
          <h2 className="font-display text-xl font-bold">Crie seu acesso e pague em 1 minuto</h2>
          <p className="mt-2 text-sm text-light-muted">Sem questionário agora. Você monta o treino depois de pagar.</p>

          {!contaPronta ? (
            <form onSubmit={criarConta} className="mt-5 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-light-muted" htmlFor="oferta-nome">Nome</label>
                <input
                  id="oferta-nome"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputClass}
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-light-muted" htmlFor="oferta-tel">Telefone</label>
                <input
                  id="oferta-tel"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                  className={inputClass}
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-light-muted" htmlFor="oferta-email">E-mail</label>
                <input
                  id="oferta-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-light-muted" htmlFor="oferta-senha">Senha</label>
                <input
                  id="oferta-senha"
                  type="password"
                  required
                  minLength={8}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className={inputClass}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>
              {erroConta && <p className="text-sm font-semibold text-error">{erroConta}</p>}
              <button
                type="submit"
                disabled={loadingConta}
                className="h-14 w-full rounded-2xl bg-primary text-base font-bold text-dark disabled:opacity-50"
              >
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
        </section>
      </main>
    </div>
  )
}
