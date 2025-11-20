import { Router } from 'express';
import { body } from 'express-validator';
import {
  gerarTreinoDoDia,
  buscarTreinoDoDia,
  concluirExercicio,
  obterAlternativas,
  substituirExercicio,
  buscarHistorico,
  buscarEstatisticas,
  buscarTreinosSemanais
} from '../controllers/treino.controller';
import {
  criarTreinoPersonalizado,
  listarTreinosPersonalizados,
  buscarTreinoPersonalizado,
  editarTreinoPersonalizado,
  deletarTreinoPersonalizado,
  duplicarTreinoPersonalizado,
  criarTemplatePersonalizado,
  listarTemplatesPersonalizados,
  buscarTemplatePersonalizado,
  editarTemplatePersonalizado,
  deletarTemplatePersonalizado,
  aplicarTemplatePersonalizado,
  listarTreinosRecorrentes,
  buscarTreinoRecorrente,
  criarOuEditarTreinoRecorrente,
  aplicarTreinoRecorrente,
  buscarConfiguracaoTreinoPadrao,
  configurarTreinoPadrao,
  removerConfiguracaoTreinoPadrao
} from '../controllers/treino-personalizado.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { verificarPlanoAtivo } from '../middleware/plano.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Todas as rotas requerem plano ativo (exceto verificação)
router.use(verificarPlanoAtivo);

// Validações
const concluirExercicioValidation = [
  body('rpeRealizado')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('RPE deve estar entre 1 e 10')
];

const substituirExercicioValidation = [
  body('exercicioAlternativoId')
    .notEmpty()
    .withMessage('ID do exercício alternativo é obrigatório')
];

// Rotas de treino padrão
router.get('/dia', buscarTreinoDoDia);
router.get('/semana', buscarTreinosSemanais);
router.post('/gerar', gerarTreinoDoDia);
router.post('/exercicio/:id/concluir', concluirExercicioValidation, validateRequest, concluirExercicio);
router.get('/exercicio/:id/alternativas', obterAlternativas);
router.post('/exercicio/:id/substituir', substituirExercicioValidation, validateRequest, substituirExercicio);
router.get('/historico', buscarHistorico);
router.get('/estatisticas', buscarEstatisticas);

// Rotas de treino personalizado
router.post('/personalizado', criarTreinoPersonalizado);
router.get('/personalizado', listarTreinosPersonalizados);
router.get('/personalizado/:id', buscarTreinoPersonalizado);
router.put('/personalizado/:id', editarTreinoPersonalizado);
router.delete('/personalizado/:id', deletarTreinoPersonalizado);
router.post('/personalizado/:id/duplicar', duplicarTreinoPersonalizado);

// Rotas de templates personalizados
router.post('/template', criarTemplatePersonalizado);
router.get('/template', listarTemplatesPersonalizados);
router.get('/template/:id', buscarTemplatePersonalizado);
router.put('/template/:id', editarTemplatePersonalizado);
router.delete('/template/:id', deletarTemplatePersonalizado);
router.post('/template/:id/aplicar', aplicarTemplatePersonalizado);

// Rotas de treinos recorrentes (A-G)
router.get('/recorrente', listarTreinosRecorrentes);
router.get('/recorrente/:letra', buscarTreinoRecorrente);
router.post('/recorrente', criarOuEditarTreinoRecorrente);
router.post('/recorrente/:letra/aplicar', aplicarTreinoRecorrente);

// Rotas de configuração de treino padrão
router.get('/configuracao', buscarConfiguracaoTreinoPadrao);
router.post('/configuracao', configurarTreinoPadrao);
router.delete('/configuracao/:diaSemana', removerConfiguracaoTreinoPadrao);

export default router;

