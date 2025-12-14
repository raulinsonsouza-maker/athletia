import { OnboardingData, OnboardingStep } from '../../types/onboarding.types'
import OnboardingHeader from '../onboarding/OnboardingHeader'
import OnboardingFooter from '../onboarding/OnboardingFooter'
import StepIdade from '../onboarding/steps/StepIdade'
import StepSexo from '../onboarding/steps/StepSexo'
import FeedbackCard from '../onboarding/FeedbackCard'
import MobileNumberPicker from '../MobileNumberPicker'
import ResumoDinamicoPanel from './ResumoDinamicoPanel'
import { useOnboardingAnalytics } from '../../hooks/onboarding/useOnboardingAnalytics'
import { useGenderContent } from '../../hooks/onboarding/useGenderContent'
import { DEFAULT_VALUES } from '../../constants/onboarding.constants'
import {
  AGUA_OPCOES,
  OBJETIVO_OPCOES_FEMININO,
  OBJETIVO_OPCOES_MASCULINO,
  EXPERIENCIA_OPCOES,
  FREQUENCIA_OPCOES,
  TEMPO_OPCOES,
  LOCAL_TREINO_OPCOES,
  PROBLEMAS_ANTERIORES_OPCOES,
  OBJETIVOS_ADICIONAIS_OPCOES,
  LESOES_OPCOES,
  TIPO_CORPO_FEMININO,
  TIPO_CORPO_MASCULINO
} from '../../constants/onboarding.constants'

interface OnboardingFlowProps {
  step: OnboardingStep
  onboardingData: OnboardingData
  setStep: (step: OnboardingStep) => void
  handleChange: (field: keyof OnboardingData, value: any) => void
  handleChangeAndAdvance: (field: keyof OnboardingData, value: any) => void
  handleArrayChange: (field: 'lesoes' | 'preferencias', value: string) => void
  onFinish: () => void
  nextStep: () => void
  prevStep: () => void
}

export default function OnboardingFlow({
  step,
  onboardingData,
  setStep,
  handleChange,
                handleChangeAndAdvance,
                handleArrayChange,
                onFinish,
  nextStep,
  prevStep
}: OnboardingFlowProps) {
  const { analiseAgua, analiseCondicionamento } = useOnboardingAnalytics(onboardingData)
  const genderContent = useGenderContent(onboardingData)

  // Calcular progresso
  const totalSteps = 15
  const progresso = ((step / totalSteps) * 100).toFixed(0)

  return (
    <section id="onboarding" className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
      <OnboardingHeader step={step} />

      {/* Barra de progresso */}
      <div className="w-full bg-dark-lighter/50 h-1">
        <div 
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${progresso}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          {/* Step 1: Idade */}
          {step === 1 && (
            <StepIdade
              onboardingData={onboardingData}
              onSelect={(value) => handleChangeAndAdvance('idade', value)}
            />
          )}

          {/* Step 2: Sexo */}
          {step === 2 && (
            <StepSexo
              onboardingData={onboardingData}
              onSelect={(value) => handleChangeAndAdvance('sexo', value)}
            />
          )}

          {/* Step 3: Tipo de Corpo */}
          {step === 3 && (
            <div className="text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                {genderContent.tipoCorpo.title}
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                {genderContent.tipoCorpo.subtitle}
              </p>
              <p className="text-sm text-light-muted mb-8">
                {genderContent.tipoCorpo.desc}
              </p>
              
              <div className={`grid grid-cols-1 ${onboardingData.sexo === 'Feminino' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6 mt-8`}>
                {(onboardingData.sexo === 'Feminino' ? TIPO_CORPO_FEMININO : TIPO_CORPO_MASCULINO).map((tipo) => {
                  const selected = onboardingData.tipoCorpo === tipo.value
                  return (
                    <button
                      key={tipo.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('tipoCorpo', tipo.value)}
                      className={`relative overflow-hidden rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                        selected
                          ? 'ring-4 ring-primary scale-105'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50'
                      }`}
                    >
                      <div className="w-full aspect-[3/4] bg-dark-lighter">
                        <img 
                          src={tipo.image} 
                          alt={tipo.label}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
                        <div className="text-white font-bold text-xl mb-1">{tipo.label}</div>
                        <div className="text-white/80 text-sm">{tipo.desc}</div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Step 4: Altura */}
          {step === 4 && (
            <div className="text-center animate-fade-in max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-8">
                Qual é a sua altura?
              </h2>
              <p className="text-light-muted mb-6 text-lg">
                Ajuste deslizando — selecionamos a altura exata para montar seus treinos.
              </p>
              <div className="mt-8">
                <MobileNumberPicker
                  min={140}
                  max={220}
                  step={1}
                  value={onboardingData.altura ?? DEFAULT_VALUES.altura}
                  onChange={(valor) => handleChange('altura', valor)}
                  unit="cm"
                />
                <p className="text-xs text-light-muted mt-4">Arraste para cima ou para baixo para ajustar.</p>
              </div>
            </div>
          )}

          {/* Step 4.5: Peso */}
          {step === 4.5 && (
            <div className="text-center animate-fade-in max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-8">
                Qual é o seu peso atual?
              </h2>
              <p className="text-light-muted mb-6 text-lg">
                Informe seu peso atual para criarmos treinos personalizados.
              </p>
              <div className="mt-8">
                <MobileNumberPicker
                  min={40}
                  max={200}
                  step={0.5}
                  value={onboardingData.pesoAtual ?? DEFAULT_VALUES.pesoAtual}
                  onChange={(valor) => handleChange('pesoAtual', valor)}
                  unit="kg"
                />
                {onboardingData.altura && onboardingData.pesoAtual && (
                  <div className="bg-primary/15 border border-primary/40 rounded-lg p-4 mt-6">
                    <p className="text-xs text-light-muted uppercase tracking-wide">Seu IMC estimado</p>
                    <p className="text-3xl font-bold text-primary mt-1">
                      {(() => {
                        const alturaMetros = (onboardingData.altura ?? 170) / 100
                        if (alturaMetros <= 0) return '—'
                        const imcValor = onboardingData.pesoAtual / (alturaMetros * alturaMetros)
                        return imcValor.toFixed(1)
                      })()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Água */}
          {step === 5 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Quantos litros de água você bebe por dia?
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                A hidratação adequada melhora o desempenho nos treinos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
                {AGUA_OPCOES.map((agua) => {
                  const selected = onboardingData.aguaDiaria === agua.value
                  return (
                    <button
                      key={agua.value}
                      type="button"
                      onClick={() => {
                        handleChange('aguaDiaria', agua.value)
                        setTimeout(() => setStep(5.5), 400)
                      }}
                      className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter border-2 border-primary/50'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="text-white font-bold text-xl mb-2">{agua.label}</div>
                      <div className="text-white/70 text-sm">{agua.desc}</div>
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

          {/* Step 5.5: Feedback Água */}
          {step === 5.5 && (
            <FeedbackCard analise={analiseAgua} tipo="agua" />
          )}

          {/* Step 6: Objetivo */}
          {step === 6 && (
            <div>
              <ResumoDinamicoPanel onboardingData={onboardingData} />
              <div className="text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                {genderContent.objetivos.title}
              </h2>
              <p className="text-light-muted mb-2 text-lg">
                {genderContent.objetivos.subtitle}
              </p>
              <p className="text-sm text-light-muted mb-8">
                {genderContent.objetivos.desc}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {(onboardingData.sexo === 'Feminino' ? OBJETIVO_OPCOES_FEMININO : OBJETIVO_OPCOES_MASCULINO).map((obj) => {
                  const selected = onboardingData.objetivo === obj.value
                  return (
                    <button
                      key={obj.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('objetivo', obj.value)}
                      className={`relative overflow-hidden rounded-lg transition-all ${
                        selected
                          ? 'ring-4 ring-primary scale-105'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50'
                      }`}
                    >
                      <div className="w-full aspect-[3/4] bg-dark-lighter">
                        <img 
                          src={obj.image} 
                          alt={obj.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
                        <div className="text-white font-bold text-xl mb-1">{obj.title}</div>
                        <div className="text-white/80 text-sm">{obj.desc}</div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          )}

          {/* Step 7: Experiência */}
          {step === 7 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Qual é o seu nível de condicionamento físico?
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                Isso nos ajuda a criar treinos adequados ao seu nível
              </p>
              <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto mt-8">
                {EXPERIENCIA_OPCOES.map((exp) => {
                  const selected = onboardingData.experiencia === exp.value
                  return (
                    <button
                      key={exp.value}
                      type="button"
                      onClick={() => {
                        handleChange('experiencia', exp.value)
                        setTimeout(() => setStep(7.5), 600)
                      }}
                      className={`relative overflow-hidden rounded-lg transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-white font-bold text-xl mb-2">{exp.value}</div>
                      </div>
                      <div className="text-white/80 text-sm">{exp.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 7.5: Feedback Condicionamento */}
          {step === 7.5 && (
            <FeedbackCard analise={analiseCondicionamento} tipo="condicionamento" />
          )}

          {/* Step 8: Frequência */}
          {step === 8 && (
            <div>
              <ResumoDinamicoPanel onboardingData={onboardingData} />
              <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Quantas vezes por semana você quer treinar?
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                Vamos ajustar os treinos ao seu ritmo
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
                {FREQUENCIA_OPCOES.map((freq) => {
                  const selected = onboardingData.frequenciaSemanal === freq.value
                  return (
                    <button
                      key={freq.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('frequenciaSemanal', freq.value)}
                      className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="text-white font-bold text-xl mb-2">{freq.label}</div>
                      <div className="text-white/70 text-sm">{freq.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
            </div>
          )}

          {/* Step 9: Tempo */}
          {step === 9 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Quanto tempo você quer que seus treinos durem?
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                Selecione a duração ideal para seus treinos
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
                {TEMPO_OPCOES.map((tempo) => {
                  const selected = onboardingData.tempoDisponivel === tempo.value
                  return (
                    <button
                      key={tempo.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('tempoDisponivel', tempo.value)}
                      className={`relative overflow-hidden rounded-xl transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="text-white font-bold text-xl mb-2">{tempo.label}</div>
                      <div className="text-white/70 text-sm">{tempo.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 10: Local */}
          {step === 10 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Escolha o local do seu treino
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                Onde você prefere treinar?
              </p>
              <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto mt-8">
                {LOCAL_TREINO_OPCOES.map((local) => {
                  const selected = onboardingData.localTreino === local.value
                  return (
                    <button
                      key={local.value}
                      type="button"
                      onClick={() => handleChangeAndAdvance('localTreino', local.value)}
                      className={`relative overflow-hidden rounded-lg transition-all p-6 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="text-white font-bold text-xl mb-2">{local.value}</div>
                      <div className="text-white/70 text-sm">{local.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 11: Problemas Anteriores */}
          {step === 11 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Problemas em suas tentativas anteriores de condicionamento físico?
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                Conte-nos o que dificultou seus treinos anteriores
              </p>
              <div className="grid grid-cols-1 gap-3 max-w-2xl mx-auto mt-8">
                {PROBLEMAS_ANTERIORES_OPCOES.map((problema) => {
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
                      className={`relative overflow-hidden rounded-lg transition-all p-4 text-left ${
                        selected
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="text-white font-bold text-lg mb-1">{problema.value}</div>
                      <div className="text-white/70 text-sm">{problema.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 12: Objetivos Adicionais */}
          {step === 12 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-4">
                Marque seus objetivos adicionais abaixo:
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                Selecione todos os benefícios que você deseja alcançar
              </p>
              <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto mt-8">
                {OBJETIVOS_ADICIONAIS_OPCOES.map((objetivo) => {
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
                          ? 'ring-4 ring-primary scale-105 bg-dark-lighter'
                          : 'ring-2 ring-slate-300 hover:ring-primary/50 bg-dark-lighter'
                      }`}
                    >
                      <div className="text-white font-bold text-xl mb-2">{objetivo.value}</div>
                      <div className="text-white/70 text-sm">{objetivo.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 13: Lesões */}
          {step === 13 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Lesões ou Limitações Físicas
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                Informar lesões garante treinos seguros e adaptados
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto mt-8">
                {LESOES_OPCOES.map((lesao) => {
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
                          : 'bg-dark-lighter text-light ring-2 ring-slate-300 hover:ring-primary/50'
                      }`}
                    >
                      {lesao}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 14: Idade */}
          {step === 14 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Qual é a sua idade?
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                A idade nos ajuda a ajustar o volume e a intensidade dos treinos para você.
              </p>
              <div className="max-w-xs mx-auto mt-8">
                <MobileNumberPicker
                  min={14}
                  max={80}
                  value={onboardingData.idade ?? DEFAULT_VALUES.idade}
                  onChange={(valor) => handleChange('idade', valor)}
                  unit="anos"
                />
              </div>
            </div>
          )}

          {/* Step 15: Nome */}
          {step === 15 && (
            <div className="text-center animate-fade-in max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-3">
                Para finalizar, como podemos te chamar?
              </h2>
              <p className="text-light-muted mb-8 text-lg">
                Queremos que tudo seja personalizado para você.
              </p>
              <div className="max-w-md mx-auto mt-8">
                <input
                  type="text"
                  value={onboardingData.nome || ''}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  className="w-full bg-transparent border-b-2 border-slate-300 text-center text-2xl md:text-4xl font-bold text-light focus:border-primary focus:outline-none py-4 transition-colors"
                  placeholder="Seu nome"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <OnboardingFooter
        step={step}
        onboardingData={onboardingData}
        onPrev={prevStep}
        onNext={nextStep}
        onFinish={onFinish}
      />
    </section>
  )
}
