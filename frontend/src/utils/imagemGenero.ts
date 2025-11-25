type Genero = 'Masculino' | 'Feminino' | 'Outro' | null | undefined

const IMAGENS: Record<string, Record<'Masculino' | 'Feminino' | 'Outro', string>> = {
  plano: {
    Masculino: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=1200&q=80',
    Feminino: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    Outro: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80'
  },
  treino: {
    Masculino: 'https://images.unsplash.com/photo-1500482176473-cc94f9a9e1f1?auto=format&fit=crop&w=1200&q=80',
    Feminino: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    Outro: 'https://images.unsplash.com/photo-1526404079166-258d6a1b30b4?auto=format&fit=crop&w=1200&q=80'
  },
  treinos: {
    Masculino: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=1200&q=80',
    Feminino: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    Outro: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80'
  }
}

export function obterImagemPorGenero(genero: Genero, contexto: 'plano' | 'treino' | 'treinos') {
  const chave: 'Masculino' | 'Feminino' | 'Outro' =
    genero === 'Feminino' ? 'Feminino' : genero === 'Masculino' ? 'Masculino' : 'Outro'
  const mapa = IMAGENS[contexto]
  return mapa?.[chave] || IMAGENS.plano.Masculino
}

