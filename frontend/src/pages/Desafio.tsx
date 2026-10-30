import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../components/navigation/AppHeader'
import BottomTabs from '../components/navigation/BottomTabs'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../contexts/AuthContext'
import {
  DesafioDetalhe,
  concluirDiaDesafio,
  desmarcarDiaDesafio,
  obterDesafio
} from '../services/desafio.service'

const formatarDuracao = (segundos: number) => {
  const minutos = Math.floor(segundos / 60)
  const resto = segundos % 60
  return `${minutos}:${String(resto).padStart(2, '0')}`
}

export default function Desafio() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isTrialAtivo } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const [desafio, setDesafio] = useState<DesafioDetalhe | null>(null)
  const [diaAberto, setDiaAberto] = useState<number | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!slug) return
    obterDesafio(slug)
      .then((dados) => {
        setDesafio(dados)
        const atual = dados.dias.find((item) => item.status === 'atual') || dados.dias.find((item) => item.status === 'concluido')
        setDiaAberto(atual?.dia ?? dados.dias[0]?.dia ?? null)
      })
      .catch(() => {
        showToast('Não foi possível abrir o desafio', 'error')
        navigate('/meu-plano')
      })
  }, [slug])

  const dia = desafio?.dias.find((item) => item.dia === diaAberto) || null
  const concluidos = desafio?.dias.filter((item) => item.status === 'concluido') || []
  const ultimoFeito = concluidos[concluidos.length - 1]

  const atualizar = (dados: DesafioDetalhe, preferir?: number) => {
    setDesafio(dados)
    const proximo = dados.dias.find((item) => item.dia === preferir && item.status !== 'bloqueado')
      || dados.dias.find((item) => item.status === 'atual')
      || dados.dias[dados.dias.length - 1]
    if (proximo) setDiaAberto(proximo.dia)
  }

  const concluir = async () => {
    if (!slug || !dia || dia.status !== 'atual') return
    setSalvando(true)
    try {
      const dados = await concluirDiaDesafio(slug, dia.dia)
      atualizar(dados, dia.dia)
      showToast('Dia marcado. Ele entra na sua sequência.', 'success')
    } catch {
      showToast('Não foi possível marcar este dia', 'error')
    } finally {
      setSalvando(false)
    }
  }

  const desmarcar = async () => {
    if (!slug || !dia || ultimoFeito?.dia !== dia.dia) return
    setSalvando(true)
    try {
      const dados = await desmarcarDiaDesafio(slug, dia.dia)
      atualizar(dados)
      showToast('Dia desmarcado', 'success')
    } catch {
      showToast('Só dá para desmarcar o último dia feito', 'error')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-dark-light to-dark-lighter text-white pb-32">
      <AppHeader title={desafio?.titulo || 'Desafio'} backTo="/meu-plano" />
      <div
        className="px-5 space-y-5"
        style={{
          paddingTop: isTrialAtivo()
            ? 'calc(var(--trial-header-height, 60px) + 1.5rem)'
            : '1.5rem'
        }}
      >
        {desafio && (
          <>
            {!desafio.disponivel && (
              <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-white/70">Este desafio ainda está em preparação.</p>
              </section>
            )}

            <section className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">{desafio.disponivel ? '20 dias' : 'Em breve'}</p>
              <h2 className="text-2xl font-bold leading-tight">{desafio.titulo.replace('Desafio ', '')}</h2>
              <p className="text-white/70">{desafio.descricao}</p>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${desafio.totalDias ? (desafio.diasConcluidos / desafio.totalDias) * 100 : 0}%` }}
                />
              </div>
              <p className="text-sm text-white/60">{desafio.diasConcluidos} de {desafio.totalDias} dias</p>
            </section>

            {dia && (
              <section className="space-y-4">
                <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${dia.youtubeId}`}
                    title={dia.nome}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/50">Dia {dia.dia}</p>
                  <h3 className="text-xl font-bold">{dia.nome}</h3>
                  <p className="text-sm text-white/60">{formatarDuracao(dia.duracaoSegundos)}</p>
                </div>
                {dia.status === 'atual' && (
                  <button
                    onClick={concluir}
                    disabled={salvando}
                    className="w-full rounded-2xl bg-primary py-4 font-bold text-dark disabled:opacity-60"
                  >
                    {salvando ? 'Salvando...' : 'Concluí este treino'}
                  </button>
                )}
                {dia.status === 'concluido' && ultimoFeito?.dia === dia.dia && (
                  <button
                    onClick={desmarcar}
                    disabled={salvando}
                    className="w-full rounded-2xl border border-white/15 py-4 font-semibold text-white/80"
                  >
                    Desmarcar este dia
                  </button>
                )}
              </section>
            )}

            <section className="space-y-2">
              {desafio.dias.map((item) => {
                const aberto = item.dia === diaAberto
                const bloqueado = item.status === 'bloqueado'
                return (
                  <button
                    key={item.dia}
                    disabled={bloqueado}
                    onClick={() => setDiaAberto(item.dia)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left flex items-center gap-3 ${
                      aberto ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
                    } ${bloqueado ? 'opacity-40' : ''}`}
                  >
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.status === 'concluido' ? 'bg-primary text-dark' : 'bg-white/10 text-white'
                    }`}>
                      {item.status === 'concluido' ? '✓' : item.dia}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold truncate">{item.nome}</span>
                      <span className="block text-xs text-white/50">{formatarDuracao(item.duracaoSegundos)}</span>
                    </span>
                  </button>
                )
              })}
            </section>
          </>
        )}
      </div>
      <ToastContainer />
      <BottomTabs active="meu-plano" />
    </div>
  )
}
