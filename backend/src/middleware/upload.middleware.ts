import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUploadExerciciosPath } from '../utils/upload-paths';

// ============================================================================
// UPLOAD DE GIF DE EXERCÍCIO
// ============================================================================

const storageExercicioGif = multer.diskStorage({
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
    cb(null, 'exercicio.gif');
  }
});

// Filtro para aceitar apenas GIFs válidos
const fileFilterGif = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (ext !== '.gif' && mimeType !== 'image/gif') {
    return cb(new Error('Apenas arquivos GIF são permitidos'));
  }

  cb(null, true);
};

export const uploadGif = multer({
  storage: storageExercicioGif,
  fileFilter: fileFilterGif,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
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
  fileFilter: fileFilterGif,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por arquivo
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
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

