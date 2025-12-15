/**
 * Rota de teste para verificar se as rotas estão sendo registradas
 */
import { Router, Request, Response } from 'express';

const router = Router();

// Rota de teste para verificar se o Express está funcionando
router.get('/test', (req: Request, res: Response) => {
  res.json({
    message: 'Rotas funcionando!',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// Listar todas as rotas registradas (para debug)
router.get('/debug/routes', (req: Request, res: Response) => {
  const app = req.app;
  const routes: string[] = [];
  
  // Tentar listar rotas registradas
  app._router?.stack?.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push(`${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack?.forEach((handler: any) => {
        if (handler.route) {
          routes.push(`${handler.route.stack[0].method.toUpperCase()} ${handler.route.path}`);
        }
      });
    }
  });

  res.json({
    message: 'Rotas registradas',
    routes: routes.length > 0 ? routes : 'Não foi possível listar rotas',
    total: routes.length
  });
});

export default router;
