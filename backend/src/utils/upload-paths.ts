import path from 'path';
import fs from 'fs';

/**
 * Função helper para obter o caminho de upload de exercícios
 * Prioridade: variável de ambiente > caminho absoluto produção > caminho relativo dev
 */
export function getUploadExerciciosPath(): string {
  // Prioridade: variável de ambiente > caminho absoluto produção > caminho relativo dev
  if (process.env.UPLOAD_EXERCICIOS_PATH) {
    return process.env.UPLOAD_EXERCICIOS_PATH;
  }
  
  // Em produção (servidor), usar caminho absoluto
  if (process.env.NODE_ENV === 'production') {
    return '/opt/athletia/backend/upload/exercicios';
  }
  
  // Em desenvolvimento, usar caminho relativo
  return path.join(process.cwd(), 'upload', 'exercicios');
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

export function getImagensBancoPath(): string {
  const candidates = [
    process.env.IMAGENS_BANCO_PATH,
    '/opt/athletia/backend/upload/imagens-banco',
    '/opt/athletia/backend/upload/imagens',
    '/opt/athletia/backend/Imagens/Banco',
    '/opt/athletia/Imagens/Banco',
    path.join(process.cwd(), 'upload', 'imagens-banco'),
    path.join(process.cwd(), 'upload', 'imagens'),
    path.join(process.cwd(), '..', 'Imagens', 'Banco')
  ];

  const existingPath = resolveExistingPath(candidates);
  if (existingPath) {
    return existingPath;
  }

  const fallback = path.join(process.cwd(), 'upload', 'imagens-banco');
  fs.mkdirSync(fallback, { recursive: true });
  return fallback;
}

