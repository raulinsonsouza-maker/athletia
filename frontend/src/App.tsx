import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Cadastro from './pages/Cadastro'
import Checkout from './pages/Checkout'
import Confirmacao from './pages/Confirmacao'
import Dashboard from './pages/Dashboard'
import TreinoDoDia from './pages/TreinoDoDia'
import Historico from './pages/Historico'
import Estatisticas from './pages/Estatisticas'
import Perfil from './pages/Perfil'
import EvolucaoPeso from './pages/EvolucaoPeso'
import MeusTreinos from './pages/MeusTreinos'
import GerenciarTreinosRecorrentes from './pages/GerenciarTreinosRecorrentes'
import ConfigurarTreinosPadrao from './pages/ConfigurarTreinosPadrao'
import MinhaSemana from './pages/MinhaSemana'
import Conquistas from './pages/Conquistas'
import Evolucao from './pages/Evolucao'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
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
            path="/treino"
            element={
              <ProtectedRoute>
                <TreinoDoDia />
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
                <MeusTreinos />
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

