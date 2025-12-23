import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoadingFallback from './components/LoadingFallback'
import ChatWidget from './components/ChatWidget'

// Páginas críticas - manter no bundle inicial (Login e Register)
import Login from './pages/Login'
import Register from './pages/Register'

// Lazy load - Rotas públicas secundárias
const Landing = lazy(() => import('./pages/Landing'))
const Cadastro = lazy(() => import('./pages/Cadastro'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Confirmacao = lazy(() => import('./pages/Confirmacao'))
const PagamentoSucesso = lazy(() => import('./pages/PagamentoSucesso'))
const Termos = lazy(() => import('./pages/Termos'))
const Privacidade = lazy(() => import('./pages/Privacidade'))
const Cookies = lazy(() => import('./pages/Cookies'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const TrialExpirado = lazy(() => import('./pages/TrialExpirado'))
const OnePage = lazy(() => import('./pages/OnePage'))

// Lazy load - Rotas protegidas
const Treinos = lazy(() => import('./pages/Treinos'))
const TreinoAtual = lazy(() => import('./pages/TreinoAtual'))
const MeuPlano = lazy(() => import('./pages/MeuPlano'))
const Historico = lazy(() => import('./pages/Historico'))
const Perfil = lazy(() => import('./pages/Perfil'))
const TreinoRapidoSelecaoGrupos = lazy(() => import('./pages/TreinoRapidoSelecaoGrupos'))
const TreinoRapidoConfiguracao = lazy(() => import('./pages/TreinoRapidoConfiguracao'))
const Progresso = lazy(() => import('./pages/Progresso'))

// Lazy load - Páginas Admin (todas em chunk separado)
const Admin = lazy(() => import('./pages/Admin'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const AdminGrupos = lazy(() => import('./pages/AdminGrupos'))
const AdminBlog = lazy(() => import('./pages/AdminBlog'))
const AdminBlogCategories = lazy(() => import('./pages/AdminBlogCategories'))
const AdminBlogAuthors = lazy(() => import('./pages/AdminBlogAuthors'))
const AdminBlogCTAs = lazy(() => import('./pages/AdminBlogCTAs'))
const AdminBlogSettings = lazy(() => import('./pages/AdminBlogSettings'))

// Lazy load - Blog pages
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const BlogCategory = lazy(() => import('./pages/BlogCategory'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <ChatWidget />
        <Routes>
          {/* Rotas públicas */}
          <Route 
            path="/" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Landing />
              </Suspense>
            } 
          />
          <Route 
            path="/one-page" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <OnePage />
              </Suspense>
            } 
          />
          <Route 
            path="/cadastro" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Cadastro />
              </Suspense>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Checkout />
              </Suspense>
            } 
          />
          <Route 
            path="/confirmacao" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Confirmacao />
              </Suspense>
            } 
          />
          <Route 
            path="/pagamento-sucesso" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <PagamentoSucesso />
              </Suspense>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/termos" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Termos />
              </Suspense>
            } 
          />
          <Route 
            path="/privacidade" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Privacidade />
              </Suspense>
            } 
          />
          <Route 
            path="/cookies" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Cookies />
              </Suspense>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ResetPassword />
              </Suspense>
            } 
          />
          <Route 
            path="/trial-expirado" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <TrialExpirado />
              </Suspense>
            } 
          />
          <Route 
            path="/blog" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Blog />
              </Suspense>
            } 
          />
          <Route 
            path="/blog/categoria/:slug" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <BlogCategory />
              </Suspense>
            } 
          />
          <Route 
            path="/blog/:slug" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <BlogPost />
              </Suspense>
            } 
          />
          
          {/* Rotas protegidas */}
          <Route path="/dashboard" element={<Navigate to="/meu-plano" replace />} />
          <Route
            path="/meu-plano"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MeuPlano />
                </Suspense>
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
                <Suspense fallback={<LoadingFallback />}>
                  <Treinos />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/treino/atual"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <TreinoAtual />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/treino-rapido"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <TreinoRapidoSelecaoGrupos />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/treino-rapido/configuracao"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <TreinoRapidoConfiguracao />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Historico />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progresso"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Progresso />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/estatisticas" element={<Navigate to="/progresso" replace />} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <Perfil />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* Redirecionamentos de rotas antigas */}
          <Route path="/evolucao-peso" element={<Navigate to="/progresso" replace />} />
          <Route path="/evolucao" element={<Navigate to="/progresso" replace />} />
          <Route path="/exercicios" element={<Navigate to="/treinos" replace />} />
          <Route path="/gerenciar-treinos" element={<Navigate to="/treinos" replace />} />
          
          {/* Rotas Admin - todas lazy loaded */}
          <Route 
            path="/admin/login" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminLogin />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/grupos" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminGrupos />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/blog" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminBlog />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/blog/categorias" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminBlogCategories />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/blog/autores" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminBlogAuthors />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/blog/ctas" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminBlogCTAs />
              </Suspense>
            } 
          />
          <Route 
            path="/admin/blog/configuracoes" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminBlogSettings />
              </Suspense>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Admin />
              </Suspense>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

