import path from 'path';
import fs from 'fs';
import { logger } from '../lib/logger';

/**
 * Função helper para obter o caminho de upload de exercícios
 * Prioridade: variável de ambiente > caminho absoluto produção > caminho relativo dev
 * 
 * GARANTE que o diretório existe antes de retornar
 */
export function getUploadExerciciosPath(): string {
  let basePath: string;
  
  // Prioridade: variável de ambiente > caminho absoluto produção > caminho relativo dev
  if (process.env.UPLOAD_EXERCICIOS_PATH) {
    basePath = process.env.UPLOAD_EXERCICIOS_PATH;
  } else if (process.env.NODE_ENV === 'production') {
    // CORREÇÃO: Usar /uploads/ (com 's') que é o padrão
    basePath = '/opt/athletia/backend/uploads/exercicios';
  } else {
    // Em desenvolvimento, usar caminho relativo
    basePath = path.join(process.cwd(), 'upload', 'exercicios');
  }
  
  // GARANTIR que o diretório existe (criar estrutura completa se necessário)
  try {
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
      logger.info(`Diretório criado: ${basePath}`, 'upload-paths');
    }
  } catch (error: any) {
    logger.error(`ERRO ao criar diretório ${basePath}: ${error.message}`, 'upload-paths');
    // Em caso de erro, tentar fallback
    const fallbackPath = path.join(process.cwd(), 'upload', 'exercicios');
    if (!fs.existsSync(fallbackPath)) {
      fs.mkdirSync(fallbackPath, { recursive: true });
      logger.warn(`Usando fallback: ${fallbackPath}`, 'upload-paths');
      return fallbackPath;
    }
    return fallbackPath;
  }
  
  return basePath;
}

function resolveExistingPath(paths: string[]): string | null {
  for (const candidate of paths) {
    if (!candidate) continue;
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // ignorar erros de permissão
    }
  }
  return null;
}

const FALLBACK_IMAGENS_BANCO = path.join(process.cwd(), 'upload', 'imagens-banco');

export function getImagensBancoPathCandidates(): string[] {
  const candidates = [
    process.env.IMAGENS_BANCO_PATH,
    '/opt/athletia/backend/upload/imagens-banco',
    '/opt/athletia/backend/upload/imagens',
    '/opt/athletia/backend/Imagens/Banco',
    '/opt/athletia/Imagens/Banco',
    path.join(process.cwd(), 'upload', 'imagens-banco'),
    path.join(process.cwd(), 'upload', 'imagens'),
    path.join(process.cwd(), '..', 'Imagens', 'Banco')
  ]
    .filter(Boolean)
    .map((candidate) => path.resolve(candidate as string));

  if (!fs.existsSync(FALLBACK_IMAGENS_BANCO)) {
    fs.mkdirSync(FALLBACK_IMAGENS_BANCO, { recursive: true });
  }

  candidates.push(FALLBACK_IMAGENS_BANCO);

  return Array.from(new Set(candidates));
}
