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
import exercicioMediaRoutes from './routes/exercicio-media.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import webhookRoutes from './routes/webhook.routes';
import paymentRoutes from './routes/payment.routes';
import { sincronizarTodosExerciciosComGrupos } from './services/grupo-muscular.service';
import { getUploadExerciciosPath, getImagensBancoPathCandidates } from './utils/upload-paths';
import { slugify } from './utils/slugify';
import { getPlaceholderMedia } from './utils/media-placeholders';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configurar trust proxy para funcionar atrás de nginx/proxy reverso
// Confiar apenas em 1 proxy (nginx) para segurança do rate limiting
// Isso permite que express-rate-limit funcione corretamente com X-Forwarded-For
// sem permitir bypass trivial do rate limiting
app.set('trust proxy', 1);

// Criar pasta de uploads se não existir (já é feito dentro de getUploadExerciciosPath, mas garantimos aqui também)
const uploadDir = getUploadExerciciosPath();
console.log(`[INIT] Diretório de upload de exercícios configurado: ${uploadDir}`);
console.log(`[INIT] Diretório existe: ${fs.existsSync(uploadDir) ? 'SIM' : 'NÃO'}`);

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
const uploadExerciciosPath = getUploadExerciciosPath();
const uploadGruposPath = path.join(process.cwd(), 'upload', 'grupos-musculares');

// Log do caminho configurado (sempre, para debug)
console.log(`[CONFIG] Caminho de upload de exercícios: ${uploadExerciciosPath}`);
console.log(`[CONFIG] Rota virtual: /api/uploads/exercicios`);
console.log(`[CONFIG] Mapeamento: /api/uploads/exercicios -> ${uploadExerciciosPath}`);

// NOVA ROTA DE MÍDIA DE EXERCÍCIOS (Versão 2 - Implementação limpa)
// Estrutura: /api/exercicios/:exercicioId/media.*
app.use('/api/exercicios', exercicioMediaRoutes);

// Servir imagens de grupos musculares (PNG/JPG/WEBP)
app.use('/api/uploads/grupos-musculares', express.static(uploadGruposPath, {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.webp')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Servir imagens padrão de treino (A-G)
const uploadTreinoImagensPath = path.join(path.dirname(uploadExerciciosPath), 'treino-imagens');
app.use('/api/uploads/treino-imagens', express.static(uploadTreinoImagensPath, {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.webp')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Servir imagens do banco com múltiplos caminhos candidatos
const imagensBancoCandidates = getImagensBancoPathCandidates();
const resolveImagemBancoArquivo = (nomeArquivo: string): { filePath: string; basePath: string } | null => {
  for (const basePath of imagensBancoCandidates) {
    const candidatePath = path.join(basePath, nomeArquivo);
    if (fs.existsSync(candidatePath)) {
      return { filePath: candidatePath, basePath };
    }
  }
  return null;
};

const primaryBancoPath =
  imagensBancoCandidates.find((candidate) => fs.existsSync(candidate)) ||
  imagensBancoCandidates[imagensBancoCandidates.length - 1];
console.log(`[CONFIG] Banco de imagens (primary): ${primaryBancoPath} -> /api/imagens-banco`);
if (process.env.NODE_ENV !== 'production') {
  console.log('[CONFIG] Candidatos banco de imagens:', imagensBancoCandidates);
}

// Middleware CORS para imagens do banco
app.use('/api/imagens-banco', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

// Rota para servir imagens do banco
app.get('/api/imagens-banco/:nomeArquivo', (req, res) => {
  const { nomeArquivo } = req.params;

  // Validar nome do arquivo (prevenir path traversal)
  if (nomeArquivo.includes('..') || nomeArquivo.includes('/') || nomeArquivo.includes('\\')) {
    return res.status(400).json({ error: 'Nome de arquivo inválido' });
  }

  const resolved = resolveImagemBancoArquivo(nomeArquivo);
  if (!resolved) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[Imagens Banco] Arquivo não encontrado em candidatos: ${nomeArquivo}`);
      console.error('[Imagens Banco] Candidatos:', imagensBancoCandidates);
    }
    return res.status(404).json({
      error: 'Imagem não encontrada',
      nomeArquivo,
      candidatos: imagensBancoCandidates
    });
  }

  const { filePath, basePath } = resolved;

  // Verificar se é um arquivo válido e obter stats
  let stats;
  try {
    stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return res.status(404).json({
        error: 'Imagem não encontrada'
      });
    }
  } catch (err: any) {
    console.error(`[Imagens Banco] Erro ao verificar arquivo:`, err);
    return res.status(500).json({
      error: 'Erro ao acessar arquivo',
      message: err.message
    });
  }

  // Determinar Content-Type baseado na extensão
  const ext = path.extname(nomeArquivo).toLowerCase();
  let contentType = 'image/jpeg'; // padrão
  if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.svg') contentType = 'image/svg+xml';

  // Configurar headers
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Cache headers otimizados para imagens estáticas (1 ano)
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString());
  res.setHeader('ETag', `"${stats.mtime.getTime()}"`);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Accept-Ranges', 'bytes');

  // Enviar arquivo usando stream
  const fileStream = fs.createReadStream(filePath);

  fileStream.on('error', (err) => {
    console.error(`[Imagens Banco] Erro ao ler arquivo:`, err);
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
    console.log(`[Imagens Banco] Servindo ${nomeArquivo} a partir de ${basePath}`);
  }
});

// Log para debug (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  console.log(`[UPLOAD] Exercícios em: ${uploadExerciciosPath} -> /api/uploads/exercicios`);
  console.log(`[UPLOAD] Grupos musculares em: ${uploadGruposPath} -> /api/uploads/grupos-musculares`);
  console.log(`[IMAGENS BANCO] Diretório: ${primaryBancoPath} -> /api/imagens-banco`);
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
app.use('/api/webhooks', webhookRoutes);
app.use('/api/payment', paymentRoutes);

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

