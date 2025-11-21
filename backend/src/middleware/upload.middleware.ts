import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configurar storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const exercicioId = req.params.id;
    if (!exercicioId) {
      return cb(new Error('ID do exercício é obrigatório'), '');
    }

    // Usar process.cwd() para funcionar tanto em dev quanto em produção
    const uploadPath = path.join(process.cwd(), 'upload', 'exercicios', exercicioId);
    
    // Criar pasta se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Sempre usar o mesmo nome: exercicio.gif
    cb(null, 'exercicio.gif');
  }
});

// Filtro para aceitar apenas GIFs válidos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Verificar extensão e MIME type primeiro
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (ext !== '.gif' && mimeType !== 'image/gif') {
    return cb(new Error('Apenas arquivos GIF são permitidos'));
  }

  // Validação adicional será feita no middleware de validação após upload
  // pois precisamos ler o arquivo completo para validar magic bytes
  cb(null, true);
};

// Configurar multer para upload único
export const uploadGif = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Configurar multer para upload múltiplo (bulk)
export const uploadGifsBulk = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // Para bulk upload, salvar em pasta temporária
      const tempPath = path.join(process.cwd(), 'upload', 'temp');
      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }
      cb(null, tempPath);
    },
    filename: (req, file, cb) => {
      // Manter nome original para identificar exercício
      cb(null, file.originalname);
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por arquivo
    files: 50 // Máximo 50 arquivos
  }
});

