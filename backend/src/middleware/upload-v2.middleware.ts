import multer from 'multer';
import path from 'path';
import fs from 'fs';

/**
 * Middleware de upload de mídia - Versão 2 (Nova implementação limpa)
 * 
 * Aceita: GIF, JPEG, PNG, WebP, MP4, WebM
 * Tamanho máximo: 5MB
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Tipos aceitos
const ACCEPTED_MIME_TYPES = [
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm'
];

const ACCEPTED_EXTENSIONS = ['.gif', '.jpg', '.jpeg', '.png', '.webp', '.mp4', '.webm'];

// Storage temporário (arquivo será movido depois)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), 'upload', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || path.extname(file.path) || '.bin';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `temp-${uniqueSuffix}${ext}`);
  }
});

// Filtro de arquivo
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Verificar extensão
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Extensão não permitida. Use: ${ACCEPTED_EXTENSIONS.join(', ')}`));
  }

  // Verificar MIME type
  if (!ACCEPTED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Tipo de arquivo não permitido. Use: ${ACCEPTED_MIME_TYPES.join(', ')}`));
  }

  cb(null, true);
};

// Middleware de upload
export const uploadMediaMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

