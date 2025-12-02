import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { validateMediaFile, ACCEPTED_EXTENSIONS, MAX_FILE_SIZE } from '../utils/file-validation';

// Diretório temporário para uploads
const uploadTempDir = path.join(os.tmpdir(), 'athletia-uploads');

// Garantir que o diretório temporário existe
if (!fs.existsSync(uploadTempDir)) {
  fs.mkdirSync(uploadTempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadTempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    cb(null, `upload-${timestamp}-${randomSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Verificar extensão
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Formato não suportado. Extensões aceitas: ${ACCEPTED_EXTENSIONS.join(', ')}`));
  }
  
  cb(null, true);
};

export const uploadMediaMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

