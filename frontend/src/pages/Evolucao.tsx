import { Navigate } from 'react-router-dom'

// Página de Evolução - redireciona para evolucao-peso por enquanto
// Futuramente pode ser expandida para incluir mais métricas
export default function Evolucao() {
  return <Navigate to="/evolucao-peso" replace />
}

