import { AnaliseAgua, AnaliseCondicionamento } from '../../types/onboarding.types'

interface FeedbackCardProps {
  analise: AnaliseAgua | AnaliseCondicionamento | null
  tipo: 'agua' | 'condicionamento'
}

export default function FeedbackCard({ analise, tipo }: FeedbackCardProps) {
  if (!analise) return null

  const isPositivo = analise.status === 'excelente' || analise.status === 'bom' || analise.status === 'regular'
  
  const porcentagem = tipo === 'agua'
    ? analise.status === 'excelente' ? 95 : 
      analise.status === 'bom' ? 70 : 
      analise.status === 'regular' ? 50 : 
      analise.status === 'baixo' ? 30 : 10
    : analise.status === 'excelente' ? 95 : 
      analise.status === 'bom' ? 75 : 
      analise.status === 'regular' ? 60 : 30

  const getTitulo = () => {
    if (tipo === 'agua') {
      if (analise.status === 'excelente') return 'Uau! Impressionante!'
      if (analise.status === 'bom') return 'Ótimo! Continue assim!'
      if (analise.status === 'baixo') return 'Atenção!'
      return 'Precisamos melhorar!'
    } else {
      if (analise.status === 'excelente') return 'Uau! Impressionante!'
      if (analise.status === 'bom') return 'Ótimo! Continue assim!'
      if (analise.status === 'regular') return 'Ótimo! Vamos começar!'
      return 'Vamos melhorar juntos!'
    }
  }

  const getIcone = () => {
    if (tipo === 'agua') {
      return (
        <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    } else {
      if (analise.status === 'excelente') {
        return (
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
        )
      } else {
        return (
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
        )
      }
    }
  }

  return (
    <div className="text-center animate-fade-in max-w-2xl mx-auto">
      {/* Indicador visual */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-40 h-40 rounded-full bg-dark-lighter border-4 border-slate-300 overflow-hidden">
          {/* Barra de progresso preenchendo */}
          <div 
            className={`absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out ${
              isPositivo ? 'bg-primary' : 'bg-warning'
            }`}
            style={{ height: `${porcentagem}%` }}
          />
          {/* Ícone sobreposto */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {getIcone()}
          </div>
        </div>
      </div>

      {/* Título */}
      <h2 className="text-3xl md:text-4xl font-display font-bold text-light mb-4">
        {getTitulo()}
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
          <span>
            <strong>Dica:</strong>{' '}
            {tipo === 'agua' 
              ? 'A hidratação adequada melhora o desempenho nos treinos, acelera a recuperação e ajuda na perda de gordura.'
              : 'Não importa seu nível atual, o importante é começar e manter a consistência. Vamos criar treinos perfeitos para você!'
            }
          </span>
        </p>
      </div>
    </div>
  )
}

