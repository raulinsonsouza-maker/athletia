import { Router } from 'express';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  getStatus,
  getConfig,
  testConnection,
  listTemplatesAdmin,
  createTemplateAdmin,
  listMessages,
  listConversations,
  getConversationDetails,
  sendManualMessage,
  getCadenceStats,
  listCadenceUsers,
  listUsers,
  manageOptIn,
  startOnboardingAdmin,
  handleOAuthCallbackAdmin
} from '../controllers/whatsapp-admin.controller';

const router = Router();

// Todas as rotas requerem admin
router.use(requireAdmin);

// Status e configuração
router.get('/status', getStatus);
router.get('/config', getConfig);
router.post('/test-connection', testConnection);

// Onboarding (admin)
router.get('/onboarding/start', startOnboardingAdmin);
router.get('/onboarding/callback', handleOAuthCallbackAdmin);
router.post('/onboarding/callback', handleOAuthCallbackAdmin);

// Templates
router.get('/templates', listTemplatesAdmin);
router.post('/templates', createTemplateAdmin);

// Mensagens
router.get('/messages', listMessages);

// Conversas
router.get('/conversations', listConversations);
router.get('/conversations/:id', getConversationDetails);
router.post('/conversations/:id/message', sendManualMessage);

// Cadência
router.get('/cadence/stats', getCadenceStats);
router.get('/cadence/users', listCadenceUsers);

// Usuários
router.get('/users', listUsers);
router.post('/users/:userId/opt-in', manageOptIn);
router.delete('/users/:userId/opt-in', manageOptIn);

export default router;

