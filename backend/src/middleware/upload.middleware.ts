import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getUploadExerciciosPath } from '../utils/upload-paths';
import { MAX_FILE_SIZE } from '../utils/file-validation';

// ============================================================================
// UPLOAD DE IMAGEM DE GRUPO MUSCULAR VISUAL
// ============================================================================

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

