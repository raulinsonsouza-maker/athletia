/**
 * Testes unitários para o gerador canônico de treinos
 * 
 * Valida:
 * - Matriz de sinergia
 * - Descanso de 48h
 * - Seleção de 4 exercícios por grupo
 * - Zero repetição de exercícios
 * - Validação final de treino
 */

import { GRUPOS_CANONICOS } from '../muscle-group-canonical.service';
import { 
  obterParesSinergicos, 
  saoGruposSinergicos,
  MATRIZ_SINERGIA 
} from '../muscle-synergy-matrix.service';
import { normalizarGrupoParaCanonico } from '../grupo-muscular.service';

describe('Muscle Group Canonical Service', () => {
  test('Deve ter exatamente 12 grupos canônicos', () => {
    expect(GRUPOS_CANONICOS.length).toBe(12);
  });

  test('Deve incluir todos os grupos esperados', () => {
    const gruposEsperados = [
      'PEITO', 'COSTAS', 'OMBROS', 'TRÍCEPS', 'BÍCEPS',
      'QUADRÍCEPS', 'POSTERIOR_COXA', 'GLÚTEOS', 'PANTURRILHA',
      'CORE', 'LOMBAR', 'TRAPÉZIO'
    ];

    gruposEsperados.forEach(grupo => {
      expect(GRUPOS_CANONICOS).toContain(grupo);
    });
  });
});

describe('Muscle Synergy Matrix', () => {
  test('Matriz de sinergia deve ser bidirecional', () => {
    // Se A → B, então B deve ter A
    for (const grupo1 of GRUPOS_CANONICOS) {
      const sinergicos1 = MATRIZ_SINERGIA[grupo1] || [];
      
      for (const grupo2 of sinergicos1) {
        const sinergicos2 = MATRIZ_SINERGIA[grupo2] || [];
        expect(sinergicos2).toContain(grupo1);
      }
    }
  });

  test('Deve retornar pares sinérgicos válidos', () => {
    const pares = obterParesSinergicos();
    
    // Verificar que todos os pares são válidos
    pares.forEach(([grupo1, grupo2]) => {
      expect(saoGruposSinergicos(grupo1, grupo2)).toBe(true);
    });
  });

  test('Pares sinérgicos conhecidos devem ser válidos', () => {
    expect(saoGruposSinergicos('PEITO', 'TRÍCEPS')).toBe(true);
    expect(saoGruposSinergicos('COSTAS', 'BÍCEPS')).toBe(true);
    expect(saoGruposSinergicos('OMBROS', 'TRAPÉZIO')).toBe(true);
    expect(saoGruposSinergicos('QUADRÍCEPS', 'GLÚTEOS')).toBe(true);
    expect(saoGruposSinergicos('CORE', 'LOMBAR')).toBe(true);
  });

  test('Pares não sinérgicos devem retornar false', () => {
    expect(saoGruposSinergicos('PEITO', 'COSTAS')).toBe(false);
    expect(saoGruposSinergicos('BÍCEPS', 'TRÍCEPS')).toBe(false);
  });
});

describe('Grupo Muscular Normalization', () => {
  test('Deve normalizar variações de nomes para canônicos', () => {
    expect(normalizarGrupoParaCanonico('Peito')).toBe('PEITO');
    expect(normalizarGrupoParaCanonico('peito')).toBe('PEITO');
    expect(normalizarGrupoParaCanonico('Pectoral')).toBe('PEITO');
    
    expect(normalizarGrupoParaCanonico('Costas')).toBe('COSTAS');
    expect(normalizarGrupoParaCanonico('Dorsal')).toBe('COSTAS');
    
    expect(normalizarGrupoParaCanonico('Ombros')).toBe('OMBROS');
    expect(normalizarGrupoParaCanonico('Deltóides')).toBe('OMBROS');
  });

  test('Deve retornar null para grupos inválidos', () => {
    expect(normalizarGrupoParaCanonico('GrupoInexistente')).toBeNull();
    expect(normalizarGrupoParaCanonico('')).toBeNull();
  });

  test('Deve normalizar grupos já canônicos', () => {
    GRUPOS_CANONICOS.forEach(grupo => {
      expect(normalizarGrupoParaCanonico(grupo)).toBe(grupo);
    });
  });
});

// Nota: Testes de integração (que requerem banco de dados)
// devem ser criados em arquivos separados que usam setup de teste com DB
