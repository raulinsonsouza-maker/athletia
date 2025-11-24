import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Cadastro from './pages/Cadastro'
import Checkout from './pages/Checkout'
import Confirmacao from './pages/Confirmacao'
import Dashboard from './pages/Dashboard'
import Treinos from './pages/Treinos'
import TreinoAtual from './pages/TreinoAtual'
import MeuPlano from './pages/MeuPlano'
import Historico from './pages/Historico'
import Estatisticas from './pages/Estatisticas'
import Perfil from './pages/Perfil'
import EvolucaoPeso from './pages/EvolucaoPeso'
import GerenciarTreinosRecorrentes from './pages/GerenciarTreinosRecorrentes'
import ConfigurarTreinosPadrao from './pages/ConfigurarTreinosPadrao'
import GerenciarTreinos from './pages/GerenciarTreinos'
import MinhaSemana from './pages/MinhaSemana'
import Conquistas from './pages/Conquistas'
import Evolucao from './pages/Evolucao'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import TreinoRapidoSelecaoGrupos from './pages/TreinoRapidoSelecaoGrupos'
import TreinoRapidoConfiguracao from './pages/TreinoRapidoConfiguracao'
import ProtectedRoute from './components/ProtectedRoute'

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
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
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
                <Treinos />
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
            path="/estatisticas"
            element={
              <ProtectedRoute>
                <Estatisticas />
              </ProtectedRoute>
            }
          />
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
            path="/minha-semana"
            element={
              <ProtectedRoute>
                <MinhaSemana />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conquistas"
            element={
              <ProtectedRoute>
                <Conquistas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meus-treinos"
            element={
              <ProtectedRoute>
                <Navigate to="/gerenciar-treinos" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/treinos-recorrentes"
            element={
              <ProtectedRoute>
                <GerenciarTreinosRecorrentes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configurar-treinos"
            element={
              <ProtectedRoute>
                <ConfigurarTreinosPadrao />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gerenciar-treinos"
            element={
              <ProtectedRoute>
                <GerenciarTreinos />
              </ProtectedRoute>
            }
          />
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

