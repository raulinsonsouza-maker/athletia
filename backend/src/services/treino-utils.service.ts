/**
 * TREINO UTILS SERVICE
 * 
 * Funções utilitárias compartilhadas entre serviços
 */

/**
 * Normaliza data para início do dia
 */
export function normalizarData(data: Date): Date {
  const dt = new Date(data);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

/**
 * Obtém início da semana (segunda-feira)
 */
export function obterInicioSemana(data: Date): Date {
  const inicio = normalizarData(data);
  const diaSemana = inicio.getDay();
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
  inicio.setDate(inicio.getDate() + diff);
  return inicio;
}

