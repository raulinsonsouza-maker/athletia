import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/auth.service'
import { useToast } from '../hooks/useToast'
import InputMask from 'react-input-mask'

interface Planos {
  id: string
  nome: string
  preco: number
  periodo: string
  desconto?: string
  popular?: boolean
  economia?: string
}

const PLANOS: Planos[] = [
  {
    id: 'MENSAL',
    nome: 'Mensal',
    preco: 19.90,
    periodo: 'por mês',
    desconto: '0%',
  },
  {
    id: 'TRIMESTRAL',
    nome: 'Trimestral',
    preco: 49.90,
    periodo: 'a cada 3 meses',
    desconto: '16%',
    economia: 'Economize R$ 9,80',
  },
  {
    id: 'SEMESTRAL',
    nome: 'Semestral',
    preco: 89.90,
    periodo: 'a cada 6 meses',
    desconto: '25%',
    popular: true,
    economia: 'Economize R$ 29,50',
  },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('SEMESTRAL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tempoRestante, setTempoRestante] = useState(15 * 60) // 15 minutos em segundos
  const [ofertaExpirada, setOfertaExpirada] = useState(false)

  // Scroll para o topo ao carregar a página
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Timer de urgência
  useEffect(() => {
    // Verificar se já existe timestamp salvo
    const timestampSalvo = localStorage.getItem('checkoutTimerStart')
    let startTime: number

    if (timestampSalvo) {
      startTime = parseInt(timestampSalvo)
    } else {
      startTime = Date.now()
      localStorage.setItem('checkoutTimerStart', startTime.toString())
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const remaining = 15 * 60 - elapsed

      if (remaining <= 0) {
        setTempoRestante(0)
        setOfertaExpirada(true)
        clearInterval(interval)
      } else {
        setTempoRestante(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }

  // Calcular valores do plano selecionado
  const planoSelecionadoObj = PLANOS.find(p => p.id === planoSelecionado)
  const totalAPagar = planoSelecionadoObj?.preco || 0

  const handleAtivarPlano = async () => {
    if (!user?.id) {
      showToast('Erro: usuário não encontrado. Faça login novamente.', 'error')
      navigate('/login')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/ativar-plano-pagamento', {
        userId: user.id,
        plano: planoSelecionado
      })

      // Atualizar estado do usuário com dados do backend
      if (response.data?.user) {
        const userAtualizado = {
          ...response.data.user,
          planoAtivo: response.data.user.planoAtivo ?? true,
          plano: response.data.user.plano ?? planoSelecionado
        }
        
        // Atualizar contexto e localStorage
        updateUser(userAtualizado)
        
        console.log('✅ Usuário atualizado com plano ativo:', userAtualizado)
        console.log('📦 Dados salvos no localStorage')
      } else {
        console.warn('⚠️ Resposta do backend não contém dados do usuário, atualizando manualmente')
        // Atualizar manualmente mesmo sem resposta completa
        updateUser({
          planoAtivo: true,
          plano: planoSelecionado
        })
        console.log('✅ Estado atualizado manualmente')
      }
      
      // Verificar se o estado foi atualizado corretamente
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        console.log('🔍 Estado atual do usuário no localStorage:', {
          id: parsedUser.id,
          planoAtivo: parsedUser.planoAtivo,
          plano: parsedUser.plano
        })
      }

      showToast('Plano ativado com sucesso! Treinos gerados automaticamente.', 'success')
      
      // Limpar timer do localStorage
      localStorage.removeItem('checkoutTimerStart')
      
      // Aguardar um momento para garantir que o estado foi atualizado
      // Usar window.location.href para forçar reload completo e garantir que o AuthContext
      // seja recarregado do localStorage com os dados atualizados
      setTimeout(() => {
        console.log('🔄 Redirecionando para dashboard...')
        // Usar window.location.href para forçar reload completo
        // Isso garante que o AuthContext seja recarregado do localStorage
        // e o ProtectedRoute veja o estado atualizado
        window.location.href = '/dashboard'
      }, 1000)
    } catch (err: any) {
      console.error('❌ Erro ao ativar plano:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao ativar plano. Tente novamente.'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      
      // Se for erro de autenticação, redirecionar para login
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  // Estados para formulário de pagamento
  const [dadosPagamento, setDadosPagamento] = useState({
    nomeCartao: '',
    numeroCartao: '',
    validade: '',
    cvv: '',
    cpf: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setDadosPagamento(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <ToastContainer />
      
      {/* 1. HEADER FIXO (Mobile-first) */}
      <header className="sticky top-0 z-50 w-full py-3 px-4 border-b border-grey/20 bg-dark/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-xl md:text-2xl font-display font-bold text-primary">AthletIA</div>
          <div className="flex items-center gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-1 text-light-muted">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Checkout Seguro</span>
            </div>
            {!ofertaExpirada && (
              <div className="flex items-center gap-1 text-primary font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-mono text-xs">{formatarTempo(tempoRestante)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container-custom section pb-20">
        {/* 2. HERO DO CHECKOUT */}
        <section className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-light mb-3 leading-tight">
            Seu Plano Personalizado Está Pronto.
          </h1>
          <p className="text-lg md:text-xl text-light-muted mb-6">
            Complete o pagamento e desbloqueie seus treinos agora.
          </p>
          
          {/* Mini caixas de prova social no topo */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
            <div className="bg-dark-lighter/50 border border-primary/20 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className="text-lg font-bold text-primary">4.9/5</span>
              </div>
            </div>
            <div className="bg-dark-lighter/50 border border-primary/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-primary mb-1">10k+</div>
              <div className="text-xs text-light-muted">usuários</div>
            </div>
            <div className="bg-dark-lighter/50 border border-primary/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-primary mb-1">95%</div>
              <div className="text-xs text-light-muted">satisfação</div>
            </div>
          </div>
        </section>

        {/* 3. BLOCO DE GARANTIA + SEGURANÇA (Topo) */}
        <section className="mb-8 animate-fade-in">
          <div className="card p-4 md:p-6 bg-primary/10 border-2 border-primary/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="text-sm font-semibold text-light">Garantia incondicional de 7 dias.</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p className="text-sm font-semibold text-light">Sem renovação automática.</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-sm font-semibold text-light">Pagamento 100% seguro (SSL).</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SEÇÃO "O QUE VOCÊ ESTÁ COMPRANDO" (Ultra Enxuta) */}
        <section className="mb-8 animate-fade-in">
          <div className="card p-5">
            <h3 className="text-lg font-bold text-light mb-4 text-center">O Que Você Está Comprando</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-light">Treinos personalizados com IA</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-light">Ajustes automáticos conforme evolução</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-light">Progresso visual e gráficos</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-light">Suporte</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-light">Acesso imediato</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. ESCOLHA DO PLANO (Seção Mais Importante) */}
        <section className="mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-6 text-center">
            Escolha seu Plano
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {PLANOS.map((plano) => {
              const selected = planoSelecionado === plano.id
              const precoMensal = plano.id === 'MENSAL' 
                ? plano.preco 
                : plano.id === 'TRIMESTRAL' 
                  ? plano.preco / 3 
                  : plano.preco / 6

              return (
                <button
                  key={plano.id}
                  type="button"
                  onClick={() => setPlanoSelecionado(plano.id)}
                  className={`relative p-5 md:p-6 rounded-xl text-left transition-all duration-300 ${
                    selected
                      ? 'border-2 border-primary bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 scale-105 shadow-2xl shadow-primary/30'
                      : plano.popular
                      ? 'border-2 border-primary/50 bg-dark-lighter hover:border-primary hover:scale-[1.02]'
                      : 'border border-grey/50 bg-dark-lighter hover:border-primary/50 hover:scale-[1.02]'
                  }`}
                >
                  {/* Badge Mais Popular */}
                  {plano.popular && !selected && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-primary text-dark text-xs font-bold px-3 py-1 rounded-full">
                        MAIS POPULAR
                      </span>
                    </div>
                  )}

                  {/* Badge Selecionado */}
                  {selected && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="bg-primary rounded-full p-2 shadow-lg">
                        <svg className="w-5 h-5 text-dark" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Header do Plano */}
                  <div className="mb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-light">{plano.nome}</h3>
                  </div>

                  {/* Preço */}
                  <div className="mb-4 pb-4 border-b border-grey/30">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-lg font-semibold text-light-muted">R$</span>
                      <span className="text-4xl md:text-5xl font-bold text-primary">{precoMensal.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-light-muted mb-2">{plano.periodo}</p>
                    {plano.id !== 'MENSAL' && (
                      <div className="mt-2">
                        <p className="text-xs text-light-muted mb-1">Total:</p>
                        <p className="text-lg font-bold text-light">
                          R$ {plano.preco.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {plano.economia && (
                      <p className="text-sm text-success font-bold mt-2">{plano.economia}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* 6. RESUMO DO PLANO (Após Escolha) */}
        {planoSelecionadoObj && (
          <section className="mb-8 animate-scale-in">
            <div className="card p-5 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/50">
              <div className="text-center mb-4">
                <p className="text-sm text-light-muted mb-2">Plano Selecionado:</p>
                <h3 className="text-2xl font-bold text-light mb-1">{planoSelecionadoObj.nome}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-lg font-semibold text-light-muted">R$</span>
                  <span className="text-4xl font-bold text-primary">{totalAPagar.toFixed(2)}</span>
                </div>
                {planoSelecionadoObj.economia && (
                  <p className="text-success font-bold text-sm mt-2">{planoSelecionadoObj.economia}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 7. FORMULÁRIO DE PAGAMENTO (Mínimo Atrito) */}
        <section className="mb-8">
          <div className="card p-5 md:p-6 max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-display font-bold text-light mb-6 text-center">
              Dados de Pagamento
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="label-field text-sm">Nome no Cartão *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nome como está no cartão"
                  value={dadosPagamento.nomeCartao}
                  onChange={(e) => handleInputChange('nomeCartao', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label-field text-sm">Número do Cartão *</label>
                <InputMask
                  mask="9999 9999 9999 9999"
                  placeholder="0000 0000 0000 0000"
                  value={dadosPagamento.numeroCartao}
                  onChange={(e: any) => handleInputChange('numeroCartao', e.target.value)}
                >
                  {(inputProps: any) => (
                    <input
                      {...inputProps}
                      type="text"
                      className="input-field"
                      required
                    />
                  )}
                </InputMask>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field text-sm">Validade *</label>
                  <InputMask
                    mask="99/99"
                    placeholder="MM/AA"
                    value={dadosPagamento.validade}
                    onChange={(e: any) => handleInputChange('validade', e.target.value)}
                  >
                    {(inputProps: any) => (
                      <input
                        {...inputProps}
                        type="text"
                        className="input-field"
                        required
                      />
                    )}
                  </InputMask>
                </div>

                <div>
                  <label className="label-field text-sm">CVV *</label>
                  <InputMask
                    mask="999"
                    placeholder="000"
                    value={dadosPagamento.cvv}
                    onChange={(e: any) => handleInputChange('cvv', e.target.value)}
                  >
                    {(inputProps: any) => (
                      <input
                        {...inputProps}
                        type="text"
                        className="input-field"
                        required
                      />
                    )}
                  </InputMask>
                </div>
              </div>

              <div>
                <label className="label-field text-sm">CPF *</label>
                <InputMask
                  mask="999.999.999-99"
                  placeholder="000.000.000-00"
                  value={dadosPagamento.cpf}
                  onChange={(e: any) => handleInputChange('cpf', e.target.value)}
                >
                  {(inputProps: any) => (
                    <input
                      {...inputProps}
                      type="text"
                      className="input-field"
                      required
                    />
                  )}
                </InputMask>
              </div>

              {/* Badges de Segurança */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-grey/20">
                <div className="flex items-center gap-2 text-xs text-light-muted">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>SSL</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-light-muted">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>PCI</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-light-muted">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>100% Seguro</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* 8. CTA ULTRA DIRETO */}
            <button
              onClick={handleAtivarPlano}
              disabled={loading}
              className="btn-primary text-lg md:text-xl px-8 py-5 font-bold w-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform flex items-center justify-center gap-3 mb-3"
            >
              {loading ? (
                <>
                  <div className="spinner h-5 w-5"></div>
                  Processando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Ativar Plano e Gerar Meus Treinos Agora</span>
                </>
              )}
            </button>

            <p className="text-sm text-light-muted text-center">
              Seus treinos são gerados automaticamente em segundos após o pagamento.
            </p>
          </div>
        </section>

        {/* 9. FOOTER DE CONFIANÇA */}
        <footer className="py-6 px-4 border-t border-grey/20 mt-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm">
              <a href="#" className="text-light-muted hover:text-primary transition-colors">Termos de Serviço</a>
              <a href="#" className="text-light-muted hover:text-primary transition-colors">Política de Privacidade</a>
              <a href="#" className="text-light-muted hover:text-primary transition-colors">Política de Reembolso</a>
            </div>
            <p className="text-center text-xs text-light-muted mt-4">
              © {new Date().getFullYear()} AthletIA. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

