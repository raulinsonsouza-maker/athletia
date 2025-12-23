import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

class WebSocketManager {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private adminSockets: Set<string> = new Set(); // socketIds of admin users

  initialize(server: HTTPServer) {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    this.io = new SocketIOServer(server, {
      cors: {
        origin: FRONTEND_URL.split(',').map(url => url.trim()),
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });

    // Middleware de autenticação
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Token não fornecido'));
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
          return next(new Error('JWT_SECRET não configurado'));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string; type?: string };
        
        // Verificar se é token de acesso válido (não refresh token)
        if (decoded.type && decoded.type !== 'access') {
          return next(new Error('Token inválido'));
        }
        
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;

        // Verificar se usuário existe e está ativo
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, ativo: true, role: true }
        });

        if (!user || !user.ativo) {
          return next(new Error('Usuário não encontrado ou inativo'));
        }

        next();
      } catch (error: any) {
        console.error('[WebSocket] Erro de autenticação:', error.message);
        next(new Error('Autenticação falhou'));
      }
    });

    // Gerenciar conexões
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;
      const isAdmin = socket.userRole === 'ADMIN';

      console.log(`[WebSocket] Cliente conectado: ${socket.id} (User: ${userId}, Admin: ${isAdmin})`);

      // Registrar socket do usuário
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      // Registrar socket de admin
      if (isAdmin) {
        this.adminSockets.add(socket.id);
        socket.join('admins'); // Room para admins
      }

      // Join room do usuário
      socket.join(`user:${userId}`);

      // Eventos de chat
      socket.on('chat:join', async (sessionId: string) => {
        try {
          // Verificar se sessão pertence ao usuário (ou se é admin)
          const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            select: { userId: true }
          });

          if (!session) {
            socket.emit('error', { message: 'Sessão não encontrada' });
            return;
          }

          if (session.userId !== userId && !isAdmin) {
            socket.emit('error', { message: 'Acesso negado' });
            return;
          }

          socket.join(`session:${sessionId}`);
          console.log(`[WebSocket] Socket ${socket.id} entrou na sessão ${sessionId}`);
        } catch (error: any) {
          console.error('[WebSocket] Erro ao entrar na sessão:', error);
          socket.emit('error', { message: 'Erro ao entrar na sessão' });
        }
      });

      socket.on('chat:leave', (sessionId: string) => {
        socket.leave(`session:${sessionId}`);
        console.log(`[WebSocket] Socket ${socket.id} saiu da sessão ${sessionId}`);
      });

      socket.on('chat:typing', (data: { sessionId: string; typing: boolean }) => {
        socket.to(`session:${data.sessionId}`).emit('chat:typing', {
          userId,
          typing: data.typing
        });
      });

      // Desconexão
      socket.on('disconnect', () => {
        console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
        
        // Remover socket do usuário
        const userSocketSet = this.userSockets.get(userId);
        if (userSocketSet) {
          userSocketSet.delete(socket.id);
          if (userSocketSet.size === 0) {
            this.userSockets.delete(userId);
          }
        }

        // Remover socket de admin
        if (isAdmin) {
          this.adminSockets.delete(socket.id);
        }
      });
    });

    console.log('[WebSocket] Servidor WebSocket inicializado');
    return this.io;
  }

  // Enviar mensagem para um usuário específico
  sendToUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet && userSocketSet.size > 0) {
      userSocketSet.forEach(socketId => {
        this.io!.to(socketId).emit(event, data);
      });
    }
  }

  // Enviar mensagem para uma sessão específica
  sendToSession(sessionId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`session:${sessionId}`).emit(event, data);
  }

  // Enviar mensagem para todos os admins
  sendToAdmins(event: string, data: any) {
    if (!this.io) return;
    this.io.to('admins').emit(event, data);
  }

  // Broadcast para todos os clientes conectados
  broadcast(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const websocketManager = new WebSocketManager();

