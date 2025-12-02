import fs from 'fs';
import path from 'path';
import { getUploadExerciciosPath } from '../utils/upload-paths';
import { validateMediaFile, ACCEPTED_EXTENSIONS, ACCEPTED_MEDIA_TYPES, MAX_FILE_SIZE } from '../utils/file-validation';
import { logger } from '../lib/logger';

/**
 * Obtém o caminho do arquivo de mídia para um exercício
 * IMPORTANTE: exercicioId deve ser o UUID do exercício (não slug)
 */
export async function getMediaFilePath(exercicioId: string, extension?: string): Promise<string | null> {
  const basePath = getUploadExerciciosPath();
  const exercicioPath = path.join(basePath, exercicioId);
  
  // Verificar se o diretório do exercício existe
  if (!fs.existsSync(exercicioPath)) {
    logger.warn(`Diretório do exercício não existe: ${exercicioPath}`, 'exercicio-media.service');
    return null;
  }
  
  if (extension) {
    const filePath = path.join(exercicioPath, `media${extension}`);
    if (fs.existsSync(filePath)) {
      logger.debug(`Arquivo encontrado: ${filePath}`, 'exercicio-media.service');
      return filePath;
    }
  }
  
  // Se não tem extensão ou não encontrou com a extensão específica, procurar por qualquer arquivo de mídia
  try {
    const files = fs.readdirSync(exercicioPath);
    const mediaFile = files.find(f => f.startsWith('media.'));
    if (mediaFile) {
      const filePath = path.join(exercicioPath, mediaFile);
      logger.debug(`Arquivo de mídia encontrado: ${filePath}`, 'exercicio-media.service');
      return filePath;
    }
  } catch (error: any) {
    logger.error(`Erro ao ler diretório ${exercicioPath}: ${error.message}`, 'exercicio-media.service');
  }
  
  logger.warn(`Nenhuma mídia encontrada para exercício ${exercicioId}`, 'exercicio-media.service');
  return null;
}

/**
 * Salva um arquivo de mídia para um exercício
 */
export async function saveMediaFile(exercicioId: string, tempPath: string, extension: string): Promise<string> {
  const basePath = getUploadExerciciosPath();
  const exercicioPath = path.join(basePath, exercicioId);
  
  // GARANTIR que o diretório existe (PASSO 3 - Criação automática)
  if (!fs.existsSync(exercicioPath)) {
    fs.mkdirSync(exercicioPath, { recursive: true });
    logger.info(`Diretório criado automaticamente: ${exercicioPath}`, 'exercicio-media.service');
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
