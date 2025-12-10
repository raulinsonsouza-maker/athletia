import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Cadastro from './pages/Cadastro'
import Checkout from './pages/Checkout'
import Confirmacao from './pages/Confirmacao'
import PagamentoSucesso from './pages/PagamentoSucesso'
import Treinos from './pages/Treinos'
import TreinoAtual from './pages/TreinoAtual'
import MeuPlano from './pages/MeuPlano'
import Historico from './pages/Historico'
import Perfil from './pages/Perfil'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import AdminGrupos from './pages/AdminGrupos'
import TreinoRapidoSelecaoGrupos from './pages/TreinoRapidoSelecaoGrupos'
import TreinoRapidoConfiguracao from './pages/TreinoRapidoConfiguracao'
import ProtectedRoute from './components/ProtectedRoute'
import Progresso from './pages/Progresso'
import Termos from './pages/Termos'
import Privacidade from './pages/Privacidade'
import Cookies from './pages/Cookies'

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
          <Route path="/pagamento-sucesso" element={<PagamentoSucesso />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/cookies" element={<Cookies />} />
          
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
          {/* Redirecionamentos de rotas antigas */}
          <Route path="/evolucao-peso" element={<Navigate to="/progresso" replace />} />
          <Route path="/evolucao" element={<Navigate to="/progresso" replace />} />
          <Route path="/exercicios" element={<Navigate to="/treinos" replace />} />
          <Route path="/gerenciar-treinos" element={<Navigate to="/treinos" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/grupos" element={<AdminGrupos />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

