import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Serviço de mídia de exercícios - Versão 2 (Nova implementação limpa)
 * 
 * Estrutura de pastas:
 * /upload/exercicios/{exercicioId}/media.{ext}
 * 
 * Onde exercicioId é sempre o UUID do exercício no banco
 */

// Caminho base para uploads de exercícios
function getUploadPath(): string {
  const basePath = process.env.UPLOAD_EXERCICIOS_PATH || path.join(process.cwd(), 'upload', 'exercicios');
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }
  return basePath;
}

/**
 * Resolve o caminho do arquivo de mídia de um exercício
 * @param exercicioId - UUID do exercício
 * @param extension - Extensão do arquivo (opcional, tenta todas se não especificado)
 * @returns Caminho do arquivo ou null se não encontrado
 */
export async function getMediaFilePath(exercicioId: string, extension?: string): Promise<string | null> {
  // Validar UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(exercicioId)) {
    console.warn(`[MediaV2] ID inválido (não é UUID): ${exercicioId}`);
    return null;
  }

  // Verificar se exercício existe no banco
  const exercicio = await prisma.exercicio.findUnique({
    where: { id: exercicioId },
    select: { id: true }
  });

  if (!exercicio) {
    console.warn(`[MediaV2] Exercício não encontrado: ${exercicioId}`);
    return null;
  }

  const uploadPath = getUploadPath();
  const exercicioDir = path.join(uploadPath, exercicioId);

  if (!fs.existsSync(exercicioDir)) {
    console.warn(`[MediaV2] Diretório não existe: ${exercicioDir}`);
    return null;
  }

  // Extensões aceitas (em ordem de prioridade)
  const extensions = extension 
    ? [extension.startsWith('.') ? extension : `.${extension}`]
    : ['.gif', '.mp4', '.webm', '.jpg', '.jpeg', '.png', '.webp'];

  // Procurar arquivo com nome "media.{ext}"
  for (const ext of extensions) {
    const filePath = path.join(exercicioDir, `media${ext}`);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.isFile() && stats.size > 0) {
        console.log(`[MediaV2] Arquivo encontrado: ${filePath}`);
        return filePath;
      }
    }
  }

  console.warn(`[MediaV2] Nenhum arquivo encontrado para exercício: ${exercicioId}`);
  return null;
}

/**
 * Salva um arquivo de mídia para um exercício
 * @param exercicioId - UUID do exercício
 * @param tempFilePath - Caminho temporário do arquivo
 * @param originalExtension - Extensão original do arquivo
 * @returns URL da mídia salva
 */
export async function saveMediaFile(
  exercicioId: string,
  tempFilePath: string,
  originalExtension: string
): Promise<string> {
  // Validar UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(exercicioId)) {
    throw new Error(`ID inválido (não é UUID): ${exercicioId}`);
  }

  // Verificar se exercício existe
  const exercicio = await prisma.exercicio.findUnique({
    where: { id: exercicioId },
    select: { id: true }
  });

  if (!exercicio) {
    throw new Error(`Exercício não encontrado: ${exercicioId}`);
  }

  const uploadPath = getUploadPath();
  const exercicioDir = path.join(uploadPath, exercicioId);

  // Criar diretório se não existir
  if (!fs.existsSync(exercicioDir)) {
    fs.mkdirSync(exercicioDir, { recursive: true });
  }

  // Normalizar extensão
  const ext = originalExtension.startsWith('.') ? originalExtension : `.${originalExtension}`;
  const finalPath = path.join(exercicioDir, `media${ext}`);

  // Remover arquivo antigo se existir
  const extensions = ['.gif', '.mp4', '.webm', '.jpg', '.jpeg', '.png', '.webp'];
  for (const oldExt of extensions) {
    const oldPath = path.join(exercicioDir, `media${oldExt}`);
    if (fs.existsSync(oldPath) && oldPath !== finalPath) {
      try {
        fs.unlinkSync(oldPath);
        console.log(`[MediaV2] Arquivo antigo removido: ${oldPath}`);
      } catch (error) {
        console.warn(`[MediaV2] Erro ao remover arquivo antigo: ${oldPath}`, error);
      }
    }
  }

  // Mover arquivo temporário para destino final
  fs.renameSync(tempFilePath, finalPath);
  console.log(`[MediaV2] Arquivo salvo: ${finalPath}`);

  // Retornar URL relativa
  return `/api/exercicios/${exercicioId}/media${ext}`;
}

/**
 * Remove o arquivo de mídia de um exercício
 * @param exercicioId - UUID do exercício
 */
export async function deleteMediaFile(exercicioId: string): Promise<void> {
  const uploadPath = getUploadPath();
  const exercicioDir = path.join(uploadPath, exercicioId);

  if (!fs.existsSync(exercicioDir)) {
    return; // Já não existe
  }

  const extensions = ['.gif', '.mp4', '.webm', '.jpg', '.jpeg', '.png', '.webp'];
  for (const ext of extensions) {
    const filePath = path.join(exercicioDir, `media${ext}`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[MediaV2] Arquivo removido: ${filePath}`);
      } catch (error) {
        console.warn(`[MediaV2] Erro ao remover arquivo: ${filePath}`, error);
      }
    }
  }
}

/**
 * Obtém o Content-Type baseado na extensão
 */
export function getContentType(extension: string): string {
  const ext = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
  
  const contentTypes: Record<string, string> = {
    '.gif': 'image/gif',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
  };

  return contentTypes[ext] || 'application/octet-stream';
}

