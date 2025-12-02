import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { getUploadExerciciosPath } from '../utils/upload-paths';
import { ACCEPTED_EXTENSIONS, getContentTypeFromExtension, validateMediaFile, getExtensionFromMimeType } from '../utils/file-validation';

/**
 * Serviço centralizado para gerenciar mídias de exercícios
 * REGRA ABSOLUTA: Arquivo sempre em /upload/exercicios/<exercicioId>/exercicio.<ext>
 */

/**
 * Resolve arquivo de mídia de exercício
 * SOLUÇÃO SIMPLES: Usa APENAS o ID do exercício, sem adivinhações
 */
export async function resolveExercicioMedia(
  exercicioId: string,
  requestedExt?: string | null
): Promise<{ filePath: string; contentType: string; ext: string } | null> {
  // Validar path traversal
  if (!exercicioId || exercicioId.includes('..') || exercicioId.includes('/') || exercicioId.includes('\\')) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[ExercicioMedia] ID inválido (path traversal): ${exercicioId}`);
    }
    return null;
  }

  // Se não for UUID, buscar exercício no banco para obter o ID real
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(exercicioId);
  let realExercicioId = exercicioId;

  if (!isUuid) {
    try {
      // Primeiro tentar buscar pelo ID exato (pode ser um slug)
      let exercicio = await prisma.exercicio.findUnique({
        where: { id: exercicioId },
        select: { id: true }
      });
      
      // Se não encontrou pelo ID, tentar pelo nome (pode ser slug convertido)
      if (!exercicio) {
        // Primeiro tentar busca exata pelo nome
        exercicio = await prisma.exercicio.findFirst({
          where: {
            nome: { equals: exercicioId, mode: 'insensitive' as const }
          },
          select: { id: true }
        });
        
        // Se ainda não encontrou, tentar busca parcial (slug pode ser parte do nome)
        if (!exercicio) {
          // Converter slug para nome aproximado (ex: "abdominal-bicicleta" -> "Abdominal Bicicleta")
          const nomeAproximado = exercicioId
            .split('-')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
            .join(' ');
          
          exercicio = await prisma.exercicio.findFirst({
            where: {
              nome: { equals: nomeAproximado, mode: 'insensitive' as const }
            },
            select: { id: true }
          });
          
          // Se ainda não encontrou, tentar busca por contains (slug pode estar no nome)
          if (!exercicio) {
            exercicio = await prisma.exercicio.findFirst({
              where: {
                nome: { contains: exercicioId.replace(/-/g, ' '), mode: 'insensitive' as const }
              },
              select: { id: true }
            });
          }
        }
      }
      
      if (!exercicio) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[ExercicioMedia] Exercício não encontrado no banco: ${exercicioId}`);
        }
        return null;
      }
      
      realExercicioId = exercicio.id;
      
      if (process.env.NODE_ENV !== 'production' && realExercicioId !== exercicioId) {
        console.log(`[ExercicioMedia] ID convertido: ${exercicioId} -> ${realExercicioId}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[ExercicioMedia] Erro ao buscar exercício:', error);
      }
      return null;
    }
  }

  const uploadBasePath = getUploadExerciciosPath();
  const exercicioDir = path.join(uploadBasePath, realExercicioId);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ExercicioMedia] Procurando arquivo em: ${exercicioDir}`);
  }

  // Se extensão foi especificada, tentar apenas ela primeiro
  const normalizedExt = requestedExt ? (requestedExt.startsWith('.') ? requestedExt : `.${requestedExt}`) : null;
  const extensionsToTry = normalizedExt && ACCEPTED_EXTENSIONS.includes(normalizedExt)
    ? [normalizedExt]
    : ACCEPTED_EXTENSIONS;

  // Verificar se diretório existe
  if (!fs.existsSync(exercicioDir)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[ExercicioMedia] Diretório não existe: ${exercicioDir}`);
    }
    return null;
  }

  // Procurar APENAS na pasta do exercício, com o nome padrão exercicio.<ext>
  for (const ext of extensionsToTry) {
    const filePath = path.join(exercicioDir, `exercicio${ext}`);
    
    if (fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        if (!stats.isFile() || stats.size === 0) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[ExercicioMedia] Arquivo inválido (vazio ou não é arquivo): ${filePath}`);
          }
          continue;
        }

        // Validar magic bytes (ler apenas primeiros 12 bytes)
        const fileHandle = fs.openSync(filePath, 'r');
        const headerBuffer = Buffer.alloc(Math.min(12, stats.size));
        const bytesRead = fs.readSync(fileHandle, headerBuffer, 0, headerBuffer.length, 0);
        fs.closeSync(fileHandle);

        if (bytesRead < headerBuffer.length) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[ExercicioMedia] Erro ao ler header do arquivo: ${filePath}`);
          }
          continue;
        }

        // validateMediaFile retorna MIME type ou null
        const detectedMimeType = validateMediaFile(headerBuffer);
        if (!detectedMimeType) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[ExercicioMedia] Tipo de mídia não reconhecido: ${filePath}`);
          }
          continue;
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log(`[ExercicioMedia] Arquivo encontrado: ${filePath}`);
        }

        return {
          filePath,
          contentType: getContentTypeFromExtension(`exercicio${ext}`),
          ext
        };
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`[ExercicioMedia] Erro ao validar arquivo ${filePath}:`, error);
        }
        continue;
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[ExercicioMedia] Nenhum arquivo encontrado para exercício ${exercicioId} (ID real: ${realExercicioId})`);
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
 * GARANTE: Sempre renomeia para exercicio.<ext> na pasta correta
 */
export async function processMediaFile(
  tempFilePath: string,
  exercicioId: string
): Promise<{ finalPath: string; url: string; ext: string }> {
  // Verificar se arquivo existe
  if (!fs.existsSync(tempFilePath)) {
    throw new Error('Arquivo temporário não encontrado');
  }

  // Verificar tamanho do arquivo
  const stats = fs.statSync(tempFilePath);
  if (stats.size === 0) {
    fs.unlinkSync(tempFilePath);
    throw new Error('Arquivo está vazio');
  }

  // Validar magic bytes (ler pelo menos 12 bytes, mas pode ser menos)
  let headerBuffer: Buffer;
  try {
    const fileHandle = fs.openSync(tempFilePath, 'r');
    const bytesToRead = Math.min(12, stats.size);
    headerBuffer = Buffer.alloc(bytesToRead);
    const bytesRead = fs.readSync(fileHandle, headerBuffer, 0, bytesToRead, 0);
    fs.closeSync(fileHandle);
    
    if (bytesRead < bytesToRead) {
      if (bytesRead < 4) {
        fs.unlinkSync(tempFilePath);
        throw new Error('Arquivo muito pequeno para ser um arquivo de mídia válido');
      }
    }
  } catch (error: any) {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw new Error(`Erro ao ler arquivo: ${error.message}`);
  }

  // validateMediaFile retorna MIME type ou null
  const detectedMimeType = validateMediaFile(headerBuffer);
  if (!detectedMimeType) {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    throw new Error('Arquivo não é um formato de mídia válido. Formatos aceitos: JPEG, PNG, WebP, GIF, MP4, WebM.');
  }

  // Obter extensão do MIME type detectado
  const fileExt = getExtensionFromMimeType(detectedMimeType);
  const finalFileName = `exercicio${fileExt}`;
  const uploadPath = getUploadExerciciosPath();
  const exercicioDir = path.join(uploadPath, exercicioId);
  const finalPath = path.join(exercicioDir, finalFileName);

  // Garantir que o diretório existe
  if (!fs.existsSync(exercicioDir)) {
    fs.mkdirSync(exercicioDir, { recursive: true });
  }

  // Criar backup se arquivo existir
  if (fs.existsSync(finalPath)) {
    try {
      const backupPath = `${finalPath}.backup.${Date.now()}`;
      fs.copyFileSync(finalPath, backupPath);
      // Deletar backup após 1 hora
      setTimeout(() => {
        if (fs.existsSync(backupPath)) {
          try {
            fs.unlinkSync(backupPath);
          } catch {
            // Ignorar erro ao deletar backup
          }
        }
      }, 3600000);
    } catch (error) {
      // Se não conseguir fazer backup, continuar mesmo assim
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[ProcessMediaFile] Não foi possível criar backup:', error);
      }
    }
  }

  // Mover arquivo temporário para final (SEMPRE renomeia para exercicio.<ext>)
  try {
    fs.renameSync(tempFilePath, finalPath);
  } catch (error: any) {
    // Se falhar, tentar copiar e depois deletar
    try {
      fs.copyFileSync(tempFilePath, finalPath);
      fs.unlinkSync(tempFilePath);
    } catch (copyError: any) {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw new Error(`Erro ao salvar arquivo: ${copyError.message}`);
    }
  }

  // Verificar se arquivo final foi criado corretamente
  if (!fs.existsSync(finalPath)) {
    throw new Error('Arquivo não foi salvo corretamente');
  }

  return {
    finalPath,
    url: buildMediaUrl(exercicioId, fileExt),
    ext: fileExt
  };
}

/**
 * Limpa arquivos temporários órfãos
 * Remove arquivos .tmp.* que ficaram para trás por mais de 1 hora
 */
export async function cleanupTempFiles(): Promise<{ removed: number; errors: number }> {
  const uploadBasePath = getUploadExerciciosPath();
  const stats = { removed: 0, errors: 0 };
  const oneHourAgo = Date.now() - 3600000;

  try {
    if (!fs.existsSync(uploadBasePath)) {
      return stats;
    }

    const dirs = fs.readdirSync(uploadBasePath, { withFileTypes: true });
    
    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;
      
      const exercicioDir = path.join(uploadBasePath, dir.name);
      try {
        const files = fs.readdirSync(exercicioDir);
        for (const file of files) {
          // Remover arquivos temporários órfãos
          if (file.startsWith('exercicio.tmp.')) {
            const filePath = path.join(exercicioDir, file);
            try {
              const fileStats = fs.statSync(filePath);
              if (fileStats.mtime.getTime() < oneHourAgo) {
                fs.unlinkSync(filePath);
                stats.removed++;
              }
            } catch (err) {
              stats.errors++;
            }
          }
        }
      } catch (err) {
        stats.errors++;
      }
    }

    // Limpar arquivos temporários do bulk upload
    const tempDir = path.join(path.dirname(uploadBasePath), 'temp');
    if (fs.existsSync(tempDir)) {
      try {
        const tempFiles = fs.readdirSync(tempDir);
        for (const file of tempFiles) {
          if (file.startsWith('bulk.')) {
            const filePath = path.join(tempDir, file);
            try {
              const fileStats = fs.statSync(filePath);
              if (fileStats.mtime.getTime() < oneHourAgo) {
                fs.unlinkSync(filePath);
                stats.removed++;
              }
            } catch (err) {
              stats.errors++;
            }
          }
        }
      } catch (err) {
        stats.errors++;
      }
    }
  } catch (error) {
    stats.errors++;
  }

  return stats;
}
