import path from 'path';

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

