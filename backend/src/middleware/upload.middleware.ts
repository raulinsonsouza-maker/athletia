import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUploadExerciciosPath } from '../utils/upload-paths';
import { MAX_FILE_SIZE, ACCEPTED_EXTENSIONS, ACCEPTED_MEDIA_TYPES, getExtensionFromMimeType } from '../utils/file-validation';

// ============================================================================
// UPLOAD DE MÍDIA DE EXERCÍCIO (GIF, Imagens, Vídeos)
// ============================================================================

const storageExercicioMedia = multer.diskStorage({
  destination: (req, file, cb) => {
    const exercicioId = req.params.id;
    if (!exercicioId) {
      return cb(new Error('ID do exercício é obrigatório'), '');
    }

    const uploadPath = path.join(getUploadExerciciosPath(), exercicioId);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Salvar como arquivo temporário primeiro (será renomeado após validação)
    const ext = path.extname(file.originalname).toLowerCase();
    const validExt = ACCEPTED_EXTENSIONS.includes(ext) 
      ? ext 
      : getExtensionFromMimeType(file.mimetype);
    // Usar timestamp para evitar conflitos
    const timestamp = Date.now();
    cb(null, `exercicio.tmp.${timestamp}${validExt}`);
  }
});

// Filtro para aceitar mídias válidas (GIF, imagens, vídeos)
const fileFilterMedia = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  // Verificar extensão
  const isValidExt = ACCEPTED_EXTENSIONS.includes(ext);
  
  // Verificar MIME type
  const isValidMime = Object.keys(ACCEPTED_MEDIA_TYPES).includes(mimeType);

  if (!isValidExt && !isValidMime) {
    return cb(new Error(`Formato não suportado. Formatos aceitos: ${ACCEPTED_EXTENSIONS.join(', ')}`));
  }

  cb(null, true);
};

export const uploadGif = multer({
  storage: storageExercicioMedia,
  fileFilter: fileFilterMedia,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

// Configurar multer para upload múltiplo (bulk)
export const uploadGifsBulk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const tempPath = path.join(process.cwd(), 'upload', 'temp');
      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }
      cb(null, tempPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  }),
  fileFilter: fileFilterMedia,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 50 // Máximo 50 arquivos
  }
});

// ============================================================================
// UPLOAD DE IMAGEM DE GRUPO MUSCULAR VISUAL
// ============================================================================

const storageGrupoImagem = multer.diskStorage({
  destination: (req, file, cb) => {
    const grupoId = req.params.id;
    if (!grupoId) {
      return cb(new Error('ID do grupo é obrigatório'), '');
    }

    const uploadPath = path.join(process.cwd(), 'upload', 'grupos-musculares', grupoId);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `capa${ext}`);
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

