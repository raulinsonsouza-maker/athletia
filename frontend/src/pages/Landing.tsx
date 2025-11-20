import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function Landing() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    lesoes: [],
    preferencias: [],
    problemasAnteriores: [],
    objetivosAdicionais: []
  })

  const handleChange = (field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }))
  }

  // Função para escolhas únicas que avança automaticamente
  const handleChangeAndAdvance = (field: keyof OnboardingData, value: any) => {
    handleChange(field, value)
    // Aguarda um delay para dar feedback visual antes de avançar
    // O delay permite que o usuário veja a seleção antes da transição
    setTimeout(() => {
      nextStep()
    }, 400)
  }

  const handleArrayChange = (field: 'lesoes' | 'equipamentos' | 'preferencias', value: string) => {
    setOnboardingData(prev => {
      const current = prev[field] || []
      const index = current.indexOf(value)
      if (index > -1) {
        return { ...prev, [field]: current.filter(item => item !== value) }
      } else {
        return { ...prev, [field]: [...current, value] }
      }
    })
  }

  const nextStep = () => {
    // Após altura (step 4), ir para peso (4.5)
    if (step === 4 && onboardingData.altura) {
      setStep(4.5)
    }
    // Após peso (step 4.5), ir para água (5)
    else if (step === 4.5) {
      setStep(5)
    }
    // Após selecionar água (step 5), ir para feedback (5.5)
    else if (step === 5 && onboardingData.aguaDiaria) {
      setStep(5.5)
    }
    // Após feedback água (step 5.5), ir para objetivo (6)
    else if (step === 5.5) {
      setStep(6)
    }
    // Após selecionar experiência (step 7), ir para feedback (7.5)
    else if (step === 7 && onboardingData.experiencia) {
      setStep(7.5)
    }
    // Após feedback experiência (step 7.5), ir para frequência (8)
    else if (step === 7.5) {
      setStep(8)
    }
    // Demais passos seguem normalmente
    else if (step < 15) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    // Se estiver no peso (4.5), voltar para altura (4)
    if (step === 4.5) {
      setStep(4)
    }
    // Se estiver na água (5), voltar para peso (4.5)
    else if (step === 5) {
      setStep(4.5)
    }
    // Se estiver no feedback água (5.5), voltar para água (5)
    else if (step === 5.5) {
      setStep(5)
    }
    // Se estiver no objetivo (6), voltar para feedback água (5.5)
    else if (step === 6) {
      setStep(5.5)
    }
    // Se estiver na experiência (7), voltar para objetivo (6)
    else if (step === 7) {
      setStep(6)
    }
    // Se estiver no feedback experiência (7.5), voltar para experiência (7)
    else if (step === 7.5) {
      setStep(7)
    }
    // Se estiver na frequência (8), voltar para feedback experiência (7.5)
    else if (step === 8) {
      setStep(7.5)
    }
    // Se estiver no tempo (9), voltar para frequência (8)
    else if (step === 9) {
      setStep(8)
    }
    // Se estiver no local do treino (10), voltar para tempo (9)
    else if (step === 10) {
      setStep(9)
    }
    // Se estiver nos problemas anteriores (11), voltar para local do treino (10)
    else if (step === 11) {
      setStep(10)
    }
    // Se estiver nos objetivos adicionais (12), voltar para problemas anteriores (11)
    else if (step === 12) {
      setStep(11)
    }
    // Se estiver nas limitações (13), voltar para objetivos adicionais (12)
    else if (step === 13) {
      setStep(12)
    }
    // Se estiver no nome (14), voltar para limitações (13)
    else if (step === 14) {
      setStep(13)
    }
    // Se estiver na data de nascimento (15), voltar para nome (14)
    else if (step === 15) {
      setStep(14)
    }
    // Demais passos seguem normalmente
    else if (step > 0) {
      setStep(step - 1)
    }
  }

  const finalizarOnboarding = () => {
    localStorage.setItem('onboardingData', JSON.stringify(onboardingData))
    navigate('/cadastro')
  }

  // Total de passos: 0 (hero) + 1-3 + 4 + 4.5 + 5 + 5.5 + 6-7 + 7.5 + 8-15 = 18 passos totais
  // Mas para progresso, consideramos apenas os passos do questionário (1-15, incluindo intermediários)
  // Passos: 1, 2, 3, 4, 4.5, 5, 5.5, 6, 7, 7.5, 8, 9, 10, 11, 12, 13, 14, 15 = 18 passos
  const totalSteps = 18
  // Calcular progresso considerando passos intermediários
  const getStepNumber = (currentStep: number): number => {
    if (currentStep === 0) return 0
    if (currentStep === 4.5) return 5
    if (currentStep === 5.5) return 7
    if (currentStep === 7.5) return 10
    return currentStep
  }
  const progress = step > 0 ? (getStepNumber(step) / totalSteps) * 100 : 0

  // Função para calcular análise de água
  const calcularAnaliseAgua = () => {
    const agua = onboardingData.aguaDiaria
    if (!agua) return null

    // Padrão de consumo baseado em dados médios
    // Distribuição estimada de usuários:
    // Menos de 2 copos: 15% (baixo)
    // 2-6 copos: 35% (abaixo do ideal)
    // 7-10 copos: 40% (ideal) - recomendado
    // Mais de 10 copos: 8% (excelente)
    // Apenas café/chá: 2% (muito baixo)

    const analises: Record<string, { 
      porcentagem: number, 
      status: 'excelente' | 'bom' | 'regular' | 'baixo' | 'muito_baixo',
      mensagem: string,
      recomendacao: string,
      cor: string
    }> = {
      'Menos de 2 copos': {
        porcentagem: 15,
        status: 'muito_baixo',
        mensagem: 'Você bebe menos água do que 85% dos usuários*',
        recomendacao: 'Sua hidratação está muito abaixo do recomendado. Tente aumentar gradualmente para 7-10 copos por dia.',
        cor: 'error'
      },
      '2-6 copos': {
        porcentagem: 35,
        status: 'baixo',
        mensagem: 'Você bebe menos água do que 65% dos usuários*',
        recomendacao: 'Sua hidratação está abaixo do ideal. O recomendado é 7-10 copos por dia para melhor desempenho.',
        cor: 'warning'
      },
      '7-10 copos': {
        porcentagem: 40,
        status: 'bom',
        mensagem: 'Você bebe mais água do que 60% dos usuários*',
        recomendacao: 'Parabéns! Você está no nível ideal de hidratação. Continue assim para manter seu desempenho.',
        cor: 'success'
      },
      'Mais de 10 copos': {
        porcentagem: 8,
        status: 'excelente',
        mensagem: 'Uau! Impressionante! Você bebe mais água do que 92% dos usuários*',
        recomendacao: 'Excelente! Você está muito bem hidratado. Continue mantendo esse hábito saudável.',
        cor: 'success'
      },
      'Bebo apenas café ou chá': {
        porcentagem: 2,
        status: 'muito_baixo',
        mensagem: 'Você bebe menos água do que 98% dos usuários*',
        recomendacao: 'Café e chá não substituem água pura. Tente adicionar pelo menos 4-6 copos de água por dia.',
        cor: 'error'
      }
    }

    return analises[agua] || null
  }

  // Função para calcular análise de condicionamento físico
  const calcularAnaliseCondicionamento = () => {
    const experiencia = onboardingData.experiencia
    if (!experiencia) return null

    // Padrão de condicionamento baseado em dados médios
    // Distribuição estimada de usuários:
    // Iniciante: 45% (maioria)
    // Intermediário: 40% (segunda maior)
    // Avançado: 15% (menor grupo)

    const analises: Record<string, { 
      porcentagem: number, 
      status: 'excelente' | 'bom' | 'regular' | 'baixo',
      mensagem: string,
      recomendacao: string,
      cor: string
    }> = {
      'Iniciante': {
        porcentagem: 45,
        status: 'regular',
        mensagem: 'Você está no mesmo nível de 45% dos usuários*',
        recomendacao: 'Perfeito! Vamos começar do básico e construir sua base de forma segura. Cada treino te levará mais longe.',
        cor: 'success'
      },
      'Intermediário': {
        porcentagem: 40,
        status: 'regular',
        mensagem: 'Você está no mesmo nível de 40% dos usuários*',
        recomendacao: 'Ótimo! Você já tem uma base. Vamos intensificar gradualmente e alcançar novos patamares.',
        cor: 'success'
      },
      'Avançado': {
        porcentagem: 15,
        status: 'excelente',
        mensagem: 'Uau! Impressionante! Você está no mesmo nível de apenas 15% dos usuários*',
        recomendacao: 'Excelente! Você está em ótima forma. Vamos criar treinos desafiadores para manter e superar seu nível atual.',
        cor: 'success'
      }
    }

    return analises[experiencia] || null
  }

  // Conteúdo personalizado por gênero
  const getGenderContent = () => {
    const isMasculino = onboardingData.sexo === 'Masculino'
    
    return {
      // Tipo de corpo personalizado
      tipoCorpo: {
        title: isMasculino
          ? 'Qual é o seu tipo de corpo atual?'
          : 'Como você descreveria seu corpo atual?',
        subtitle: isMasculino
          ? 'Homens têm diferentes biotipos que respondem de forma única aos treinos'
          : 'Cada tipo de corpo precisa de estratégias diferentes para alcançar seus objetivos',
        desc: isMasculino
          ? 'Identificar seu biotipo ajuda a criar treinos que maximizam ganho de massa e força'
          : 'Treinos personalizados para seu tipo de corpo garantem resultados mais rápidos e eficazes'
      },
      // Dados corporais personalizados
      dadosCorporais: {
        title: isMasculino
          ? 'Informações Corporais'
          : 'Informações Corporais',
        subtitle: isMasculino
          ? 'Altura e peso são fundamentais para calcular cargas ideais para ganho de massa'
          : 'Altura e peso são fundamentais para calcular cargas ideais para tonificação',
        desc: isMasculino
          ? 'Com base no seu IMC e estrutura, ajustamos cargas e volume para máximo ganho muscular'
          : 'Com base no seu IMC e estrutura, ajustamos cargas e volume para máxima definição'
      },
      // Objetivos personalizados
      objetivos: {
        title: isMasculino
          ? 'Qual é o seu objetivo principal?'
          : 'Qual é o seu objetivo principal?',
        subtitle: isMasculino
          ? 'Homens têm objetivos específicos que exigem estratégias diferentes de treino'
          : 'Mulheres têm objetivos específicos que exigem estratégias diferentes de treino',
        desc: isMasculino
          ? 'Focar em um objetivo principal garante ganho de massa e força mais rápidos'
          : 'Focar em um objetivo principal garante definição e tonificação mais rápidas'
      },
      // Experiência personalizada
      experiencia: {
        title: isMasculino
          ? 'Sua Experiência e Disponibilidade'
          : 'Sua Experiência e Disponibilidade',
        subtitle: isMasculino
          ? 'Treinos adequados ao seu nível evitam lesões e garantem progressão constante'
          : 'Treinos adequados ao seu nível evitam lesões e garantem progressão constante',
        desc: isMasculino
          ? 'A frequência ideal depende do seu objetivo e tempo disponível. Mais não significa melhor!'
          : 'A frequência ideal depende do seu objetivo e tempo disponível. Mais não significa melhor!'
      }
    }
  }

  const genderContent = getGenderContent()

  // Tela inicial - Hero Section (estilo MadMuscles)
  if (step === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-dark via-dark-lighter to-dark">
        {/* Header simples */}
        <div className="w-full py-6 px-6 border-b border-grey/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-3xl font-display font-bold text-primary">AthletIA</div>
          </div>
        </div>

        {/* Conteúdo centralizado */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-4xl w-full text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-light mb-6 leading-tight">
              Pare de Perder Tempo com Treinos Genéricos que Não Funcionam
            </h1>
            <p className="text-xl md:text-2xl text-light-muted mb-8 font-light">
              Treinos personalizados por IA adaptados ao seu corpo, objetivo e disponibilidade. Resultados reais em 30 dias ou seu dinheiro de volta.
            </p>
            
            {/* O Que Resolvemos */}
            <div className="bg-dark-lighter/50 border-2 border-primary/30 rounded-2xl p-8 md:p-10 mb-8 text-left max-w-3xl mx-auto backdrop-blur-sm">
              <h3 className="text-primary font-bold text-2xl mb-6 text-center">O Que Resolvemos</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-light font-bold mb-2">Treinos genéricos não funcionam para seu corpo</h4>
                    <p className="text-light-muted text-sm leading-relaxed">Cada pessoa tem um biotipo, nível de condicionamento e objetivos diferentes. Treinos padronizados ignoram suas necessidades específicas.</p>
                    <p className="text-primary font-semibold text-sm mt-2">Solução: Treinos 100% personalizados baseados no seu perfil físico completo</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-light font-bold mb-2">Não sabe o que fazer na academia</h4>
                    <p className="text-light-muted text-sm leading-relaxed">Ficar perdido na academia, sem saber quais exercícios fazer, quantas séries e repetições executar.</p>
                    <p className="text-primary font-semibold text-sm mt-2">Solução: Plano completo com exercícios, séries e repetições definidos para cada treino</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-light font-bold mb-2">Perde motivação por falta de progresso</h4>
                    <p className="text-light-muted text-sm leading-relaxed">Treinar sem ver resultados leva à desmotivação e abandono do treino.</p>
                    <p className="text-primary font-semibold text-sm mt-2">Solução: Ajustes automáticos baseados no seu progresso real garantem evolução constante</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-error/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-light font-bold mb-2">Treinos muito difíceis ou muito fáceis</h4>
                    <p className="text-light-muted text-sm leading-relaxed">Intensidade inadequada leva a lesões ou falta de resultados.</p>
                    <p className="text-primary font-semibold text-sm mt-2">Solução: Intensidade adaptada ao seu nível atual com progressão inteligente</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prova Social */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="bg-dark-lighter/50 border border-primary/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">10k+</div>
                <div className="text-sm text-light-muted">Usuários transformaram seus corpos</div>
              </div>
              <div className="bg-dark-lighter/50 border border-primary/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
                <div className="text-sm text-light-muted">Avaliação média dos usuários</div>
              </div>
              <div className="bg-dark-lighter/50 border border-primary/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-light-muted">Taxa de satisfação</div>
              </div>
            </div>

            {/* Benefícios - 3 Pilares */}
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 md:p-8 mb-8 max-w-3xl mx-auto">
              <h3 className="text-primary font-bold text-2xl mb-6 text-center">Por Que Escolher o AthletIA</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="text-light font-bold text-lg mb-2">Personalização Total</h4>
                  <p className="text-light-muted text-sm leading-relaxed">IA analisa seu perfil completo e cria treinos únicos adaptados ao seu corpo, objetivo e disponibilidade</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-light font-bold text-lg mb-2">Resultados Comprovados</h4>
                  <p className="text-light-muted text-sm leading-relaxed">Metodologia científica com acompanhamento contínuo garantindo evolução constante e mensurável</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-light font-bold text-lg mb-2">Flexibilidade Total</h4>
                  <p className="text-light-muted text-sm leading-relaxed">Treinos que se adaptam à sua rotina, progresso e mudanças de objetivo sem compromisso ou renovação automática</p>
                </div>
              </div>
            </div>

            <button
              onClick={nextStep}
              className="btn-primary text-xl px-16 py-5 font-bold hover:scale-105 transition-all duration-300 shadow-2xl shadow-primary/30 mb-6"
            >
              Criar Meu Plano Personalizado Agora
            </button>
            
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-sm text-light text-center">
                <span className="font-bold text-primary">Garantia de 7 dias</span> - 100% do seu dinheiro de volta se não ficar satisfeito
              </p>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <p className="text-xs text-light-muted leading-relaxed">
                Ao continuar, você concorda com nossos <span className="text-primary underline cursor-pointer">Termos de serviço</span> e reconhece nossa <span className="text-primary underline cursor-pointer">Política de privacidade</span> e <span className="text-primary underline cursor-pointer">Política de cookies</span>
              </p>
              <p className="text-xs text-light-muted leading-relaxed">
                Recomendamos que consulte seu médico antes de iniciar qualquer programa de exercícios
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-dark via-dark-lighter to-dark">
      {/* Header com progresso */}
      <div className="w-full py-4 px-6 border-b border-grey/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xl font-display font-bold text-primary">AthletIA</div>
            <div className="text-sm text-light-muted">
              Passo {step === 4.5 ? '4.5' : step === 5.5 ? '5.5' : step === 7.5 ? '7.5' : step} de {totalSteps}
            </div>
          </div>
          <div className="w-full bg-dark-lighter rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal - estilo MadMuscles: uma pergunta por vez, centralizada */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          {/* Passo 1: Idade */}
          {step === 1 && (
            <div className="text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Qual é a sua idade?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                A idade influencia diretamente no metabolismo e capacidade de recuperação
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                Treinos personalizados por idade garantem resultados mais seguros e eficazes
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                  { label: '18-29', value: 25, image: '/images/onboarding/18 aos 29.png' },
                  { label: '30-39', value: 35, image: '/images/onboarding/30 aos 39.png' },
                  { label: '40-49', value: 45, image: '/images/onboarding/40 aos 49.png' },
                  { label: '50+', value: 55, image: '/images/onboarding/50+.png' }
                ].map((faixa) => {
                  const selected = onboardingData.idade && 
                    (faixa.label === '18-29' && onboardingData.idade >= 18 && onboardingData.idade <= 29) ||
                    (faixa.label === '30-39' && onboardingData.idade >= 30 && onboardingData.idade <= 39) ||
                    (faixa.label === '40-49' && onboardingData.idade >= 40 && onboardingData.idade <= 49) ||
                    (faixa.label === '50+' && onboardingData.idade >= 50)

                  return (
                    <button
                      key={faixa.label}
                      type="button"
                      onClick={() => handleChangeAndAdvance('idade', faixa.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleChangeAndAdvance('idade', faixa.value)
                        }
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                        selected
                          ? 'ring-4 ring-primary scale-105'
                          : 'ring-2 ring-grey hover:ring-primary/50'
                      }`}
                      aria-label={`Selecionar idade ${faixa.label}`}
                      aria-pressed={selected}
                    >
                      <div className="w-full aspect-[3/4] bg-dark-lighter overflow-hidden">
                        <img 
                          src={faixa.image} 
                          alt={`Idade ${faixa.label}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/90 to-transparent p-3">
                        <div className="text-white font-bold text-lg">{faixa.label}</div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 2: Sexo */}
          {step === 2 && (
            <div className="text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Qual é o seu sexo?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Homens e mulheres têm diferenças hormonais e estruturais importantes
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                Isso afeta ganho de massa muscular, perda de gordura e distribuição de força
              </p>
              
              <div className="grid grid-cols-2 gap-6 mt-8 max-w-2xl mx-auto">
                {[
                  { 
                    value: 'Masculino', 
                    image: '/images/onboarding/Homem.png'
                  },
                  { 
                    value: 'Feminino', 
                    image: '/images/onboarding/Mulher.png'
                  }
                ].map((sexo) => {
                  const selected = onboardingData.sexo === sexo.value
                  return (
                    <button
                      key={sexo.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('sexo', sexo.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleChangeAndAdvance('sexo', sexo.value)
                        }
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                        selected
                          ? 'ring-4 ring-primary scale-105'
                          : 'ring-2 ring-grey hover:ring-primary/50'
                      }`}
                      aria-label={`Selecionar ${sexo.value}`}
                      aria-pressed={selected}
                    >
                      <div className="w-full aspect-[3/4] bg-dark-lighter overflow-hidden">
                        <img 
                          src={sexo.image} 
                          alt={sexo.value}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/90 to-transparent p-4">
                        <div className="text-white font-bold text-xl">{sexo.value}</div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 3: Tipo de Corpo */}
          {step === 3 && (
            <div className="text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                {genderContent.tipoCorpo.title}
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                {genderContent.tipoCorpo.subtitle}
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                {genderContent.tipoCorpo.desc}
              </p>
              
              <div className={`grid grid-cols-1 ${onboardingData.sexo === 'Feminino' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6 mt-8`}>
                {(onboardingData.sexo === 'Feminino' ? [
                  {
                    value: 'Em Forma',
                    label: 'Em Forma',
                    desc: 'Corpo tonificado e definido',
                    image: '/images/onboarding/Em_forma.png'
                  },
                  {
                    value: 'Sobrepeso',
                    label: 'Sobrepeso',
                    desc: 'Pouco acima do peso ideal',
                    image: '/images/onboarding/Sobrepeso.png'
                  },
                  {
                    value: 'Acima do Peso',
                    label: 'Acima do Peso',
                    desc: 'Significativamente acima do peso',
                    image: '/images/onboarding/Acima do peso.png'
                  },
                  {
                    value: 'Obesidade',
                    label: 'Obesidade',
                    desc: 'Obesidade que precisa de atenção',
                    image: '/images/onboarding/Obesidade.png'
                  }
                ] : [
                  {
                    value: 'Ectomorfo',
                    label: 'Em Forma',
                    desc: 'Corpo tonificado e definido',
                    image: '/images/onboarding/magro.webp'
                  },
                  {
                    value: 'Mesomorfo',
                    label: 'Sobrepeso',
                    desc: 'Pouco acima do peso ideal',
                    image: '/images/onboarding/sobrepeso.webp'
                  },
                  {
                    value: 'Endomorfo',
                    label: 'Acima do Peso',
                    desc: 'Significativamente acima do peso',
                    image: '/images/onboarding/acima_do_peso.webp'
                  },
                  {
                    value: 'Obesidade',
                    label: 'Obesidade',
                    desc: 'Obesidade que precisa de atenção',
                    image: '/images/onboarding/obeso.webp'
                  }
                ]).map((tipo) => {
                  const selected = onboardingData.tipoCorpo === tipo.value
                  return (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('tipoCorpo', tipo.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleChangeAndAdvance('tipoCorpo', tipo.value)
                        }
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                        selected
                          ? 'ring-4 ring-primary scale-105'
                          : 'ring-2 ring-grey hover:ring-primary/50'
                      }`}
                      aria-label={`Selecionar tipo de corpo: ${tipo.label}`}
                      aria-pressed={selected}
                    >
                      <div className="w-full aspect-[3/4] bg-dark-lighter">
                        <img 
                          src={tipo.image} 
                          alt={tipo.label}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/300x400/4A4946/F9A620?text=${tipo.label}`
                          }}
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/90 to-transparent p-4">
                        <div className="text-white font-bold text-xl mb-1">{tipo.label}</div>
                        <div className="text-white/80 text-sm">{tipo.desc}</div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 4: Altura */}
          {step === 4 && (
            <div className="text-center animate-fade-in max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-8">
                Qual é a sua altura?
              </h2>
              
              <div className="space-y-6">
                {/* Seleção de unidade */}
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="px-8 py-3 rounded-lg font-semibold bg-primary text-dark"
                  >
                    cm
                  </button>
                </div>

                {/* Input de altura */}
                <div className="mt-8">
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={onboardingData.altura || ''}
                    onChange={(e) => handleChange('altura', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-transparent border-b-2 border-grey text-center text-2xl md:text-4xl font-bold text-light focus:border-primary focus:outline-none py-4 transition-colors"
                    placeholder="Altura, cm"
                    required
                    aria-label="Digite sua altura em centímetros"
                    aria-required="true"
                  />
                  {onboardingData.altura && (onboardingData.altura < 100 || onboardingData.altura > 250) && (
                    <p className="text-error text-sm mt-2">Altura deve estar entre 100 e 250 cm</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Passo 4.5: Peso */}
          {step === 4.5 && (
            <div className="text-center animate-fade-in max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-8">
                Qual é o seu peso atual?
              </h2>
              
              <div className="space-y-6">
                {/* Seleção de unidade */}
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="px-8 py-3 rounded-lg font-semibold bg-primary text-dark"
                  >
                    kg
                  </button>
                </div>

                {/* Input de peso */}
                <div className="mt-8">
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="300"
                    value={onboardingData.pesoAtual || ''}
                    onChange={(e) => handleChange('pesoAtual', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-transparent border-b-2 border-grey text-center text-2xl md:text-4xl font-bold text-light focus:border-primary focus:outline-none py-4 transition-colors"
                    placeholder="Peso atual, kg"
                    required
                    aria-label="Digite seu peso atual em quilogramas"
                    aria-required="true"
                  />
                  {onboardingData.pesoAtual && (onboardingData.pesoAtual < 30 || onboardingData.pesoAtual > 300) && (
                    <p className="text-error text-sm mt-2">Peso deve estar entre 30 e 300 kg</p>
                  )}
                </div>

                {/* Cálculo IMC */}
                {onboardingData.altura && onboardingData.pesoAtual && (
                  <div className="mt-8 bg-primary/20 border border-primary/50 rounded-lg p-4">
                    <p className="text-sm text-light-muted mb-1">Seu IMC:</p>
                    <p className="text-3xl font-bold text-primary">
                      {((onboardingData.pesoAtual / ((onboardingData.altura / 100) ** 2))).toFixed(1)}
                    </p>
                    <p className="text-xs text-light-muted mt-2">
                      {(() => {
                        const imc = onboardingData.pesoAtual / ((onboardingData.altura / 100) ** 2)
                        if (imc < 18.5) return 'Abaixo do peso'
                        if (imc < 25) return 'Peso normal'
                        if (imc < 30) return 'Sobrepeso'
                        return 'Obesidade'
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passo 5: Consumo de Água */}
          {step === 5 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Quanta água você bebe diariamente?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                A hidratação adequada é fundamental para o desempenho e recuperação
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                Isso nos ajuda a personalizar recomendações de hidratação para seus treinos
              </p>
              
              <div className="grid grid-cols-1 gap-4 mt-8 max-w-2xl mx-auto">
                {[
                  {
                    value: 'Menos de 2 copos',
                    label: 'Menos de 2 copos',
                    desc: 'até 0,5 litros',
                    iconCount: 1
                  },
                  {
                    value: '2-6 copos',
                    label: '2-6 copos',
                    desc: '0,5 a 1,5 litros',
                    iconCount: 2
                  },
                  {
                    value: '7-10 copos',
                    label: '7-10 copos',
                    desc: '1,5 a 2,5 litros',
                    iconCount: 3
                  },
                  {
                    value: 'Mais de 10 copos',
                    label: 'Mais de 10 copos',
                    desc: 'mais de 2,5 litros',
                    iconCount: 1
                  },
                  {
                    value: 'Bebo apenas café ou chá',
                    label: 'Bebo apenas café ou chá',
                    desc: 'Não bebo água pura',
                    iconCount: 1
                  }
                ].map((agua) => {
                  const selected = onboardingData.aguaDiaria === agua.value
                  return (
                    <button
                      key={agua.value}
                      type="button"
                      onClick={() => {
                        handleChange('aguaDiaria', agua.value)
                        // Após selecionar, ir automaticamente para feedback após 600ms
                        setTimeout(() => {
                          setStep(5.5)
                        }, 600)
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all p-4 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-grey hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-lg mb-1">{agua.label}</div>
                          <div className="text-white/80 text-sm">{agua.desc}</div>
                        </div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 5.5: Feedback de Água */}
          {step === 5.5 && (() => {
            const analise = calcularAnaliseAgua()
            if (!analise) {
              // Se não tem análise, voltar para passo 5
              setTimeout(() => setStep(5), 100)
              return null
            }

            const isPositivo = analise.status === 'excelente' || analise.status === 'bom'
            const porcentagemAgua = analise.status === 'excelente' ? 95 : 
                                   analise.status === 'bom' ? 70 : 
                                   analise.status === 'regular' ? 50 : 
                                   analise.status === 'baixo' ? 30 : 10

            return (
              <div className="text-center animate-fade-in max-w-2xl mx-auto">
                {/* Indicador visual de água - Círculo com água preenchendo */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-40 h-40 rounded-full bg-dark-lighter border-4 border-grey overflow-hidden">
                    {/* Água preenchendo de baixo para cima */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${
                        isPositivo ? 'bg-primary' : 'bg-warning'
                      }`}
                      style={{ height: `${porcentagemAgua}%` }}
                    />
                    {/* Ícone sobreposto */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Título */}
                <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-4">
                  {analise.status === 'excelente' ? 'Uau! Impressionante!' :
                   analise.status === 'bom' ? 'Ótimo! Continue assim!' :
                   analise.status === 'baixo' ? 'Atenção!' :
                   'Precisamos melhorar!'}
                </h2>

                {/* Mensagem de comparação */}
                <p className="text-xl text-light mb-6">
                  {analise.mensagem}
                </p>

                {/* Recomendação */}
                <div className={`rounded-lg p-6 mb-8 text-left ${
                  analise.cor === 'success' 
                    ? 'bg-success/20 border border-success/50' 
                    : analise.cor === 'warning'
                    ? 'bg-warning/20 border border-warning/50'
                    : 'bg-error/20 border border-error/50'
                }`}>
                  <h3 className={`font-bold text-lg mb-3 flex items-center gap-2 ${
                    analise.cor === 'success' 
                      ? 'text-success' 
                      : analise.cor === 'warning'
                      ? 'text-warning'
                      : 'text-error'
                  }`}>
                    {analise.status === 'excelente' || analise.status === 'bom' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                    Recomendação
                  </h3>
                  <p className="text-light">
                    {analise.recomendacao}
                  </p>
                </div>

                {/* Informação adicional */}
                <div className="bg-dark-lighter rounded-lg p-4 mb-6">
                  <p className="text-xs text-light-muted">
                    *Usuários do AthletIA que fizeram o teste
                  </p>
                  <p className="text-sm text-light-muted mt-2 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span><strong>Dica:</strong> A hidratação adequada melhora o desempenho nos treinos, acelera a recuperação e ajuda na perda de gordura.</span>
                  </p>
                </div>
              </div>
            )
          })()}

          {/* Passo 6: Objetivo */}
          {step === 6 && (
            <div className="text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                {genderContent.objetivos.title}
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                {genderContent.objetivos.subtitle}
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                {genderContent.objetivos.desc}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {(onboardingData.sexo === 'Feminino' ? [
                  {
                    value: 'Emagrecimento',
                    title: 'Perder peso',
                    desc: 'Queimar gordura e definir o corpo',
                    image: '/images/onboarding/Perder_peso.webp'
                  },
                  {
                    value: 'Hipertrofia',
                    title: 'Ganhar Massa Muscular',
                    desc: 'Aumentar volume e definição muscular',
                    image: '/images/onboarding/Ganhar_massa_muscular.webp'
                  },
                  {
                    value: 'Força',
                    title: 'Ficar Musculosa',
                    desc: 'Desenvolver força e massa muscular',
                    image: '/images/onboarding/Ficar_musculosa.webp'
                  }
                ] : [
                  {
                    value: 'Emagrecimento',
                    title: 'Perder peso',
                    desc: 'Queimar gordura e definir o corpo',
                    image: '/images/onboarding/perder_peso_homem.webp'
                  },
                  {
                    value: 'Hipertrofia',
                    title: 'Ganhar Massa Muscular',
                    desc: 'Aumentar volume e definição muscular',
                    image: '/images/onboarding/ganahr_massa.webp'
                  },
                  {
                    value: 'Força',
                    title: 'Ficar Musculoso',
                    desc: 'Desenvolver força e massa muscular',
                    image: '/images/onboarding/ficar_musculoso.webp'
                  }
                ]).map((obj) => {
                  const selected = onboardingData.objetivo === obj.value
                  return (
                    <button
                      key={obj.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('objetivo', obj.value)}
                      className={`relative overflow-hidden rounded-lg transition-all ${
                        selected
                          ? 'ring-4 ring-primary scale-105'
                          : 'ring-2 ring-grey hover:ring-primary/50'
                      }`}
                    >
                      <div className="w-full aspect-[3/4] bg-dark-lighter">
                        <img 
                          src={obj.image} 
                          alt={obj.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/300x400/4A4946/F9A620?text=${obj.title}`
                          }}
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/90 to-transparent p-4">
                        <div className="text-white font-bold text-xl mb-1">{obj.title}</div>
                        <div className="text-white/80 text-sm">{obj.desc}</div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 7: Nível de Condicionamento Físico */}
          {step === 7 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Qual é o seu nível de condicionamento físico?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Isso nos ajuda a criar treinos adequados ao seu nível
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                Seja honesto para receber treinos personalizados e seguros
              </p>

              <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto mt-8">
                {[
                  { 
                    value: 'Iniciante', 
                    desc: 'Sempre que me sento no chão, é difícil me levantar.',
                    icon: (
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )
                  },
                  { 
                    value: 'Intermediário', 
                    desc: 'Tento me exercitar uma vez por semana, mas ainda não é regular.',
                    icon: (
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    )
                  },
                  { 
                    value: 'Avançado', 
                    desc: 'Estou pegando fogo! Estou na melhor forma da minha vida.',
                    icon: (
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    )
                  }
                ].map((exp) => {
                  const selected = onboardingData.experiencia === exp.value
                  return (
                    <button
                      key={exp.value}
                      type="button"
                      onClick={() => {
                        handleChange('experiencia', exp.value)
                        // Após selecionar, ir automaticamente para feedback após 600ms
                        setTimeout(() => {
                          setStep(7.5)
                        }, 600)
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter border-2 border-primary/50'
                          : 'ring-2 ring-grey hover:ring-primary/50 bg-dark-lighter hover:border-primary/30 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                          {exp.icon}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-xl mb-2">{exp.value}</div>
                          <div className="text-white/80 text-sm leading-relaxed">{exp.desc}</div>
                        </div>
                      </div>
                      {selected && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 7.5: Feedback de Condicionamento Físico */}
          {step === 7.5 && (() => {
            const analise = calcularAnaliseCondicionamento()
            if (!analise) {
              setTimeout(() => setStep(7), 100)
              return null
            }

            const isPositivo = analise.status === 'excelente' || analise.status === 'bom' || analise.status === 'regular'
            const porcentagemNivel = analise.status === 'excelente' ? 95 : 
                                     analise.status === 'bom' ? 75 : 
                                     analise.status === 'regular' ? 60 : 30

            return (
              <div className="text-center animate-fade-in max-w-2xl mx-auto">
                {/* Indicador visual de nível */}
                <div className="mb-8 flex justify-center">
                  <div className="relative w-40 h-40 rounded-full bg-dark-lighter border-4 border-grey overflow-hidden">
                    {/* Barra de progresso preenchendo */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${
                        isPositivo ? 'bg-primary' : 'bg-warning'
                      }`}
                      style={{ height: `${porcentagemNivel}%` }}
                    />
                    {/* Ícone sobreposto */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {analise.status === 'excelente' ? (
                        <div className="flex items-center gap-1">
                          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {analise.status === 'bom' && (
                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Título */}
                <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-4">
                  {analise.status === 'excelente' ? 'Uau! Impressionante!' :
                   analise.status === 'bom' ? 'Ótimo! Continue assim!' :
                   analise.status === 'regular' ? 'Ótimo! Vamos começar!' :
                   'Vamos melhorar juntos!'}
                </h2>

                {/* Mensagem de comparação */}
                <p className="text-xl text-light mb-6">
                  {analise.mensagem}
                </p>

                {/* Recomendação */}
                <div className={`rounded-lg p-6 mb-8 text-left ${
                  analise.cor === 'success' 
                    ? 'bg-success/20 border border-success/50' 
                    : analise.cor === 'warning'
                    ? 'bg-warning/20 border border-warning/50'
                    : 'bg-error/20 border border-error/50'
                }`}>
                  <h3 className={`font-bold text-lg mb-3 flex items-center gap-2 ${
                    analise.cor === 'success' 
                      ? 'text-success' 
                      : analise.cor === 'warning'
                      ? 'text-warning'
                      : 'text-error'
                  }`}>
                    {analise.status === 'excelente' || analise.status === 'bom' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )}
                    Recomendação
                  </h3>
                  <p className="text-light">
                    {analise.recomendacao}
                  </p>
                </div>

                {/* Informação adicional */}
                <div className="bg-dark-lighter rounded-lg p-4 mb-6">
                  <p className="text-xs text-light-muted">
                    *Usuários do AthletIA que fizeram o teste
                  </p>
                  <p className="text-sm text-light-muted mt-2 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span><strong>Dica:</strong> Não importa seu nível atual, o importante é começar e manter a consistência. Vamos criar treinos perfeitos para você!</span>
                  </p>
                </div>
              </div>
            )
          })()}

          {/* Passo 8: Frequência Semanal */}
          {step === 8 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Quantas vezes por semana você quer treinar?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Vamos ajustar os treinos ao seu ritmo
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                Escolha a frequência ideal para seus treinos
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
                {[
                  { 
                    value: 2, 
                    label: '2x por semana',
                    desc: 'Ideal para iniciantes ou quem tem pouco tempo',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )
                  },
                  { 
                    value: 3, 
                    label: '3x por semana',
                    desc: 'Perfeito para progressão constante',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )
                  },
                  { 
                    value: 4, 
                    label: '4x por semana',
                    desc: 'Para quem quer resultados mais rápidos',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    )
                  },
                  { 
                    value: 5, 
                    label: '5x por semana',
                    desc: 'Para atletas experientes',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )
                  },
                  { 
                    value: 6, 
                    label: '6x por semana',
                    desc: 'Para profissionais dedicados',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    )
                  }
                ].map((freq) => {
                  const selected = onboardingData.frequenciaSemanal === freq.value
                  return (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('frequenciaSemanal', freq.value)}
                      className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter border-2 border-primary/50'
                          : 'ring-2 ring-grey hover:ring-primary/50 bg-dark-lighter hover:border-primary/30 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                          selected ? 'bg-primary text-dark' : 'bg-primary/20 text-primary'
                        }`}>
                          {freq.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-xl mb-2 ${selected ? 'text-primary' : 'text-light'}`}>
                            {freq.label}
                          </div>
                          <div className={`text-sm leading-relaxed ${selected ? 'text-light/90' : 'text-light-muted'}`}>
                            {freq.desc}
                          </div>
                        </div>
                      </div>
                      {selected && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 9: Tempo de Treino */}
          {step === 9 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Quanto tempo você quer que seus treinos durem?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Selecione a duração ideal para seus treinos
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                Isso nos ajuda a criar treinos que se encaixam na sua rotina
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
                {[
                  { 
                    value: 30, 
                    label: '30 a 45 minutos',
                    desc: 'Treinos rápidos e eficientes para quem tem pouco tempo'
                  },
                  { 
                    value: 45, 
                    label: '45 a 60 minutos',
                    desc: 'Duração ideal para treinos completos e bem estruturados'
                  },
                  { 
                    value: 60, 
                    label: '60 a 75 minutos',
                    desc: 'Treinos mais longos para quem busca resultados intensos'
                  },
                  { 
                    value: 75, 
                    label: 'Mais de 75 minutos',
                    desc: 'Treinos extensos para atletas dedicados e experientes'
                  }
                ].map((tempo) => {
                  const selected = onboardingData.tempoDisponivel === tempo.value
                  return (
                    <button
                      key={tempo.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('tempoDisponivel', tempo.value)}
                      className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter border-2 border-primary/50'
                          : 'ring-2 ring-grey hover:ring-primary/50 bg-dark-lighter hover:border-primary/30 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                          selected ? 'bg-primary text-dark' : 'bg-primary/20 text-primary'
                        }`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-xl mb-2 ${selected ? 'text-primary' : 'text-light'}`}>
                            {tempo.label}
                          </div>
                          <div className={`text-sm leading-relaxed ${selected ? 'text-light/90' : 'text-light-muted'}`}>
                            {tempo.desc}
                          </div>
                        </div>
                      </div>
                      {selected && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 10: Local do Treino */}
          {step === 10 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Escolha o local do seu treino
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Onde você prefere treinar?
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                Isso nos ajuda a criar treinos adequados ao seu ambiente
              </p>

              <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto mt-8">
                {[
                  { 
                    value: 'Casa', 
                    desc: 'Treino em casa com equipamentos básicos ou sem equipamentos'
                  },
                  { 
                    value: 'Academia', 
                    desc: 'Treino em academia com acesso a equipamentos completos'
                  },
                  { 
                    value: 'Misto', 
                    desc: 'Treino tanto em casa quanto na academia'
                  }
                ].map((local) => {
                  const selected = onboardingData.localTreino === local.value
                  return (
                    <button
                      key={local.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('localTreino', local.value)}
                      className={`relative overflow-hidden rounded-lg transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-grey hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-xl mb-2">{local.value}</div>
                          <div className="text-white/80 text-sm">{local.desc}</div>
                        </div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 11: Problemas em Tentativas Anteriores */}
          {step === 11 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Problemas em suas tentativas anteriores de condicionamento físico?
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Conte-nos o que dificultou seus treinos anteriores
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                Isso nos ajuda a criar uma experiência melhor e evitar os mesmos problemas
              </p>

              <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto mt-8">
                {[
                  { 
                    value: 'Falta de motivação', 
                    desc: 'Tinha dificuldade em manter a consistência'
                  },
                  { 
                    value: 'Não tinha um plano claro', 
                    desc: 'Não sabia o que fazer em cada treino'
                  },
                  { 
                    value: 'Meus treinos eram muito duros', 
                    desc: 'A intensidade estava acima do meu nível'
                  },
                  { 
                    value: 'Falta de tempo', 
                    desc: 'Não conseguia encaixar os treinos na rotina'
                  }
                ].map((problema) => {
                  const selected = onboardingData.problemasAnteriores?.includes(problema.value) || false
                  return (
                    <button
                      key={problema.value}
                      type="button"
                      onClick={() => {
                        const current = onboardingData.problemasAnteriores || []
                        if (selected) {
                          handleChange('problemasAnteriores', current.filter(p => p !== problema.value))
                        } else {
                          handleChange('problemasAnteriores', [...current, problema.value])
                        }
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all p-4 text-left flex items-center justify-between ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-grey hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-bold text-lg mb-1">{problema.value}</div>
                          <div className="text-white/70 text-sm">{problema.desc}</div>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        selected
                          ? 'bg-primary border-primary'
                          : 'border-grey bg-transparent'
                      }`}>
                        {selected && (
                          <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {onboardingData.problemasAnteriores && onboardingData.problemasAnteriores.length > 0 && (
                <div className="mt-6 text-sm text-light-muted">
                  <p>Você selecionou {onboardingData.problemasAnteriores.length} {onboardingData.problemasAnteriores.length === 1 ? 'problema' : 'problemas'}</p>
                </div>
              )}
            </div>
          )}

          {/* Passo 12: Objetivos Adicionais */}
          {step === 12 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-4">
                Marque seus objetivos adicionais abaixo:
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Temos certeza de que você deseja não apenas um corpo melhor, mas também melhorar seu estilo de vida.
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                Selecione todos os benefícios que você deseja alcançar
              </p>

              <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto mt-8">
                {[
                  { 
                    value: 'Melhorar o sono', 
                    desc: 'Ter noites mais tranquilas e descansadas',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )
                  },
                  { 
                    value: 'Criar um hábito físico', 
                    desc: 'Transformar o exercício em parte da rotina',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )
                  },
                  { 
                    value: 'Sentir-se mais saudável', 
                    desc: 'Aumentar o bem-estar geral e qualidade de vida',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )
                  },
                  { 
                    value: 'Reduzir o estresse', 
                    desc: 'Aliviar tensões e ansiedade do dia a dia',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    )
                  },
                  { 
                    value: 'Aumentar a energia', 
                    desc: 'Ter mais disposição para atividades diárias',
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )
                  }
                ].map((objetivo) => {
                  const selected = onboardingData.objetivosAdicionais?.includes(objetivo.value) || false
                  return (
                    <button
                      key={objetivo.value}
                      type="button"
                      onClick={() => {
                        const current = onboardingData.objetivosAdicionais || []
                        if (selected) {
                          handleChange('objetivosAdicionais', current.filter(o => o !== objetivo.value))
                        } else {
                          handleChange('objetivosAdicionais', [...current, objetivo.value])
                        }
                      }}
                      className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter border-2 border-primary/50'
                          : 'ring-2 ring-grey hover:ring-primary/50 bg-dark-lighter hover:border-primary/30 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                          selected ? 'bg-primary text-dark' : 'bg-primary/20 text-primary'
                        }`}>
                          {objetivo.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold text-xl mb-2 ${selected ? 'text-primary' : 'text-light'}`}>
                            {objetivo.value}
                          </div>
                          <div className={`text-sm leading-relaxed ${selected ? 'text-light/90' : 'text-light-muted'}`}>
                            {objetivo.desc}
                          </div>
                        </div>
                        <div className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selected
                            ? 'bg-primary border-primary'
                            : 'border-grey bg-transparent'
                        }`}>
                          {selected && (
                            <svg className="w-4 h-4 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {onboardingData.objetivosAdicionais && onboardingData.objetivosAdicionais.length > 0 && (
                <div className="mt-6 text-sm text-light-muted">
                  <p>Você selecionou {onboardingData.objetivosAdicionais.length} {onboardingData.objetivosAdicionais.length === 1 ? 'objetivo' : 'objetivos'}</p>
                </div>
              )}
            </div>
          )}

          {/* Passo 13: Limitações Físicas */}
          {step === 13 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Lesões ou Limitações Físicas
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                Informar lesões garante treinos seguros e adaptados
              </p>
              <p className="text-sm text-light-muted/80 mb-8">
                Adaptamos exercícios para suas condições, mantendo a eficácia do treino
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto mt-8">
                {['Joelho', 'Ombro', 'Coluna', 'Pulso', 'Tornozelo', 'Nenhuma'].map((lesao) => {
                  const selected = onboardingData.lesoes?.includes(lesao) || 
                    (lesao === 'Nenhuma' && (!onboardingData.lesoes || onboardingData.lesoes.length === 0))
                  return (
                    <button
                      key={lesao}
                      type="button"
                      onClick={() => {
                        if (lesao === 'Nenhuma') {
                          handleChange('lesoes', [])
                        } else {
                          handleArrayChange('lesoes', lesao)
                        }
                      }}
                      className={`py-4 rounded-lg font-semibold transition-all text-lg ${
                        selected
                          ? 'bg-primary text-dark ring-4 ring-primary/50 scale-105'
                          : 'bg-dark-lighter text-light ring-2 ring-grey hover:ring-primary/50'
                      }`}
                    >
                      {lesao}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Passo 14: Nome */}
          {step === 14 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Qual é o seu nome?
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                Precisamos do seu nome para personalizar sua experiência
              </p>

              <div className="max-w-md mx-auto mt-8">
                <input
                  type="text"
                  value={onboardingData.nome || ''}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  className="w-full bg-transparent border-b-2 border-grey text-center text-2xl md:text-4xl font-bold text-light focus:border-primary focus:outline-none py-4 transition-colors"
                  placeholder="Seu nome"
                  autoFocus
                  aria-label="Digite seu nome completo"
                  aria-required="true"
                />
                {onboardingData.nome && onboardingData.nome.trim().length < 2 && (
                  <p className="text-error text-sm mt-2">Nome deve ter pelo menos 2 caracteres</p>
                )}
              </div>
            </div>
          )}

          {/* Passo 15: Data de Nascimento */}
          {step === 15 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Qual é a sua data de nascimento?
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                Precisamos da sua data de nascimento para calcular sua idade e personalizar seu plano
              </p>

              <div className="max-w-md mx-auto mt-8">
                <input
                  type="text"
                  value={onboardingData.dataNascimento || ''}
                  onChange={(e) => {
                    const input = e.target.value
                    // Remove tudo que não é número
                    const numbers = input.replace(/\D/g, '')
                    
                    // Limita a 8 dígitos
                    const limitedNumbers = numbers.slice(0, 8)
                    
                    // Formata conforme o usuário digita
                    let formatted = ''
                    if (limitedNumbers.length === 0) {
                      formatted = ''
                    } else if (limitedNumbers.length <= 2) {
                      formatted = limitedNumbers
                    } else if (limitedNumbers.length <= 4) {
                      formatted = `${limitedNumbers.slice(0, 2)} / ${limitedNumbers.slice(2)}`
                    } else {
                      formatted = `${limitedNumbers.slice(0, 2)} / ${limitedNumbers.slice(2, 4)} / ${limitedNumbers.slice(4, 8)}`
                    }
                    
                    handleChange('dataNascimento', formatted)
                  }}
                  onKeyDown={(e) => {
                    // Se o usuário pressionar backspace e o cursor estiver após uma barra, mover o cursor
                    if (e.key === 'Backspace') {
                      const input = e.target as HTMLInputElement
                      const cursorPos = input.selectionStart || 0
                      const value = input.value
                      
                      // Se o cursor está logo após " / ", mover para antes
                      if (cursorPos > 0 && value[cursorPos - 1] === ' ') {
                        setTimeout(() => {
                          input.setSelectionRange(cursorPos - 3, cursorPos - 3)
                        }, 0)
                      }
                    }
                  }}
                  className="w-full bg-transparent border-b-2 border-grey text-center text-2xl md:text-4xl font-bold text-light focus:border-primary focus:outline-none py-4 transition-colors"
                  placeholder="DD / MM / AAAA"
                  autoFocus
                  aria-label="Digite sua data de nascimento no formato DD/MM/AAAA"
                  aria-required="true"
                />
                {onboardingData.dataNascimento && onboardingData.dataNascimento.replace(/\D/g, '').length < 8 && (
                  <p className="text-error text-sm mt-2">Data incompleta. Use o formato DD/MM/AAAA</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer com botões - estilo MadMuscles */}
      <div className="w-full py-6 px-6 border-t border-grey/30">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          {step > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 text-light-muted hover:text-light transition-colors flex items-center gap-2"
              aria-label="Voltar para o passo anterior"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          ) : (
            <div></div>
          )}

          {step < 15 ? (
            // Esconder botão para passos com auto-advance (escolhas únicas)
            // Mostrar apenas para: inputs (4, 4.5, 14, 15), feedbacks (5.5, 7.5), e múltiplas escolhas (11, 12, 13)
            [4, 4.5, 5.5, 7.5, 11, 12, 13, 14, 15].includes(step) ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  (step === 4 && !onboardingData.altura) ||
                  (step === 4.5 && !onboardingData.pesoAtual) ||
                  (step === 5 && !onboardingData.aguaDiaria) ||
                  (step === 5.5 && !onboardingData.aguaDiaria) ||
                  (step === 7 && !onboardingData.experiencia) ||
                  (step === 7.5 && !onboardingData.experiencia) ||
                  (step === 14 && !onboardingData.nome?.trim()) ||
                  (step === 15 && (!onboardingData.dataNascimento || onboardingData.dataNascimento.replace(/\D/g, '').length < 8))
                  // Passos 11, 12 e 13 são opcionais
                }
                className="btn-primary px-12 py-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 5.5 || step === 7.5 ? 'Entendi' : 'Continuar'}
              </button>
            ) : null
          ) : (
            <button
              type="button"
              onClick={finalizarOnboarding}
              className="btn-primary px-12 py-3 text-lg font-bold"
            >
              Finalizar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
