-- Migration: Normalizar Grupos Musculares para Formato Canônico
-- Esta migration documenta os grupos canônicos e prepara o banco para normalização

-- Grupos Canônicos (12 grupos):
-- PEITO, COSTAS, OMBROS, TRÍCEPS, BÍCEPS, QUADRÍCEPS, 
-- POSTERIOR_COXA, GLÚTEOS, PANTURRILHA, CORE, LOMBAR, TRAPÉZIO

-- Nota: Esta migration não altera dados existentes automaticamente.
-- A normalização de grupos existentes deve ser feita via script TypeScript
-- após esta migration ser aplicada, usando o serviço de normalização.

-- Esta migration serve como documentação e ponto de referência
-- para garantir que novos grupos sigam o padrão canônico.

-- Comentário para referência futura:
-- Use a função normalizarGrupoParaCanonico() do grupo-muscular.service.ts
-- para normalizar nomes de grupos antes de inserir/atualizar.
