import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUploadExerciciosPath } from '../utils/upload-paths';
import { MAX_FILE_SIZE, validateMediaFile, ACCEPTED_MEDIA_TYPES } from '../utils/file-validation';

// ============================================================================
// UPLOAD DE IMAGEM DE GRUPO MUSCULAR VISUAL
// ============================================================================

/**
 * Valida se ID é seguro (previne path traversal)
 * SEGURANÇA: Validação melhorada usando path.resolve() para garantir que não há path traversal
 */
function isValidId(id: string): boolean {
  if (!id || id.length === 0) return false;
  
  // Normalizar o ID removendo encoding
  try {
    const normalized = decodeURIComponent(id);
    
    // Verificar caracteres perigosos
    if (normalized.includes('..') || normalized.includes('/') || normalized.includes('\\')) {
      return false;
    }
    
    // UUID ou slug válido
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const slugPattern = /^[a-z0-9-]+$/i;
    
    return uuidPattern.test(normalized) || slugPattern.test(normalized);
  } catch (error) {
    // Se houver erro ao decodificar, rejeitar
    return false;
  }
}

const storageGrupoImagem = multer.diskStorage({
  destination: (req, file, cb) => {
    const grupoId = req.params.id;

    if (!grupoId || !isValidId(grupoId)) {
      return cb(new Error('ID do grupo é obrigatório e deve ser válido'), undefined as any);
    }

    try {
      const basePath = getUploadExerciciosPath();
      const baseDir = path.dirname(basePath);
      const uploadPath = path.join(baseDir, 'grupos-musculares', grupoId);
      
      // SEGURANÇA: Resolver caminho absoluto e verificar que está dentro do diretório base
      const resolvedPath = path.resolve(uploadPath);
      const resolvedBase = path.resolve(baseDir);
      
      // Verificar que o caminho resolvido começa com o diretório base (previne path traversal)
      if (!resolvedPath.startsWith(resolvedBase)) {
        return cb(new Error('Caminho de upload inválido'), undefined as any);
      }
      
      if (!fs.existsSync(resolvedPath)) {
        fs.mkdirSync(resolvedPath, { recursive: true });
      }
      cb(null, resolvedPath);
    } catch (error: any) {
      cb(new Error(`Erro ao criar diretório de upload: ${error.message}`), undefined as any);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const finalExt = validExts.includes(ext) ? ext : '.jpg';
    cb(null, `capa${finalExt}`);
  }
});

const fileFilterImagemGrupo = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const validMimes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!validExts.includes(ext) && !validMimes.includes(mimeType)) {
    return cb(new Error('Apenas imagens JPG, PNG ou WEBP são permitidas'));
  }

  cb(null, true);
};

export const uploadImagemGrupo = multer({
  storage: storageGrupoImagem,
  fileFilter: fileFilterImagemGrupo,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// ============================================================================
// UPLOAD DE IMAGEM PADRÃO DE TREINO (A-G)
// ============================================================================

const storageTreinoImagem = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const basePath = getUploadExerciciosPath();
      const uploadPath = path.join(path.dirname(basePath), 'treino-imagens');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    } catch (error: any) {
      cb(new Error(`Erro ao criar diretório de upload: ${error.message}`), undefined as any);
    }
  },
  filename: (req, file, cb) => {
    const letra = req.params.letra;
    if (!letra) {
      return cb(new Error('Letra do treino é obrigatória'), undefined as any);
    }
    const ext = path.extname(file.originalname).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const finalExt = validExts.includes(ext) ? ext : '.jpg';
    cb(null, `${letra.toUpperCase()}${finalExt}`);
  }
});

export const uploadTreinoImagem = multer({
  storage: storageTreinoImagem,
  fileFilter: fileFilterImagemGrupo, // Reutilizando filtro de imagem
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// ============================================================================
// UPLOAD DE IMAGEM DE CAPA DO BLOG
// ============================================================================

const storageBlogImagem = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const basePath = getUploadExerciciosPath();
      const baseDir = path.dirname(basePath);
      const uploadPath = path.join(baseDir, 'blog');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    } catch (error: any) {
      cb(new Error(`Erro ao criar diretório de upload: ${error.message}`), undefined as any);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const finalExt = validExts.includes(ext) ? ext : '.jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    cb(null, `capa-${timestamp}-${randomStr}${finalExt}`);
  }
});

const fileFilterBlogImagem = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const validMimes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!validExts.includes(ext) && !validMimes.includes(mimeType)) {
    return cb(new Error('Apenas imagens JPG, PNG ou WEBP são permitidas'));
  }

  cb(null, true);
};

export const uploadBlogImagem = multer({
  storage: storageBlogImagem,
  fileFilter: fileFilterBlogImagem,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// ============================================================================
// UPLOAD DE AVATAR DE AUTOR DO BLOG
// ============================================================================

const storageBlogAuthorAvatar = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const basePath = getUploadExerciciosPath();
      const baseDir = path.dirname(basePath);
      const uploadPath = path.join(baseDir, 'blog', 'authors');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    } catch (error: any) {
      cb(new Error(`Erro ao criar diretório de upload: ${error.message}`), undefined as any);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const finalExt = validExts.includes(ext) ? ext : '.jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    cb(null, `avatar-${timestamp}-${randomStr}${finalExt}`);
  }
});

export const uploadBlogAuthorAvatar = multer({
  storage: storageBlogAuthorAvatar,
  fileFilter: fileFilterBlogImagem,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

/**
 * Middleware para validar magic bytes de arquivos de imagem após upload
 * SEGURANÇA: Validação de magic bytes para prevenir upload de arquivos maliciosos
 */
export const validateImageMagicBytes = (req: any, res: any, next: any) => {
  if (!req.file) {
    return next();
  }

  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const detectedMimeType = validateMediaFile(fileBuffer);

    if (!detectedMimeType) {
      // Remover arquivo inválido
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: 'Arquivo inválido ou corrompido. Magic bytes não correspondem a um formato válido.'
      });
    }

    // Verificar se o tipo MIME detectado corresponde à extensão
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    // Verificar se o tipo MIME detectado está nos tipos aceitos e se a extensão corresponde
    const mimeTypeKey = detectedMimeType as keyof typeof ACCEPTED_MEDIA_TYPES;
    const expectedExtensions = ACCEPTED_MEDIA_TYPES[mimeTypeKey];
    
    if (!expectedExtensions || !(expectedExtensions as readonly string[]).includes(ext)) {
      // Remover arquivo com tipo MIME não correspondente
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: `Tipo de arquivo não corresponde à extensão. Detectado: ${detectedMimeType}, esperado para ${ext}`
      });
    }

    // Adicionar tipo MIME detectado ao req.file para uso posterior
    req.file.detectedMimeType = detectedMimeType;
    next();
  } catch (error: any) {
    // Em caso de erro, remover arquivo e retornar erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      error: 'Erro ao validar arquivo',
      message: error.message
    });
  }
};
