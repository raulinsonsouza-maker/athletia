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
import webhookRoutes from './routes/webhook.routes';
import paymentRoutes from './routes/payment.routes';
import { sincronizarTodosExerciciosComGrupos } from './services/grupo-muscular.service';
import { getUploadExerciciosPath, getImagensBancoPathCandidates } from './utils/upload-paths';
import { slugify } from './utils/slugify';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Criar pasta de uploads se não existir
const uploadDir = getUploadExerciciosPath();
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
const uploadExerciciosPath = getUploadExerciciosPath();
const uploadGruposPath = path.join(process.cwd(), 'upload', 'grupos-musculares');

// Log do caminho configurado (sempre, para debug)
console.log(`[CONFIG] Caminho de upload de exercícios: ${uploadExerciciosPath}`);
console.log(`[CONFIG] Rota virtual: /api/uploads/exercicios`);
console.log(`[CONFIG] Mapeamento: /api/uploads/exercicios -> ${uploadExerciciosPath}`);

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

app.get('/api/uploads/exercicios/:id/exercicio.gif', async (req, res) => {
  const { id } = req.params;
  const requestedId = id.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedId);
  const manualAliases: Record<string, string> = {
    'puxada-frontal': 'puxada-frente',
    'puxada frente': 'puxada-frente',
    'puxada-frente': 'puxada-frente'
  };

  const addCandidate = (set: Set<string>, candidate?: string | null) => {
    if (!candidate) return;
    const trimmed = candidate.trim();
    if (!trimmed) return;
    set.add(trimmed);
    const alias = manualAliases[trimmed];
    if (alias) {
      set.add(alias);
    }
  };

  const candidateFolders = new Set<string>();
  addCandidate(candidateFolders, requestedId);
  if (!isUuid) {
    addCandidate(candidateFolders, requestedId.toLowerCase());
    addCandidate(candidateFolders, requestedId.replace(/_/g, '-'));
    addCandidate(candidateFolders, requestedId.replace(/\s+/g, '-'));
    addCandidate(candidateFolders, slugify(requestedId));
  }

  const resolveExistingFolder = (): string | null => {
    for (const folder of candidateFolders) {
      const candidatePath = path.join(uploadExerciciosPath, folder, 'exercicio.gif');
      if (fs.existsSync(candidatePath)) {
        return folder;
      }
    }
    return null;
  };

  let folderName = resolveExistingFolder();

  if (!folderName && !isUuid) {
    try {
      const { prisma } = await import('./lib/prisma');
      const searchTerm = requestedId.replace(/[-_]+/g, ' ').trim();
      const exercicio = await prisma.exercicio.findFirst({
        where: {
          OR: [
            { id: requestedId },
            { nome: { equals: requestedId, mode: 'insensitive' as const } },
            ...(searchTerm
              ? [{ nome: { contains: searchTerm, mode: 'insensitive' as const } }]
              : [])
          ]
        },
        select: {
          id: true,
          nome: true,
          gifUrl: true
        }
      });

      if (exercicio) {
        addCandidate(candidateFolders, exercicio.id);
        addCandidate(candidateFolders, slugify(exercicio.nome));
        addCandidate(candidateFolders, slugify(exercicio.nome, 'exercicio'));

        if (exercicio.gifUrl) {
          const match = exercicio.gifUrl.match(/exercicios[\/\\]([^\/\\]+)[\/\\]exercicio\.gif$/);
          if (match && match[1]) {
            addCandidate(candidateFolders, match[1]);
          }
        }
      }

      folderName = resolveExistingFolder();
    } catch (dbError) {
      console.error('[GIF Route] Erro ao buscar exercício no banco:', dbError);
    }
  }

  if (!folderName) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[GIF Route] Nenhum GIF encontrado para ID:', requestedId);
      console.error('[GIF Route] Candidatos tentados:', Array.from(candidateFolders));
      try {
        const dirContents = fs.readdirSync(uploadExerciciosPath);
        console.error('[GIF Route] Conteúdo do diretório (primeiros 20):', dirContents.slice(0, 20));
      } catch (err) {
        console.error('[GIF Route] Erro ao listar diretório:', err);
      }
    }
    return res.status(404).json({
      error: 'GIF não encontrado',
      message: 'Nenhum arquivo correspondente foi localizado',
      tried: Array.from(candidateFolders)
    });
  }

  const filePath = path.join(uploadExerciciosPath, folderName, 'exercicio.gif');
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[GIF Route] Servindo ${requestedId} a partir de pasta ${folderName}`);
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

    // Verificar magic bytes para garantir que é realmente um GIF
    // Isso previne servir arquivos JPEG ou outros formatos com extensão .gif
    const fileBuffer = fs.readFileSync(filePath);
    const isValidGif = (buffer: Buffer): boolean => {
      const gif87a = Buffer.from('GIF87a', 'ascii');
      const gif89a = Buffer.from('GIF89a', 'ascii');
      const header = buffer.slice(0, 6);
      return header.equals(gif87a) || header.equals(gif89a);
    };

    if (!isValidGif(fileBuffer)) {
      console.error(`[GIF Route] Arquivo não é um GIF válido (magic bytes): ${filePath}`);
      return res.status(400).json({
        error: 'Arquivo não é um GIF válido',
        path: filePath,
        message: 'O arquivo não possui a assinatura mágica de um GIF (GIF87a ou GIF89a)'
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
  else if (ext === '.gif') contentType = 'image/gif';
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

