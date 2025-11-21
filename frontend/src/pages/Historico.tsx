import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { TreinoCompleto } from '../types/treino.types'
import { buscarHistoricoTreinos } from '../services/treino.service'
import TreinoLista from '../components/treino/TreinoLista'

type Treino = TreinoCompleto

export default function Historico() {
  const [treinos, setTreinos] = useState<Treino[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    carregarHistorico()
  }, [])

  const carregarHistorico = async () => {
    try {
      setLoading(true)
      setError('')
      const treinos = await buscarHistoricoTreinos(30)
      setTreinos(treinos || [])
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err)
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Erro ao carregar histórico'
      setError(errorMessage)
      setTreinos([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto"></div>
          <p className="mt-4 text-light-muted">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar showBack />

      <main className="container-custom section">
        {error && (
          <div className="card border-error/50 bg-error/10 mb-6">
            <p className="text-error">{error}</p>
          </div>
        )}

        <TreinoLista
          treinos={treinos}
          variante="completo"
          mostrarFiltros={true}
          onTreinoClick={(treino) => {
            // Pode navegar para detalhes se necessário
            console.log('Treino clicado:', treino.id)
          }}
          emptyMessage="Nenhum treino encontrado no histórico."
        />
      </main>
    </div>
  )
}

