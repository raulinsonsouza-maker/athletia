import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUploadExerciciosPath } from '../utils/upload-paths';
import { MAX_FILE_SIZE, ACCEPTED_EXTENSIONS, ACCEPTED_MEDIA_TYPES, getExtensionFromMimeType, isAcceptedExtension } from '../utils/file-validation';

// ============================================================================
// UPLOAD DE MÍDIA DE EXERCÍCIO (GIF, Imagens, Vídeos)
// ============================================================================

/**
 * Sanitiza nome de arquivo para prevenir path traversal
 */
function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '').replace(/\//g, '').replace(/\\/g, '');
  // Remove caracteres perigosos
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');
  // Limita tamanho
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }
  return sanitized || 'file';
}

/**
 * Valida se ID é seguro (previne path traversal)
 */
function isValidId(id: string): boolean {
  if (!id || id.length === 0) return false;
  // UUID ou slug válido (sem path traversal)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const slugPattern = /^[a-z0-9-]+$/i;
  return uuidPattern.test(id) || (slugPattern.test(id) && !id.includes('..') && !id.includes('/') && !id.includes('\\'));
}

const storageExercicioMedia = multer.diskStorage({
  destination: (req, file, cb) => {
    const exercicioId = req.params.id;
    
    // CORREÇÃO PROBLEMA 1: Não passar string vazia no callback de erro
    if (!exercicioId || !isValidId(exercicioId)) {
      return cb(new Error('ID do exercício é obrigatório e deve ser válido'), undefined as any);
    }

    // CORREÇÃO PROBLEMA 7: Usar função helper que já trata process.cwd() corretamente
    const uploadPath = path.join(getUploadExerciciosPath(), exercicioId);
    
    try {
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    } catch (error: any) {
      cb(new Error(`Erro ao criar diretório de upload: ${error.message}`), undefined as any);
    }
  },
  filename: (req, file, cb) => {
    // Salvar como arquivo temporário primeiro (será renomeado após validação de magic bytes)
    const ext = path.extname(file.originalname).toLowerCase();
    const validExt = isAcceptedExtension(ext) 
      ? ext 
      : getExtensionFromMimeType(file.mimetype);
    // Usar timestamp para evitar conflitos
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    cb(null, `exercicio.tmp.${timestamp}.${randomSuffix}${validExt}`);
  }
});

// Filtro para aceitar mídias válidas (GIF, imagens, vídeos)
// CORREÇÃO PROBLEMA 2, 3, 4: Validação rigorosa - SEM aceitar MIME genérico
const fileFilterMedia = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype || '';

  // Verificar extensão
  const isValidExt = isAcceptedExtension(ext);
  
  // CORREÇÃO PROBLEMA 2: Verificar se ACCEPTED_MEDIA_TYPES é objeto e tem a chave
  // ACCEPTED_MEDIA_TYPES é um objeto { 'image/gif': ['.gif'], ... }
  const isValidMime = mimeType in ACCEPTED_MEDIA_TYPES;
  
  // CORREÇÃO PROBLEMA 3 e 4: NÃO aceitar MIME genérico ou application/octet-stream
  // A validação real será feita pelos magic bytes no processMediaFile
  // Aqui só aceitamos se TANTO extensão QUANTO MIME type forem válidos
  if (isValidExt && isValidMime) {
    return cb(null, true);
  }

  // Se extensão é válida mas MIME não, ainda aceitamos (será validado por magic bytes depois)
  // Mas NUNCA aceitamos MIME genérico sem extensão válida
  if (isValidExt && !mimeType) {
    return cb(null, true);
  }

  // CORREÇÃO PROBLEMA 9: Mensagem de erro clara
  return cb(new Error(`Formato não suportado. Extensão: ${ext || 'nenhuma'}, MIME: ${mimeType || 'nenhum'}. Formatos aceitos: ${ACCEPTED_EXTENSIONS.join(', ')}`));
};


// ============================================================================
// UPLOAD DE IMAGEM DE GRUPO MUSCULAR VISUAL
// ============================================================================

const storageGrupoImagem = multer.diskStorage({
  destination: (req, file, cb) => {
    const grupoId = req.params.id;
    
    // CORREÇÃO PROBLEMA 1: Não passar string vazia no callback de erro
    if (!grupoId || !isValidId(grupoId)) {
      return cb(new Error('ID do grupo é obrigatório e deve ser válido'), undefined as any);
    }

    try {
      // CORREÇÃO PROBLEMA 7 e 8: Usar estrutura padronizada baseada em getUploadExerciciosPath
      const basePath = getUploadExerciciosPath();
      const uploadPath = path.join(path.dirname(basePath), 'grupos-musculares', grupoId);
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
    // Validar extensão
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

