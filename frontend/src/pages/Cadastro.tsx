import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import InputMask from 'react-input-mask'
import api from '../services/auth.service'
import { useAuth } from '../contexts/AuthContext'

interface OnboardingData {
  nome?: string
  dataNascimento?: string
  idade?: number
  sexo?: string
  altura?: number
  pesoAtual?: number
  percentualGordura?: number
  tipoCorpo?: string
  aguaDiaria?: string
  experiencia?: string
  objetivo?: string
  frequenciaSemanal?: number
  tempoDisponivel?: number
  localTreino?: string
  problemasAnteriores?: string[]
  objetivosAdicionais?: string[]
  lesoes?: string[]
  preferencias?: string[]
  rpePreferido?: number
}

interface Planos {
  id: string
  nome: string
  preco: number
  periodo: string
  desconto?: string
  popular?: boolean
  economia?: string
}

// const PLANOS: Planos[] = [ // Não utilizado
//   {
//     id: 'MENSAL',
//     nome: 'Mensal',
//     preco: 19.90,
//     periodo: 'por mês',
//     desconto: '0%',
//   },
//   {
//     id: 'TRIMESTRAL',
//     nome: 'Trimestral',
//     preco: 39.90,
//     periodo: 'a cada 3 meses',
//     desconto: '33%',
//     popular: true,
//     economia: 'Economize R$ 19,80',
//   },
//   {
//     id: 'SEMESTRAL',
//     nome: 'Semestral',
//     preco: 79.90,
//     periodo: 'a cada 6 meses',
//     desconto: '33%',
//     economia: 'Economize R$ 39,50',
//   },
// ]

interface Depoimento {
  nome: string
  idade: number
  depoimento: string
  imagemAntes: string
  imagemDepois: string
}

const DEPOIMENTOS: Depoimento[] = [
  {
    nome: 'Miguel',
    idade: 32,
    depoimento: 'Uma das razões pelas quais eu precisava de alguma orientação e ajuda é porque estou constantemente viajando por todo o país e até mesmo alguns outros países, então é difícil para mim manter uma ótima dieta',
    imagemAntes: '/images/onboarding/Miguel.png',
    imagemDepois: '/images/onboarding/Miguel.png'
  },
  {
    nome: 'Julia',
    idade: 28,
    depoimento: 'Consegui perder 15kg em 6 meses seguindo o plano personalizado. Os treinos são adaptados à minha rotina e os resultados apareceram rapidamente.',
    imagemAntes: '/images/onboarding/Julia.png',
    imagemDepois: '/images/onboarding/Julia.png'
  },
  {
    nome: 'Rodrigo',
    idade: 35,
    depoimento: 'Finalmente encontrei um programa que se adapta ao meu estilo de vida. Ganhei massa muscular e força de forma consistente e segura.',
    imagemAntes: '/images/onboarding/Rodrigo.png',
    imagemDepois: '/images/onboarding/Rodrigo.png'
  }
]

export default function Cadastro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null)
  const [depoimentoAtual, setDepoimentoAtual] = useState(0)
  
  const { setUserFromResponse } = useAuth()
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  })

  useEffect(() => {
    // Carregar dados do onboarding do localStorage
    const data = localStorage.getItem('onboardingData')
    if (!data) {
      // Se não tem dados, voltar para landing
      navigate('/')
      return
    }
    setOnboardingData(JSON.parse(data))
  }, [navigate])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (!formData.nomeCompleto.trim()) {
      setError('Nome completo é obrigatório')
      return
    }

    if (!formData.email.trim()) {
      setError('E-mail é obrigatório')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('E-mail inválido')
      return
    }

    if (!formData.telefone || formData.telefone.replace(/\D/g, '').length < 10) {
      setError('Telefone inválido')
      return
    }

    if (!formData.senha || formData.senha.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      // Criar usuário com cadastro pré-pagamento
      const response = await api.post('/auth/cadastro-pre-pagamento', {
        nome: formData.nomeCompleto,
        telefone: formData.telefone,
        email: formData.email,
        senha: formData.senha,
        onboarding: onboardingData,
      })

      // Verificar se a resposta contém todos os dados necessários
      if (!response.data) {
        throw new Error('Resposta do servidor inválida')
      }

      const { accessToken, refreshToken, user } = response.data

      if (!accessToken || !refreshToken || !user) {
        throw new Error('Dados incompletos na resposta do servidor')
      }

      // Atualizar contexto de autenticação diretamente com os dados do endpoint
      setUserFromResponse(user, accessToken, refreshToken)

      // Limpar dados do onboarding do localStorage
      localStorage.removeItem('onboardingData')

      // Redirecionar para checkout
      navigate('/checkout')
    } catch (err: any) {
      console.error('Erro no cadastro:', err)
      
      // Tratamento específico de erros
      let errorMessage = 'Erro ao realizar cadastro'
      
      if (err.response) {
        // Erro da API
        if (err.response.status === 400) {
          errorMessage = err.response.data?.error || 'Dados inválidos. Verifique as informações e tente novamente.'
        } else if (err.response.status === 409 || err.response.data?.error?.includes('já cadastrado')) {
          errorMessage = 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.'
        } else if (err.response.status >= 500) {
          errorMessage = 'Erro no servidor. Tente novamente em alguns instantes.'
        } else {
          errorMessage = err.response.data?.error || err.response.data?.message || errorMessage
        }
      } else if (err.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
      } else if (err.message) {
        // Erro de validação local
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!onboardingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calcular idade a partir da data de nascimento
  const calcularIdade = () => {
    if (!onboardingData?.dataNascimento) return null
    
    try {
      // Converter DD / MM / AAAA para Date
      const partes = onboardingData.dataNascimento.replace(/\s/g, '').split('/')
      if (partes.length !== 3) return null
      
      const dia = parseInt(partes[0], 10)
      const mes = parseInt(partes[1], 10) - 1 // Meses são 0-indexed
      const ano = parseInt(partes[2], 10)
      
      if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return null
      
      const dataNascimento = new Date(ano, mes, dia)
      const hoje = new Date()
      
      let idade = hoje.getFullYear() - dataNascimento.getFullYear()
      const mesAtual = hoje.getMonth()
      const diaAtual = hoje.getDate()
      
      if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) {
        idade--
      }
      
      return idade
    } catch (error) {
      return null
    }
  }

  // Função para gerar resumo do onboarding
  const gerarResumo = () => {
    if (!onboardingData) return null

    const resumo = []
    
    // Não incluir nome e data de nascimento aqui pois já estão destacados acima
    // Usar idade calculada se disponível, senão usar a idade do onboarding
    const idadeParaResumo = calcularIdade() || onboardingData.idade
    if (idadeParaResumo) resumo.push({ label: 'Idade', value: `${idadeParaResumo} anos` })
    if (onboardingData.sexo) resumo.push({ label: 'Sexo', value: onboardingData.sexo })
    if (onboardingData.altura) resumo.push({ label: 'Altura', value: `${onboardingData.altura} cm` })
    if (onboardingData.pesoAtual) resumo.push({ label: 'Peso', value: `${onboardingData.pesoAtual} kg` })
    if (onboardingData.tipoCorpo) resumo.push({ label: 'Tipo de Corpo', value: onboardingData.tipoCorpo })
    if (onboardingData.aguaDiaria) resumo.push({ label: 'Consumo de Água', value: onboardingData.aguaDiaria })
    if (onboardingData.experiencia) resumo.push({ label: 'Nível', value: onboardingData.experiencia })
    if (onboardingData.objetivo) resumo.push({ label: 'Objetivo', value: onboardingData.objetivo })
    if (onboardingData.frequenciaSemanal) resumo.push({ label: 'Frequência', value: `${onboardingData.frequenciaSemanal}x por semana` })
    if (onboardingData.tempoDisponivel) resumo.push({ label: 'Duração do Treino', value: `${onboardingData.tempoDisponivel} minutos` })
    if (onboardingData.localTreino) resumo.push({ label: 'Local do Treino', value: onboardingData.localTreino })
    if (onboardingData.problemasAnteriores && onboardingData.problemasAnteriores.length > 0) {
      resumo.push({ label: 'Problemas Anteriores', value: onboardingData.problemasAnteriores.join(', ') })
    }
    if (onboardingData.objetivosAdicionais && onboardingData.objetivosAdicionais.length > 0) {
      resumo.push({ label: 'Objetivos Adicionais', value: onboardingData.objetivosAdicionais.join(', ') })
    }
    if (onboardingData.lesoes && onboardingData.lesoes.length > 0) {
      resumo.push({ label: 'Limitações', value: onboardingData.lesoes.join(', ') })
    }

    return resumo
  }

  const idadeCalculada = calcularIdade()
  // const resumo = gerarResumo() // Não utilizado

  // Calcular IMC
  const calcularIMC = () => {
    if (onboardingData?.pesoAtual && onboardingData?.altura) {
      const peso = Number(onboardingData.pesoAtual)
      const altura = Number(onboardingData.altura)
      if (isNaN(peso) || isNaN(altura) || altura === 0) return null
      const alturaMetros = altura / 100
      return (peso / (alturaMetros * alturaMetros)).toFixed(1)
    }
    return null
  }

  const imc = calcularIMC()
  const classificacaoIMC = imc ? 
    parseFloat(imc) < 18.5 ? 'Abaixo do peso' :
    parseFloat(imc) < 25 ? 'Peso normal' :
    parseFloat(imc) < 30 ? 'Sobrepeso' : 'Obesidade'
    : null

  // Validação cruzada entre tipoCorpo e IMC
  const validarConsistencia = () => {
    if (!onboardingData?.tipoCorpo || !imc) return null
    
    const imcValue = parseFloat(imc)
    const tipoCorpo = onboardingData.tipoCorpo
    const isFeminino = onboardingData.sexo === 'Feminino'
    
    // Mapear tipoCorpo para faixa de IMC esperada
    let imcEsperadoMin = 0
    let imcEsperadoMax = 0
    
    if (isFeminino) {
      if (tipoCorpo === 'Em Forma') {
        imcEsperadoMin = 18.5
        imcEsperadoMax = 24.9
      } else if (tipoCorpo === 'Sobrepeso') {
        imcEsperadoMin = 25
        imcEsperadoMax = 29.9
      } else if (tipoCorpo === 'Acima do Peso') {
        imcEsperadoMin = 25
        imcEsperadoMax = 29.9
      } else if (tipoCorpo === 'Obesidade') {
        imcEsperadoMin = 30
        imcEsperadoMax = 50
      }
    } else {
      if (tipoCorpo === 'Ectomorfo') {
        imcEsperadoMin = 18.5
        imcEsperadoMax = 24.9
      } else if (tipoCorpo === 'Mesomorfo') {
        imcEsperadoMin = 20
        imcEsperadoMax = 27
      } else if (tipoCorpo === 'Endomorfo') {
        imcEsperadoMin = 25
        imcEsperadoMax = 29.9
      } else if (tipoCorpo === 'Obesidade') {
        imcEsperadoMin = 30
        imcEsperadoMax = 50
      }
    }
    
    // Verificar se IMC está dentro da faixa esperada (com margem de tolerância)
    const dentroDaFaixa = imcValue >= (imcEsperadoMin - 2) && imcValue <= (imcEsperadoMax + 2)
    
    return {
      consistente: dentroDaFaixa,
      tipoCorpo,
      imcCalculado: imcValue,
      faixaEsperada: `${imcEsperadoMin.toFixed(1)} - ${imcEsperadoMax.toFixed(1)}`
    }
  }

  const validacao = validarConsistencia()

  // Calcular calorias recomendadas (aproximado)
  const calcularCalorias = () => {
    if (!onboardingData?.pesoAtual || !onboardingData?.altura || !onboardingData?.idade) return null
    
    const peso = Number(onboardingData.pesoAtual)
    const altura = Number(onboardingData.altura)
    const idade = Number(onboardingData.idade)
    
    if (isNaN(peso) || isNaN(altura) || isNaN(idade)) return null
    
    // Fórmula simplificada: TMB = 10 * peso + 6.25 * altura - 5 * idade + 5 (homem) ou -161 (mulher)
    const tmb = onboardingData.sexo === 'Masculino' 
      ? 10 * peso + 6.25 * altura - 5 * idade + 5
      : 10 * peso + 6.25 * altura - 5 * idade - 161
    
    // Multiplicador de atividade (sedentário = 1.2, leve = 1.375, moderado = 1.55)
    const multiplicador = onboardingData.frequenciaSemanal ? 
      onboardingData.frequenciaSemanal <= 2 ? 1.2 :
      onboardingData.frequenciaSemanal <= 4 ? 1.375 : 1.55
      : 1.2
    
    return Math.round(tmb * multiplicador)
  }

  const calorias = calcularCalorias()

  // Calcular água recomendada
  const calcularAgua = () => {
    if (!onboardingData?.pesoAtual) return null
    const peso = Number(onboardingData.pesoAtual)
    if (isNaN(peso)) return null
    // 35ml por kg de peso
    return (peso * 35 / 1000).toFixed(1)
  }

  const agua = calcularAgua()

  // Funções para transformação (homens e mulheres)
  const calcularTransformacao = () => {
    if (!onboardingData) return null
    if (!onboardingData.sexo) return null

    const isMasculino = onboardingData.sexo === 'Masculino'
    const isFeminino = onboardingData.sexo === 'Feminino'

    // Determinar imagem atual baseada no tipo de corpo ou IMC
    const getImagemAtual = () => {
      // Priorizar tipoCorpo quando disponível, usar IMC como fallback
      const tipoCorpo = onboardingData.tipoCorpo
      
      if (isMasculino) {
        // Homens - valores do onboarding: Ectomorfo, Mesomorfo, Endomorfo, Obesidade
        if (tipoCorpo === 'Ectomorfo') {
          return '/images/onboarding/magro.webp'
        } else if (tipoCorpo === 'Mesomorfo') {
          return '/images/onboarding/sobrepeso.webp'
        } else if (tipoCorpo === 'Endomorfo') {
          return '/images/onboarding/acima_do_peso.webp'
        } else if (tipoCorpo === 'Obesidade') {
          return '/images/onboarding/obeso.webp'
        }
        // Fallback para IMC se tipoCorpo não estiver disponível
        if (imc) {
          const imcValue = parseFloat(imc)
          if (imcValue < 18.5) return '/images/onboarding/magro.webp'
          else if (imcValue < 25) return '/images/onboarding/sobrepeso.webp'
          else if (imcValue < 30) return '/images/onboarding/acima_do_peso.webp'
          else return '/images/onboarding/obeso.webp'
        }
        return '/images/onboarding/sobrepeso.webp' // default
      } else if (isFeminino) {
        // Mulheres - valores do onboarding: "Em Forma", "Sobrepeso", "Acima do Peso", "Obesidade"
        if (tipoCorpo === 'Em Forma') {
          return '/images/onboarding/Em_forma.png'
        } else if (tipoCorpo === 'Sobrepeso') {
          return '/images/onboarding/Sobrepeso.png'
        } else if (tipoCorpo === 'Acima do Peso') {
          return '/images/onboarding/Acima do peso.png'
        } else if (tipoCorpo === 'Obesidade') {
          return '/images/onboarding/Obesidade.png'
        }
        // Fallback para IMC se tipoCorpo não estiver disponível
        if (imc) {
          const imcValue = parseFloat(imc)
          if (imcValue < 18.5) return '/images/onboarding/Em_forma.png'
          else if (imcValue < 25) return '/images/onboarding/Sobrepeso.png'
          else if (imcValue < 30) return '/images/onboarding/Acima do peso.png'
          else return '/images/onboarding/Obesidade.png'
        }
        return '/images/onboarding/Sobrepeso.png' // default
      }
      return null
    }

    // Determinar imagem futura baseada no objetivo
    const getImagemFutura = () => {
      if (isMasculino) {
        // Homens
        if (onboardingData.objetivo === 'Emagrecimento') {
          return '/images/onboarding/perder_peso.webp'
        } else if (onboardingData.objetivo === 'Hipertrofia') {
          return '/images/onboarding/ganahr_massa.webp'
        } else if (onboardingData.objetivo === 'Força') {
          return '/images/onboarding/ficar_musculoso.webp'
        }
        return '/images/onboarding/ganahr_massa.webp' // default
      } else if (isFeminino) {
        // Mulheres
        if (onboardingData.objetivo === 'Emagrecimento') {
          return '/images/onboarding/Perder_peso.webp'
        } else if (onboardingData.objetivo === 'Hipertrofia') {
          return '/images/onboarding/Ganhar_massa_muscular.webp'
        } else if (onboardingData.objetivo === 'Força') {
          return '/images/onboarding/Ficar_musculosa.webp'
        }
        return '/images/onboarding/Ganhar_massa_muscular.webp' // default
      }
      return null
    }

    // Calcular métricas atuais com base em tipoCorpo (prioritário) ou IMC
    const getGorduraAtual = () => {
      const tipoCorpo = onboardingData.tipoCorpo
      const experiencia = onboardingData.experiencia || 'Iniciante'
      const frequencia = onboardingData.frequenciaSemanal || 0
      
      let gorduraMin = 0
      let gorduraMax = 0
      
      // Priorizar tipoCorpo quando disponível
      if (tipoCorpo) {
        if (isFeminino) {
          // Mulheres
          if (tipoCorpo === 'Em Forma') {
            gorduraMin = 18
            gorduraMax = 22
          } else if (tipoCorpo === 'Sobrepeso') {
            gorduraMin = 25
            gorduraMax = 30
          } else if (tipoCorpo === 'Acima do Peso') {
            gorduraMin = 30
            gorduraMax = 35
          } else if (tipoCorpo === 'Obesidade') {
            gorduraMin = 35
            gorduraMax = 40
          }
        } else {
          // Homens
          if (tipoCorpo === 'Ectomorfo') {
            gorduraMin = 12
            gorduraMax = 16
          } else if (tipoCorpo === 'Mesomorfo') {
            gorduraMin = 18
            gorduraMax = 22
          } else if (tipoCorpo === 'Endomorfo') {
            gorduraMin = 22
            gorduraMax = 27
          } else if (tipoCorpo === 'Obesidade') {
            gorduraMin = 27
            gorduraMax = 32
          }
        }
      }
      
      // Se não tem tipoCorpo, usar IMC como fallback
      if (!tipoCorpo && imc) {
        const imcValue = parseFloat(imc)
        if (isFeminino) {
          if (imcValue < 18.5) {
            gorduraMin = 18
            gorduraMax = 22
          } else if (imcValue < 25) {
            gorduraMin = 22
            gorduraMax = 27
          } else if (imcValue < 30) {
            gorduraMin = 28
            gorduraMax = 33
          } else {
            gorduraMin = 35
            gorduraMax = 40
          }
        } else {
          if (imcValue < 18.5) {
            gorduraMin = 10
            gorduraMax = 14
          } else if (imcValue < 25) {
            gorduraMin = 14
            gorduraMax = 18
          } else if (imcValue < 30) {
            gorduraMin = 20
            gorduraMax = 25
          } else {
            gorduraMin = 27
            gorduraMax = 32
          }
        }
      }
      
      // Se ainda não tem valores, usar padrão
      if (gorduraMin === 0 && gorduraMax === 0) {
        gorduraMin = isFeminino ? 22 : 18
        gorduraMax = isFeminino ? 25 : 22
      }
      
      // Ajuste fino baseado em experiência e frequência (pequeno ajuste)
      if (experiencia === 'Avançado') {
        gorduraMin = Math.max(isFeminino ? 16 : 8, gorduraMin - 1)
        gorduraMax = Math.max(isFeminino ? 16 : 8, gorduraMax - 1)
      } else if (experiencia === 'Intermediário') {
        gorduraMin = Math.max(isFeminino ? 16 : 8, gorduraMin - 0.5)
        gorduraMax = Math.max(isFeminino ? 16 : 8, gorduraMax - 0.5)
      }
      
      if (frequencia >= 5) {
        gorduraMin = Math.max(isFeminino ? 16 : 8, gorduraMin - 1)
        gorduraMax = Math.max(isFeminino ? 16 : 8, gorduraMax - 1)
      } else if (frequencia >= 3) {
        gorduraMin = Math.max(isFeminino ? 16 : 8, gorduraMin - 0.5)
        gorduraMax = Math.max(isFeminino ? 16 : 8, gorduraMax - 0.5)
      }
      
      // Garantir limites mínimos realistas
      gorduraMin = Math.max(isFeminino ? 16 : 8, Math.round(gorduraMin))
      gorduraMax = Math.max(gorduraMin + 1, Math.round(gorduraMax))
      
      return `${gorduraMin}-${gorduraMax}%`
    }

    const getGorduraFutura = () => {
      const gorduraAtualStr = getGorduraAtual()
      const gorduraAtualMin = parseFloat(gorduraAtualStr.split('-')[0])
      const gorduraAtualMax = parseFloat(gorduraAtualStr.split('-')[1].replace('%', ''))
      const gorduraAtualMedia = gorduraAtualMin + (gorduraAtualMax - gorduraAtualMin) / 2
      
      const objetivo = onboardingData.objetivo
      const experiencia = onboardingData.experiencia || 'Iniciante'
      const frequencia = onboardingData.frequenciaSemanal || 0
      
      // Redução realista em 6 meses: 0.5-1% por mês (3-6% total)
      // Valores mais conservadores e realistas
      let reducaoPercentual = 0
      
      if (objetivo === 'Emagrecimento') {
        // Emagrecimento: maior redução (4-6% em 6 meses)
        reducaoPercentual = 4 + (frequencia >= 4 ? 1.5 : frequencia >= 3 ? 0.5 : 0)
        if (experiencia === 'Iniciante') reducaoPercentual += 0.5 // Iniciantes podem perder um pouco mais
      } else if (objetivo === 'Hipertrofia') {
        // Hipertrofia: menor redução, foco em ganho de massa (2-3.5% em 6 meses)
        reducaoPercentual = 2 + (frequencia >= 4 ? 1 : frequencia >= 3 ? 0.5 : 0)
      } else if (objetivo === 'Força') {
        // Força: redução moderada (3-4.5% em 6 meses)
        reducaoPercentual = 3 + (frequencia >= 4 ? 1 : frequencia >= 3 ? 0.5 : 0)
      } else {
        reducaoPercentual = 3 // Padrão conservador
      }
      
      // Limitar redução máxima realista (não mais que 6% em 6 meses)
      reducaoPercentual = Math.min(6, reducaoPercentual)
      
      const gorduraFuturaMedia = Math.max(
        isFeminino ? 16 : 8, // Mínimo realista
        gorduraAtualMedia - reducaoPercentual
      )
      
      // Criar faixa realista (1-2% de variação)
      const gorduraMin = Math.max(isFeminino ? 16 : 8, Math.round(gorduraFuturaMedia - 1))
      const gorduraMax = Math.round(gorduraFuturaMedia + 1)
      
      return `${gorduraMin}-${gorduraMax}%`
    }

    // Calcular idade de condicionamento físico (mais preciso)
    const getIdadeCondicionamentoAtual = () => {
      if (!onboardingData.idade) return 35
      
      const idade = onboardingData.idade
      const experiencia = onboardingData.experiencia || 'Iniciante'
      const frequencia = onboardingData.frequenciaSemanal || 0
      let idadeCondicionamento = idade
      
      // Ajuste baseado em IMC
      if (imc) {
        const imcValue = parseFloat(imc)
        if (imcValue >= 30) idadeCondicionamento += 6
        else if (imcValue >= 25) idadeCondicionamento += 3
        else if (imcValue < 18.5) idadeCondicionamento += 1
      }
      
      // Ajuste baseado em experiência
      if (experiencia === 'Avançado') idadeCondicionamento -= 3
      else if (experiencia === 'Intermediário') idadeCondicionamento -= 1
      else idadeCondicionamento += 2
      
      // Ajuste baseado em frequência de treino
      if (frequencia >= 5) idadeCondicionamento -= 2
      else if (frequencia >= 3) idadeCondicionamento -= 1
      else if (frequencia < 2) idadeCondicionamento += 1
      
      return Math.max(idade - 5, Math.min(idade + 10, idadeCondicionamento))
    }

    const getIdadeCondicionamentoFutura = () => {
      const idadeAtual = getIdadeCondicionamentoAtual()
      const idadeReal = onboardingData.idade || 30
      const objetivo = onboardingData.objetivo
      const frequencia = onboardingData.frequenciaSemanal || 0
      const experiencia = onboardingData.experiencia || 'Iniciante'
      
      // Melhoria realista em 6 meses: 2-4 anos (não mais que isso)
      // Valores mais conservadores
      let melhoria = 0
      
      if (objetivo === 'Emagrecimento') {
        melhoria = 2 + (frequencia >= 4 ? 1 : frequencia >= 3 ? 0.5 : 0)
      } else if (objetivo === 'Hipertrofia' || objetivo === 'Força') {
        melhoria = 2.5 + (frequencia >= 4 ? 1.5 : frequencia >= 3 ? 0.5 : 0)
      } else {
        melhoria = 2
      }
      
      // Ajuste baseado em experiência (iniciantes melhoram mais rápido)
      if (experiencia === 'Iniciante') melhoria += 0.5
      else if (experiencia === 'Avançado') melhoria -= 0.5 // Avançados melhoram mais devagar
      
      // Limitar melhoria máxima (não mais que 4 anos em 6 meses)
      melhoria = Math.min(4, melhoria)
      
      const idadeFutura = idadeAtual - melhoria
      
      // Não pode ser menor que a idade real - 8 anos (limite realista)
      return Math.max(idadeReal - 8, Math.round(idadeFutura))
    }

    // Calcular nível de músculos (1-5) baseado em tipoCorpo, experiência e frequência
    const getMusculosAtual = () => {
      const tipoCorpo = onboardingData.tipoCorpo
      const experiencia = onboardingData.experiencia || 'Iniciante'
      const frequencia = onboardingData.frequenciaSemanal || 0
      
      let nivel = 2 // Base padrão
      
      // Baseado em tipoCorpo (prioritário)
      if (tipoCorpo) {
        if (isFeminino) {
          if (tipoCorpo === 'Em Forma') nivel = 3
          else if (tipoCorpo === 'Sobrepeso') nivel = 2
          else if (tipoCorpo === 'Acima do Peso') nivel = 1.5
          else if (tipoCorpo === 'Obesidade') nivel = 1
        } else {
          if (tipoCorpo === 'Ectomorfo') nivel = 2
          else if (tipoCorpo === 'Mesomorfo') nivel = 3
          else if (tipoCorpo === 'Endomorfo') nivel = 2.5
          else if (tipoCorpo === 'Obesidade') nivel = 1.5
        }
      } else if (imc) {
        // Fallback para IMC
        const imcValue = parseFloat(imc)
        if (imcValue >= 18.5 && imcValue < 25) nivel = 2.5
        else if (imcValue < 18.5) nivel = 2
        else if (imcValue >= 25 && imcValue < 30) nivel = 2
        else nivel = 1.5
      }
      
      // Ajuste baseado em experiência
      if (experiencia === 'Avançado') nivel += 1
      else if (experiencia === 'Intermediário') nivel += 0.5
      else nivel += 0 // Iniciante mantém o nível base
      
      // Ajuste baseado em frequência
      if (frequencia >= 5) nivel += 0.5
      else if (frequencia >= 3) nivel += 0.3
      
      return Math.min(5, Math.max(1, Math.round(nivel)))
    }

    const getMusculosFuturo = () => {
      const musculosAtual = getMusculosAtual()
      const objetivo = onboardingData.objetivo
      const experiencia = onboardingData.experiencia || 'Iniciante'
      const frequencia = onboardingData.frequenciaSemanal || 0
      
      // Ganho realista em 6 meses baseado em experiência
      // Iniciantes ganham mais rápido, avançados mais devagar
      let ganho = 0
      
      if (objetivo === 'Emagrecimento') {
        // Durante emagrecimento, ganho moderado (0.5-1 nível)
        ganho = experiencia === 'Iniciante' ? 1 : experiencia === 'Intermediário' ? 0.7 : 0.5
      } else if (objetivo === 'Hipertrofia') {
        // Hipertrofia: maior ganho (0.7-1.5 nível)
        ganho = experiencia === 'Iniciante' ? 1.5 : experiencia === 'Intermediário' ? 1 : 0.7
      } else if (objetivo === 'Força') {
        // Força: ganho similar à hipertrofia (0.7-1.5 nível)
        ganho = experiencia === 'Iniciante' ? 1.5 : experiencia === 'Intermediário' ? 1 : 0.7
      } else {
        ganho = experiencia === 'Iniciante' ? 1 : 0.7
      }
      
      // Ajuste baseado em frequência (pequeno ajuste)
      if (frequencia >= 5) ganho += 0.3
      else if (frequencia >= 3) ganho += 0.2
      
      // Limitar ganho máximo realista (não mais que 2 níveis em 6 meses)
      ganho = Math.min(2, ganho)
      
      const musculosFuturo = musculosAtual + ganho
      
      return Math.min(5, Math.max(1, Math.round(musculosFuturo)))
    }

    return {
      imagemAtual: getImagemAtual(),
      imagemFutura: getImagemFutura(),
      gorduraAtual: getGorduraAtual(),
      gorduraFutura: getGorduraFutura(),
      idadeAtual: getIdadeCondicionamentoAtual(),
      idadeFutura: getIdadeCondicionamentoFutura(),
      musculosAtual: getMusculosAtual(),
      musculosFuturo: getMusculosFuturo()
    }
  }

  const transformacao = calcularTransformacao()

  // Não renderizar até os dados estarem carregados
  if (!onboardingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-dark-lighter to-dark">
        <div className="text-light">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <div className="max-w-6xl mx-auto">
        {/* Header Impactante */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-light mb-4">
            O plano personalizado para você está pronto
          </h1>
          <p className="text-xl md:text-2xl text-light-muted">
            Seus treinos personalizados foram criados especialmente para você
          </p>
        </div>

        {/* ========== SEÇÃO 1: INFORMAÇÕES DO USUÁRIO ========== */}
        
        {/* Resumo Pessoal Baseado nas Respostas */}
        <div className="card p-6 md:p-8 mb-8 animate-scale-in">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-6 text-center">
            Resumo pessoal baseado em suas respostas
          </h2>
          
          {/* Nome e Data de Nascimento em Destaque */}
          {(onboardingData.nome || onboardingData.dataNascimento) && (
            <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {onboardingData.nome && (
                  <div>
                    <div className="text-sm text-light-muted mb-1">Nome</div>
                    <div className="text-xl font-bold text-primary">{onboardingData.nome}</div>
                  </div>
                )}
                {onboardingData.dataNascimento && (
                  <div>
                    <div className="text-sm text-light-muted mb-1">Data de Nascimento</div>
                    <div className="text-xl font-bold text-light">
                      {onboardingData.dataNascimento}
                      {idadeCalculada && (
                        <span className="text-primary ml-2">({idadeCalculada} anos)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* IMC */}
            {imc && (
              <div className="bg-dark-lighter rounded-xl p-6 border border-grey/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-light">Índice de Massa Corporal (IMC)</h3>
                  <div className="relative group">
                    <svg className="w-5 h-5 text-primary cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-dark border border-grey/50 rounded-lg text-xs text-light opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      O IMC é calculado dividindo seu peso (kg) pelo quadrado da sua altura (m). Baseado no seu tipo de corpo informado: <strong>{onboardingData.tipoCorpo || 'Não informado'}</strong>
                    </div>
                  </div>
                </div>
                <div className="text-4xl font-bold text-light mb-2">{imc}</div>
                <div className="text-sm text-light-muted mb-4">kg/m²</div>
                
                {/* Barra de IMC */}
                <div className="relative mb-4">
                  <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500"></div>
                  {imc && (() => {
                    const imcValue = parseFloat(imc)
                    const leftPosition = Math.min(100, Math.max(0, ((imcValue - 15) / 30) * 100))
                    return (
                      <div 
                        className="absolute top-0 h-3 w-1 bg-white shadow-lg"
                        style={{ left: `${leftPosition}%`, transform: 'translateX(-50%)' }}
                      ></div>
                    )
                  })()}
                </div>
                
                <div className="flex justify-between text-xs text-light-muted mb-3">
                  <span>Abaixo do peso</span>
                  <span>Normal</span>
                  <span>Sobrepeso</span>
                  <span>Obesidade</span>
                </div>
                
                <div className={`text-center font-bold text-lg mb-2 ${
                  classificacaoIMC === 'Peso normal' ? 'text-green-500' :
                  classificacaoIMC === 'Sobrepeso' ? 'text-orange-500' :
                  classificacaoIMC === 'Obesidade' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  {classificacaoIMC}
                </div>
                
                {onboardingData.tipoCorpo && (
                  <p className="text-xs text-light-muted text-center mb-2">
                    Tipo de corpo informado: <span className="text-primary font-semibold">{onboardingData.tipoCorpo}</span>
                  </p>
                )}
                
                {/* Aviso de validação cruzada */}
                {validacao && !validacao.consistente && (
                  <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="text-xs text-warning">
                        <strong>Nota:</strong> O IMC calculado ({validacao.imcCalculado.toFixed(1)}) está fora da faixa esperada para "{validacao.tipoCorpo}" (IMC esperado: {validacao.faixaEsperada}). Usamos o tipo de corpo informado como referência principal.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Calorias */}
            {calorias && (
              <div className="bg-dark-lighter rounded-xl p-6 border border-grey/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <h3 className="text-lg font-bold text-light">Calorias Diárias Recomendadas</h3>
                  </div>
                  <div className="relative group">
                    <svg className="w-5 h-5 text-primary cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-dark border border-grey/50 rounded-lg text-xs text-light opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      Calculado com base na sua Taxa Metabólica Basal (TMB) + nível de atividade física. Considera seu peso, altura, idade, sexo e frequência de treino.
                    </div>
                  </div>
                </div>
                <div className="text-4xl font-bold text-light mb-2">{calorias}</div>
                <div className="text-sm text-light-muted mb-4">kcal por dia</div>
                
                {/* Barra de progresso melhorada */}
                <div className="relative mb-3">
                  <div className="h-3 bg-grey/30 rounded-full overflow-hidden">
                    {calorias && (
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, ((calorias - 1000) / 4000) * 100))}%` }}
                      ></div>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-light-muted mt-2">
                    <span>1000</span>
                    <span>2500</span>
                    <span>4000</span>
                    <span>5000</span>
                  </div>
                </div>
                
                <p className="text-xs text-light-muted text-center">
                  Baseado em: TMB + atividade física ({onboardingData.frequenciaSemanal || 0}x/semana)
                </p>
              </div>
            )}

            {/* Água */}
            {agua && (
              <div className="bg-dark-lighter rounded-xl p-6 border border-grey/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <h3 className="text-lg font-bold text-light">Água Diária Recomendada</h3>
                  </div>
                  <div className="relative group">
                    <svg className="w-5 h-5 text-primary cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-dark border border-grey/50 rounded-lg text-xs text-light opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      Calculado com base no seu peso: 35ml por kg. Você informou que bebe: <strong>{onboardingData.aguaDiaria || 'Não informado'}</strong>
                    </div>
                  </div>
                </div>
                <div className="text-4xl font-bold text-light mb-2">{agua}</div>
                <div className="text-sm text-light-muted mb-4">litros por dia</div>
                
                {/* Barra de progresso de água */}
                <div className="relative mb-3">
                  <div className="h-3 bg-grey/30 rounded-full overflow-hidden">
                    {agua && (
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (parseFloat(agua) / 3.5) * 100)}%` }}
                      ></div>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-light-muted mt-2">
                    <span>0L</span>
                    <span>1.5L</span>
                    <span>3L</span>
                    <span>3.5L+</span>
                  </div>
                </div>
                
                {onboardingData.aguaDiaria && (
                  <p className="text-xs text-light-muted text-center">
                    Você informou: <span className="text-primary font-semibold">{onboardingData.aguaDiaria}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Transformação Antes e Depois do Usuário */}
        {transformacao && (
          <div className="card p-6 md:p-8 mb-8 animate-scale-in">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-8 text-center">
              Sua Transformação em 6 Meses
            </h2>

            {/* Imagens Antes e Depois */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-10">
              {/* Agora */}
              <div className="text-center flex-1 max-w-[280px]">
                <div className="text-base font-semibold text-light-muted mb-3 uppercase tracking-wide">Agora</div>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-dark-lighter border-2 border-grey/30 shadow-lg">
                  <img 
                    src={transformacao.imagemAtual || ''} 
                    alt="Estado atual"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/300x400/4A4946/F9A620?text=Agora`
                    }}
                  />
                </div>
              </div>

              {/* Seta - mais elegante */}
              <div className="flex items-center justify-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* 6 Meses */}
              <div className="text-center flex-1 max-w-[280px]">
                <div className="text-base font-semibold text-light-muted mb-3 uppercase tracking-wide">6 meses</div>
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-dark-lighter border-2 border-primary/50 shadow-lg">
                  <img 
                    src={transformacao.imagemFutura || ''} 
                    alt="Estado futuro"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/300x400/4A4946/F9A620?text=6+meses`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Métricas Comparativas - Design mais limpo */}
            <div className="grid grid-cols-2 gap-8 border-t border-grey/30 pt-8">
              {/* Coluna Agora */}
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-light-muted uppercase tracking-wide">Agora</h3>
                </div>
                
                <div className="bg-dark-lighter rounded-lg p-4 border border-grey/20">
                  <div className="text-xs text-light-muted mb-2 uppercase tracking-wide">Gordura corporal</div>
                  <div className="text-3xl font-bold text-light">{transformacao.gorduraAtual}</div>
                </div>

                <div className="bg-dark-lighter rounded-lg p-4 border border-grey/20">
                  <div className="text-xs text-light-muted mb-2 uppercase tracking-wide">Idade de condicionamento físico</div>
                  <div className="text-3xl font-bold text-light">{transformacao.idadeAtual} anos</div>
                </div>

                <div className="bg-dark-lighter rounded-lg p-4 border border-grey/20">
                  <div className="text-xs text-light-muted mb-3 uppercase tracking-wide">Músculos do corpo</div>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          i <= transformacao.musculosAtual ? 'bg-primary' : 'bg-grey/30'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Coluna 6 Meses */}
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-primary uppercase tracking-wide">6 meses</h3>
                </div>
                
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                  <div className="text-xs text-light-muted mb-2 uppercase tracking-wide">Gordura corporal</div>
                  <div className="text-3xl font-bold text-primary">{transformacao.gorduraFutura}</div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                  <div className="text-xs text-light-muted mb-2 uppercase tracking-wide">Idade de condicionamento físico</div>
                  <div className="text-3xl font-bold text-primary">{transformacao.idadeFutura} anos</div>
                </div>

                <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                  <div className="text-xs text-light-muted mb-3 uppercase tracking-wide">Músculos do corpo</div>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded ${
                          i <= transformacao.musculosFuturo ? 'bg-primary' : 'bg-grey/30'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 pt-6 border-t border-grey/30 text-center">
              <p className="text-xs text-light-muted leading-relaxed">
                *A imagem não pretende representar o usuário. Os resultados variam por pessoa e não são garantidos.
              </p>
            </div>
          </div>
        )}

        {/* ========== SEÇÃO 2: INFORMAÇÕES DE VENDA ========== */}
        
        {/* Plano Personalizado Pronto */}
        <div className="card p-6 md:p-8 mb-8 animate-scale-in">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-6 text-center">
            O que você recebe:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {onboardingData.tempoDisponivel && (
              <div className="bg-dark-lighter rounded-xl p-5 border border-grey/30 text-center">
                <svg className="w-8 h-8 text-primary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-light-muted mb-1">Duração do Treino</div>
                <div className="text-xl font-bold text-light">{onboardingData.tempoDisponivel} minutos</div>
              </div>
            )}
            
            {onboardingData.experiencia && (
              <div className="bg-dark-lighter rounded-xl p-5 border border-grey/30 text-center">
                <svg className="w-8 h-8 text-primary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="text-sm text-light-muted mb-1">Nível de Aptidão</div>
                <div className="text-xl font-bold text-light">{onboardingData.experiencia}</div>
              </div>
            )}
            
            {onboardingData.localTreino && (
              <div className="bg-dark-lighter rounded-xl p-5 border border-grey/30 text-center">
                <svg className="w-8 h-8 text-primary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="text-sm text-light-muted mb-1">Local para Treinar</div>
                <div className="text-xl font-bold text-light">{onboardingData.localTreino}</div>
              </div>
            )}
            
            {onboardingData.frequenciaSemanal && (
              <div className="bg-dark-lighter rounded-xl p-5 border border-grey/30 text-center">
                <svg className="w-8 h-8 text-primary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-sm text-light-muted mb-1">Frequência de Treino</div>
                <div className="text-xl font-bold text-light">{onboardingData.frequenciaSemanal}x por semana</div>
              </div>
            )}
          </div>

          {/* Benefícios */}
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-6">
            <h3 className="text-xl font-bold text-light mb-4 text-center">Benefícios do seu plano</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <span className="text-primary text-xl">✓</span>
                <span className="text-light">Programa de treino personalizado</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary text-xl">✓</span>
                <span className="text-light">Plano de treino claro e fácil de seguir</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary text-xl">✓</span>
                <span className="text-light">Acompanhamento e análise do progresso</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary text-xl">✓</span>
                <span className="text-light">Ajustes automáticos conforme você evolui</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Depoimentos - Resultados que nos deixam orgulhosos */}
        <div className="mb-12 animate-scale-in">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-8 text-center">
            Resultados que nos deixam orgulhosos
          </h2>
          
          <div className="card p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Imagem Antes e Depois */}
              <div className="flex-1 max-w-md">
                <div className="relative rounded-lg overflow-hidden bg-dark-lighter shadow-lg">
                  <img 
                    src={DEPOIMENTOS[depoimentoAtual].imagemAntes}
                    alt={`Transformação de ${DEPOIMENTOS[depoimentoAtual].nome}`}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://via.placeholder.com/600x800/4A4946/F9A620?text=Transformação`
                    }}
                  />
                </div>
              </div>

              {/* Depoimento */}
              <div className="flex-1">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-light mb-1">
                    {DEPOIMENTOS[depoimentoAtual].nome}, {DEPOIMENTOS[depoimentoAtual].idade} anos
                  </h3>
                </div>
                <p className="text-light-muted text-lg leading-relaxed">
                  "{DEPOIMENTOS[depoimentoAtual].depoimento}"
                </p>
              </div>
            </div>

            {/* Navegação do Carrossel */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={() => setDepoimentoAtual((prev) => (prev === 0 ? DEPOIMENTOS.length - 1 : prev - 1))}
                className="w-10 h-10 rounded-full bg-dark-lighter border border-grey/30 text-light hover:bg-primary hover:text-dark transition-colors flex items-center justify-center"
                aria-label="Depoimento anterior"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Indicadores */}
              <div className="flex gap-2">
                {DEPOIMENTOS.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setDepoimentoAtual(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === depoimentoAtual ? 'bg-primary w-8' : 'bg-grey/30'
                    }`}
                    aria-label={`Ir para depoimento ${index + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setDepoimentoAtual((prev) => (prev === DEPOIMENTOS.length - 1 ? 0 : prev + 1))}
                className="w-10 h-10 rounded-full bg-dark-lighter border border-grey/30 text-light hover:bg-primary hover:text-dark transition-colors flex items-center justify-center"
                aria-label="Próximo depoimento"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Oferta Especial */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-2 border-primary/50 rounded-2xl p-6 md:p-8 mb-8 text-center animate-scale-in">
          <div className="inline-block bg-primary text-dark px-4 py-2 rounded-full text-sm font-bold mb-4 uppercase tracking-wide">
            Oferta Especial
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
            Desconto Especial no Plano Trimestral
          </h2>
          <p className="text-light-muted">
            Economize R$ 19,80 ao escolher o plano de 3 meses. Seus treinos personalizados aguardam por você.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda: Elementos de Conversão */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-8">
              {/* Garantia de Satisfação */}
              <div className="card p-6 bg-primary/10 border-2 border-primary/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-light">Garantia de 7 dias</h3>
                    <p className="text-xs text-light-muted">100% do seu dinheiro de volta</p>
                  </div>
                </div>
                <p className="text-sm text-light-muted leading-relaxed">
                  Não ficou satisfeito? Devolvemos 100% do seu investimento, sem perguntas.
                </p>
              </div>

              {/* Estatísticas de Sucesso */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-light mb-4">Resultados Comprovados</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">95%</div>
                      <div className="text-xs text-light-muted">Taxa de satisfação</div>
                    </div>
                    <svg className="w-8 h-8 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">10k+</div>
                      <div className="text-xs text-light-muted">Usuários ativos</div>
                    </div>
                    <svg className="w-8 h-8 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-primary">4.9/5</div>
                      <div className="text-xs text-light-muted">Avaliação média</div>
                    </div>
                    <svg className="w-8 h-8 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Benefícios Principais */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-light mb-4">O que você recebe</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-light text-sm mb-1">Treinos Personalizados</div>
                      <div className="text-xs text-light-muted">Criados por IA baseados no seu perfil</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-light text-sm mb-1">Acompanhamento Inteligente</div>
                      <div className="text-xs text-light-muted">Ajustes automáticos conforme seu progresso</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-light text-sm mb-1">Acesso Imediato</div>
                      <div className="text-xs text-light-muted">Comece seus treinos hoje mesmo</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-light text-sm mb-1">Suporte Dedicado</div>
                      <div className="text-xs text-light-muted">Equipe pronta para ajudar você</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diferencial Competitivo */}
              <div className="card p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-lg font-bold text-light">Por que escolher o AthletIA?</h3>
                </div>
                <ul className="space-y-2 text-sm text-light-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Único sistema com IA que se adapta ao seu progresso em tempo real</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Treinos criados por especialistas e otimizados por algoritmos avançados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Resultados comprovados em milhares de usuários</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Formulário e Planos */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-error/20 border border-error/50 text-error px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Formulário de Cadastro */}
              <div className="card p-6 md:p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-light mb-2">
                    Crie sua Conta
                  </h2>
                  <p className="text-light-muted">
                    Preencha seus dados para continuar
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Nome Completo */}
                  <div>
                    <label className="label-field text-sm">Nome Completo *</label>
                    <input
                      type="text"
                      value={formData.nomeCompleto}
                      onChange={(e) => handleChange('nomeCompleto', e.target.value)}
                      className="input-field"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="label-field text-sm">Telefone *</label>
                    <InputMask
                      mask="(99) 99999-9999"
                      value={formData.telefone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('telefone', e.target.value)}
                    >
                      {(inputProps: any) => (
                        <input
                          {...inputProps}
                          type="tel"
                          className="input-field"
                          placeholder="(00) 00000-0000"
                          required
                        />
                      )}
                    </InputMask>
                    <p className="text-xs text-light-muted mt-1">
                      Você receberá notificações importantes neste número
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="label-field text-sm">E-mail *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="input-field"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  {/* Senha */}
                  <div>
                    <label className="label-field text-sm">Senha *</label>
                    <input
                      type="password"
                      value={formData.senha}
                      onChange={(e) => handleChange('senha', e.target.value)}
                      className="input-field"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-light-muted mt-1">
                      Mínimo de 6 caracteres
                    </p>
                  </div>

                  {/* Confirmar Senha */}
                  <div>
                    <label className="label-field text-sm">Confirmar Senha *</label>
                    <input
                      type="password"
                      value={formData.confirmarSenha}
                      onChange={(e) => handleChange('confirmarSenha', e.target.value)}
                      className="input-field"
                      placeholder="Digite a senha novamente"
                      required
                      minLength={6}
                    />
                    {formData.senha && formData.confirmarSenha && formData.senha !== formData.confirmarSenha && (
                      <p className="text-error text-xs mt-1">As senhas não coincidem</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Botão de Ação Principal */}
              <div className="space-y-4">
                <button
                  type="submit"
                  className="btn-primary text-xl px-8 py-5 font-bold w-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner h-5 w-5"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <span>Criar Minha Conta e Ver Planos</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="btn-secondary w-full"
                >
                  ← Voltar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

