import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { validateMediaFile, ACCEPTED_EXTENSIONS, ACCEPTED_MEDIA_TYPES, MAX_FILE_SIZE } from '../utils/file-validation';

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

/**
 * Middleware adicional para validar magic bytes após upload
 * SEGURANÇA: Validação de magic bytes para prevenir upload de arquivos maliciosos
 */
export const validateUploadedFile = (req: any, res: any, next: any) => {
  if (!req.file) {
    return next();
  }

  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const detectedMimeType = validateMediaFile(fileBuffer);

    if (!detectedMimeType) {
      // Remover arquivo inválido
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'Arquivo inválido ou corrompido. Magic bytes não correspondem a um formato válido.'
      });
    }

    // Verificar se o tipo MIME detectado corresponde à extensão
    const ext = path.extname(req.file.originalname).toLowerCase();
    const expectedMimeTypes = ACCEPTED_MEDIA_TYPES[detectedMimeType as keyof typeof ACCEPTED_MEDIA_TYPES];
    
    if (!expectedMimeTypes || !expectedMimeTypes.includes(ext)) {
      // Remover arquivo com tipo MIME não correspondente
      fs.unlinkSync(req.file.path);
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

export const uploadMediaMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

