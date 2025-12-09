import { Router } from 'express';
import { body } from 'express-validator';
import {
  gerarTreinoDoDia,
  buscarTreinoDoDia,
  concluirExercicio,
  concluirTreino,
  obterAlternativas,
  substituirExercicio,
  buscarHistorico,
  buscarEstatisticas,
  buscarTreinosSemanais,
  buscarTreinos,
  gerarVersaoAlternativa,
  obterHomeTreinos,
  obterPlanoAtual
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
  aplicarTemplatePersonalizado
} from '../controllers/treino-personalizado.controller';
import {
  criarTreinoRapido,
  listarGrupos
} from '../controllers/treino-rapido.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { verificarPlanoAtivo } from '../middleware/plano.middleware';
import { validateUUIDParam } from '../middleware/validate-uuid.middleware';

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
router.get('/', buscarTreinos); // Buscar treinos com filtros (dataInicio, dataFim, etc)
router.get('/dia', buscarTreinoDoDia);
router.get('/semana', buscarTreinosSemanais);
router.get('/home', obterHomeTreinos);
router.get('/plano-atual', obterPlanoAtual);
router.post('/gerar', gerarTreinoDoDia);
router.post('/versao-alternativa', gerarVersaoAlternativa);
// SEGURANÇA: Validar UUID em parâmetros de rota
router.post('/exercicio/:id/concluir', validateUUIDParam('id'), concluirExercicioValidation, validateRequest, concluirExercicio);
router.post('/:id/concluir', validateUUIDParam('id'), concluirTreino);
router.get('/exercicio/:id/alternativas', validateUUIDParam('id'), obterAlternativas);
router.post('/exercicio/:id/substituir', validateUUIDParam('id'), substituirExercicioValidation, validateRequest, substituirExercicio);
router.get('/historico', buscarHistorico);
router.get('/estatisticas', buscarEstatisticas);

// Rotas de treino personalizado
router.post('/personalizado', criarTreinoPersonalizado);
router.get('/personalizado', listarTreinosPersonalizados);
// SEGURANÇA: Validar UUID em parâmetros de rota
router.get('/personalizado/:id', validateUUIDParam('id'), buscarTreinoPersonalizado);
router.put('/personalizado/:id', validateUUIDParam('id'), editarTreinoPersonalizado);
router.delete('/personalizado/:id', validateUUIDParam('id'), deletarTreinoPersonalizado);
router.post('/personalizado/:id/duplicar', validateUUIDParam('id'), duplicarTreinoPersonalizado);

// Rotas de templates personalizados
router.post('/template', criarTemplatePersonalizado);
router.get('/template', listarTemplatesPersonalizados);
// SEGURANÇA: Validar UUID em parâmetros de rota
router.get('/template/:id', validateUUIDParam('id'), buscarTemplatePersonalizado);
router.put('/template/:id', validateUUIDParam('id'), editarTemplatePersonalizado);
router.delete('/template/:id', validateUUIDParam('id'), deletarTemplatePersonalizado);
router.post('/template/:id/aplicar', validateUUIDParam('id'), aplicarTemplatePersonalizado);

// Rotas de treino rápido
router.post('/rapido', criarTreinoRapido);
router.get('/rapido/grupos', listarGrupos);

export default router;

