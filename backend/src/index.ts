// IMPORTANTE: Carregar variáveis de ambiente ANTES de qualquer import
// Isso garante que as validações de JWT_SECRET nos módulos importados funcionem corretamente
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import perfilRoutes from './routes/perfil.routes';
import treinoRoutes from './routes/treino.routes';
import pesoRoutes from './routes/peso.routes';
import aiRoutes from './routes/ai.routes';
import adminRoutes from './routes/admin.routes';
import exercicioRoutes from './routes/exercicio.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { sincronizarTodosExerciciosComGrupos } from './services/grupo-muscular.service';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Criar pasta de uploads se não existir
const uploadDir = path.join(process.cwd(), 'upload', 'exercicios');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Rate limiting - Proteção contra brute force e DDoS
// Aumentado para permitir mais requisições legítimas
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // Máximo 500 requisições por IP a cada 15 minutos (aumentado de 100)
  message: {
    error: 'Muitas requisições. Por favor, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => req.method === 'OPTIONS', // Pular requisições CORS preflight
  skipSuccessfulRequests: false // Manter contagem de todas as requisições para proteção geral
});

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aplicar rate limiting geral em todas as rotas
app.use('/api/', generalLimiter);

// Servir arquivos estáticos de upload
const uploadExerciciosPath = path.join(process.cwd(), 'upload', 'exercicios');

// Middleware CORS específico para arquivos estáticos (ANTES das rotas)
app.use('/api/uploads/exercicios', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

// Rota específica para servir GIFs de exercícios (DEVE estar antes do express.static)
// Baseado na implementação do fitnessprogramer.com para servir GIFs de forma confiável

// Suporte para requisições OPTIONS (CORS preflight)
app.options('/api/uploads/exercicios/:id/exercicio.gif', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).send();
});

app.get('/api/uploads/exercicios/:id/exercicio.gif', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(uploadExerciciosPath, id, 'exercicio.gif');
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(filePath)) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[GIF Route] Arquivo não encontrado: ${filePath}`);
    }
    return res.status(404).json({
      error: 'GIF não encontrado',
      path: filePath
    });
  }

  // Verificar se é um arquivo válido
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(`[GIF Route] Caminho não é um arquivo: ${filePath}`);
      }
      return res.status(404).json({
        error: 'GIF não encontrado'
      });
    }
  } catch (err: any) {
    console.error(`[GIF Route] Erro ao verificar arquivo:`, err);
    return res.status(500).json({
      error: 'Erro ao acessar arquivo',
      message: err.message
    });
  }

  // Configurar headers ANTES de enviar o arquivo
  // Headers CORS (sem credentials para arquivos estáticos)
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Headers de cache e tipo de conteúdo
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Accept-Ranges', 'bytes');
  
  // Enviar arquivo usando stream
  const fileStream = fs.createReadStream(filePath);
  
  fileStream.on('error', (err) => {
    console.error(`[GIF Route] Erro ao ler arquivo:`, err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro ao servir arquivo',
        message: err.message
      });
    }
  });

  fileStream.on('open', () => {
    fileStream.pipe(res);
  });

  // Log de sucesso (apenas em desenvolvimento)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[GIF Route] Servindo GIF: ${id} -> ${filePath}`);
  }
});


// Servir outros arquivos estáticos (fallback)
app.use('/api/uploads/exercicios', express.static(uploadExerciciosPath, {
  setHeaders: (res, filePath) => {
    // Headers CORS (sem credentials para arquivos estáticos)
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Cache control para GIFs
    if (filePath.endsWith('.gif')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Log para debug (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  console.log(`📁 Servindo arquivos estáticos de: ${uploadExerciciosPath}`);
  console.log(`🔗 URL base: /api/uploads/exercicios`);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AthletIA API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/treino', treinoRoutes);
app.use('/api/peso', pesoRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/exercicios', exercicioRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.path 
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  }

  sincronizarTodosExerciciosComGrupos()
    .then(() => console.log('🧠 Grupos musculares sincronizados com exercícios.'))
    .catch((error) => console.error('⚠️ Falha ao sincronizar grupos musculares:', error));
});

