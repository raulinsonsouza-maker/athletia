import { Router } from 'express';
import {
  sendTestMessage
} from '../controllers/whatsapp.controller';

const router = Router();

// Nota: Rotas de onboarding foram movidas para /admin/whatsapp
// para garantir autenticação e segurança adequadas

// Teste (pode ser removido se não for mais necessário)
router.post('/test', sendTestMessage);

export default router;

