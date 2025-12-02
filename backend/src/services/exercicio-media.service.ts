import fs from 'fs';
import path from 'path';
import { getUploadExerciciosPath } from '../utils/upload-paths';
import { validateMediaFile, ACCEPTED_EXTENSIONS, ACCEPTED_MEDIA_TYPES, MAX_FILE_SIZE } from '../utils/file-validation';

/**
 * Obtém o caminho do arquivo de mídia para um exercício
 */
export async function getMediaFilePath(exercicioId: string, extension?: string): Promise<string | null> {
  const basePath = getUploadExerciciosPath();
  const exercicioPath = path.join(basePath, exercicioId);
  
  if (extension) {
    const filePath = path.join(exercicioPath, `media${extension}`);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  
  // Se não tem extensão, procurar por qualquer arquivo de mídia
  if (fs.existsSync(exercicioPath)) {
    const files = fs.readdirSync(exercicioPath);
    const mediaFile = files.find(f => f.startsWith('media.'));
    if (mediaFile) {
      return path.join(exercicioPath, mediaFile);
    }
  }
  
  return null;
}

/**
 * Salva um arquivo de mídia para um exercício
 */
export async function saveMediaFile(exercicioId: string, tempPath: string, extension: string): Promise<string> {
  const basePath = getUploadExerciciosPath();
  const exercicioPath = path.join(basePath, exercicioId);
  
  // Criar diretório se não existir
  if (!fs.existsSync(exercicioPath)) {
    fs.mkdirSync(exercicioPath, { recursive: true });
  }
  
  const finalPath = path.join(exercicioPath, `media${extension}`);
  
  // Remover arquivo antigo se existir
  if (fs.existsSync(finalPath)) {
    fs.unlinkSync(finalPath);
  }
  
  // Mover arquivo temporário para o destino final
  fs.renameSync(tempPath, finalPath);
  
  // Retornar URL relativa
  return `/api/exercicios/${exercicioId}/media${extension}`;
}

/**
 * Remove o arquivo de mídia de um exercício
 */
export async function deleteMediaFile(exercicioId: string): Promise<void> {
  const basePath = getUploadExerciciosPath();
  const exercicioPath = path.join(basePath, exercicioId);
  
  if (fs.existsSync(exercicioPath)) {
    const files = fs.readdirSync(exercicioPath);
    const mediaFile = files.find(f => f.startsWith('media.'));
    if (mediaFile) {
      fs.unlinkSync(path.join(exercicioPath, mediaFile));
    }
  }
}

/**
 * Obtém o Content-Type baseado na extensão do arquivo
 */
export function getContentType(extension: string): string {
  const ext = extension.toLowerCase();
  
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.webm') return 'video/webm';
  
  return 'application/octet-stream';
}

export { ACCEPTED_MEDIA_TYPES, ACCEPTED_EXTENSIONS, MAX_FILE_SIZE, validateMediaFile };
