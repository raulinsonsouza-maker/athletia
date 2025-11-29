import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { getUploadExerciciosPath } from '../utils/upload-paths';
import { ACCEPTED_EXTENSIONS, getContentTypeFromExtension, validateMediaFile } from '../utils/file-validation';
import { slugify } from '../utils/slugify';

/**
 * Serviço centralizado para gerenciar mídias de exercícios
 * Unifica toda a lógica de resolução, validação e construção de URLs
 */

const MANUAL_ALIASES: Record<string, string> = {
  'puxada-frontal': 'puxada-frente',
  'puxada frente': 'puxada-frente',
  'puxada-frente': 'puxada-frente'
};

/**
 * Gera candidatos de pasta para busca de arquivo
 */
function generateFolderCandidates(
  requestedId: string,
  exercicioId?: string | null,
  exercicioNome?: string | null,
  gifUrl?: string | null
): Set<string> {
  const candidates = new Set<string>();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedId);

  const addCandidate = (candidate?: string | null) => {
    if (!candidate) return;
    const trimmed = candidate.trim();
    if (!trimmed || trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) return;
    candidates.add(trimmed);
    const alias = MANUAL_ALIASES[trimmed];
    if (alias) candidates.add(alias);
  };

  addCandidate(requestedId);
  if (!isUuid) {
    addCandidate(requestedId.toLowerCase());
    addCandidate(requestedId.replace(/_/g, '-'));
    addCandidate(requestedId.replace(/\s+/g, '-'));
    addCandidate(slugify(requestedId));
  }

  if (exercicioId) addCandidate(exercicioId);
  if (exercicioNome) {
    addCandidate(slugify(exercicioNome));
    addCandidate(slugify(exercicioNome, 'exercicio'));
  }

  if (gifUrl) {
    const match = gifUrl.match(/exercicios[\/\\]([^\/\\]+)[\/\\]exercicio\.([a-z0-9]+)$/i);
    if (match?.[1]) addCandidate(match[1]);
  }

  return candidates;
}

/**
 * Resolve arquivo de mídia de exercício
 */
export async function resolveExercicioMedia(
  requestedId: string,
  requestedExt?: string | null
): Promise<{ filePath: string; contentType: string; ext: string } | null> {
  const uploadBasePath = getUploadExerciciosPath();
  
  // Validar path traversal
  if (requestedId.includes('..') || requestedId.includes('/') || requestedId.includes('\\')) {
    return null;
  }

  // Buscar exercício no banco se não for UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedId);
  let exercicio: { id: string; nome: string; gifUrl: string | null } | null = null;

  if (!isUuid) {
    try {
      const searchTerm = requestedId.replace(/[-_]+/g, ' ').trim();
      exercicio = await prisma.exercicio.findFirst({
        where: {
          OR: [
            { id: requestedId },
            { nome: { equals: requestedId, mode: 'insensitive' as const } },
            ...(searchTerm ? [{ nome: { contains: searchTerm, mode: 'insensitive' as const } }] : [])
          ]
        },
        select: { id: true, nome: true, gifUrl: true }
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[ExercicioMedia] Erro ao buscar exercício:', error);
      }
    }
  }

  const candidates = generateFolderCandidates(
    requestedId,
    exercicio?.id,
    exercicio?.nome,
    exercicio?.gifUrl
  );

  // Se extensão foi especificada, tentar apenas ela primeiro
  const extensionsToTry = requestedExt && ACCEPTED_EXTENSIONS.includes(requestedExt.startsWith('.') ? requestedExt : `.${requestedExt}`)
    ? [requestedExt.startsWith('.') ? requestedExt : `.${requestedExt}`]
    : ACCEPTED_EXTENSIONS;

  for (const folder of candidates) {
    for (const ext of extensionsToTry) {
      const filePath = path.join(uploadBasePath, folder, `exercicio${ext}`);
      if (fs.existsSync(filePath)) {
        // Validar que é arquivo válido
        try {
          const stats = fs.statSync(filePath);
          if (!stats.isFile()) continue;

          // Validar magic bytes (ler apenas primeiros 12 bytes)
          const fileHandle = fs.openSync(filePath, 'r');
          const headerBuffer = Buffer.alloc(12);
          fs.readSync(fileHandle, headerBuffer, 0, 12, 0);
          fs.closeSync(fileHandle);

          if (!validateMediaFile(headerBuffer)) continue;

          return {
            filePath,
            contentType: getContentTypeFromExtension(`exercicio${ext}`),
            ext
          };
        } catch {
          continue;
        }
      }
    }
  }

  return null;
}

/**
 * Constrói URL de mídia para exercício
 */
export function buildMediaUrl(exercicioId: string, fileExt: string): string {
  return `/api/uploads/exercicios/${exercicioId}/exercicio${fileExt}`;
}

/**
 * Valida e processa arquivo de mídia (usado no upload)
 */
export async function processMediaFile(
  tempFilePath: string,
  exercicioId: string
): Promise<{ finalPath: string; url: string; ext: string }> {
  // Validar magic bytes
  const fileHandle = fs.openSync(tempFilePath, 'r');
  const headerBuffer = Buffer.alloc(12);
  fs.readSync(fileHandle, headerBuffer, 0, 12, 0);
  fs.closeSync(fileHandle);

  const detectedMimeType = validateMediaFile(headerBuffer);
  if (!detectedMimeType) {
    throw new Error('Arquivo não é um formato de mídia válido');
  }

  const { getExtensionFromMimeType } = await import('../utils/file-validation');
  const fileExt = getExtensionFromMimeType(detectedMimeType);
  const finalFileName = `exercicio${fileExt}`;
  const uploadPath = path.join(getUploadExerciciosPath(), exercicioId);
  const finalPath = path.join(uploadPath, finalFileName);

  // Criar backup se arquivo existir
  if (fs.existsSync(finalPath)) {
    const backupPath = `${finalPath}.backup.${Date.now()}`;
    fs.copyFileSync(finalPath, backupPath);
    // Deletar backup após 1 hora
    setTimeout(() => {
      if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
    }, 3600000);
  }

  // Mover arquivo temporário para final
  fs.renameSync(tempFilePath, finalPath);

  return {
    finalPath,
    url: buildMediaUrl(exercicioId, fileExt),
    ext: fileExt
  };
}

