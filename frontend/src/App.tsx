import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Cadastro from './pages/Cadastro'
import Checkout from './pages/Checkout'
import Confirmacao from './pages/Confirmacao'
import Treinos from './pages/Treinos'
import TreinoAtual from './pages/TreinoAtual'
import MeuPlano from './pages/MeuPlano'
import Historico from './pages/Historico'
import Perfil from './pages/Perfil'
import EvolucaoPeso from './pages/EvolucaoPeso'
import Evolucao from './pages/Evolucao'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import TreinoRapidoSelecaoGrupos from './pages/TreinoRapidoSelecaoGrupos'
import TreinoRapidoConfiguracao from './pages/TreinoRapidoConfiguracao'
import ProtectedRoute from './components/ProtectedRoute'
import GerenciarTreinos from './pages/GerenciarTreinos'
import Progresso from './pages/Progresso'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmacao" element={<Confirmacao />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas protegidas */}
          <Route path="/dashboard" element={<Navigate to="/meu-plano" replace />} />
          <Route
            path="/meu-plano"
            element={
              <ProtectedRoute>
                <MeuPlano />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treino"
            element={
              <ProtectedRoute>
                <Navigate to="/treinos" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treinos"
            element={
              <ProtectedRoute>
                <Treinos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treino/atual"
            element={
              <ProtectedRoute>
                <TreinoAtual />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treino-rapido"
            element={
              <ProtectedRoute>
                <TreinoRapidoSelecaoGrupos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treino-rapido/configuracao"
            element={
              <ProtectedRoute>
                <TreinoRapidoConfiguracao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progresso"
            element={
              <ProtectedRoute>
                <Progresso />
              </ProtectedRoute>
            }
          />
          <Route path="/estatisticas" element={<Navigate to="/progresso" replace />} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evolucao-peso"
            element={
              <ProtectedRoute>
                <EvolucaoPeso />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evolucao"
            element={
              <ProtectedRoute>
                <Evolucao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercicios"
            element={
              <ProtectedRoute>
                <GerenciarTreinos />
              </ProtectedRoute>
            }
          />
          <Route path="/gerenciar-treinos" element={<Navigate to="/exercicios" replace />} />
          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />
          <Route
            path="/admin"
            element={<Admin />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

