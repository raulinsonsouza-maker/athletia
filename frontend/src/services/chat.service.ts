import { io, Socket } from 'socket.io-client';
import api from './auth.service';
import { getApiUrl } from '../utils/api-url';

const API_URL = getApiUrl();

export interface ChatMessage {
  id: string;
  sessionId: string;
  direction: 'user' | 'bot' | 'admin';
  content: string;
  metadata?: any;
  read: boolean;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  status: 'bot' | 'human' | 'closed';
  assignedToAdminId?: string | null;
  unreadCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}

export interface ChatbotOption {
  id: string;
  label: string;
  action: string;
}

class ChatService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  getSocket(): Socket | null {
    return this.socket;
  }

  connect(token: string): Promise<Socket> {
    return new Promise((resolve) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      // Construir URL do WebSocket corretamente
      let socketUrl = API_URL.endsWith('/api') 
        ? API_URL.replace('/api', '') 
        : API_URL.replace(/\/api\/?$/, '');
      
      // Se não houver URL, usar localhost em desenvolvimento
      if (!socketUrl || socketUrl === '') {
        socketUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:3001'
          : (typeof window !== 'undefined' 
              ? `${window.location.protocol === 'https:' ? 'https' : 'http'}://${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`
              : 'http://localhost:3001');
      }
      
      // Garantir que não termine com /
      socketUrl = socketUrl.replace(/\/$/, '');
      
      console.log('[Chat] Conectando WebSocket em:', socketUrl);
      
      this.socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: false
      });

      let resolved = false;

      this.socket.on('connect', () => {
        console.log('[Chat] Conectado ao WebSocket');
        this.reconnectAttempts = 0;
        if (!resolved) {
          resolved = true;
          resolve(this.socket!);
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Chat] Erro de conexão:', error.message || error);
        this.reconnectAttempts++;
        
        // Se polling funcionar, ainda considerar sucesso
        if (this.socket?.io?.engine?.transport?.name === 'polling' && this.socket.connected) {
          console.log('[Chat] Conectado via polling (fallback)');
          if (!resolved) {
            resolved = true;
            resolve(this.socket!);
          }
          return;
        }
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('[Chat] Máximo de tentativas de reconexão atingido');
          if (!resolved) {
            resolved = true;
            // Ainda resolver para não bloquear a UI, mas logar o erro
            resolve(this.socket!);
          }
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Chat] Desconectado do WebSocket:', reason);
        if (reason === 'io server disconnect') {
          // Servidor desconectou, tentar reconectar manualmente
          this.socket?.connect();
        }
      });

      // Timeout de segurança
      setTimeout(() => {
        if (!resolved && this.socket && !this.socket.connected) {
          console.warn('[Chat] Timeout na conexão WebSocket, usando polling');
          if (!resolved) {
            resolved = true;
            // Tentar forçar polling
            this.socket.io.opts.transports = ['polling'];
            resolve(this.socket);
          }
        }
      }, 10000);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinSession(sessionId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:join', sessionId);
    }
  }

  leaveSession(sessionId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:leave', sessionId);
    }
  }

  onMessage(callback: (data: { message: ChatMessage; session: ChatSession }) => void) {
    if (this.socket) {
      this.socket.on('chat:message', callback);
    }
  }

  onTyping(callback: (data: { userId: string; typing: boolean }) => void) {
    if (this.socket) {
      this.socket.on('chat:typing', callback);
    }
  }

  onSessionClosed(callback: (data: { sessionId: string }) => void) {
    if (this.socket) {
      this.socket.on('chat:session_closed', callback);
    }
  }

  onSessionAssigned(callback: (data: { sessionId: string; message?: string }) => void) {
    if (this.socket) {
      this.socket.on('chat:session_assigned', callback);
    }
  }

  sendTyping(sessionId: string, typing: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('chat:typing', { sessionId, typing });
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // API REST methods
  async getSessions(): Promise<ChatSession[]> {
    const response = await api.get('/chat/sessions');
    return response.data;
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  }

  async createSession(): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
    const response = await api.post('/chat/sessions');
    return response.data;
  }

  async sendMessage(sessionId: string, content: string): Promise<any> {
    const response = await api.post(`/chat/sessions/${sessionId}/messages`, { content });
    return response.data;
  }

  async closeSession(sessionId: string): Promise<void> {
    await api.put(`/chat/sessions/${sessionId}/close`);
  }
}

export const chatService = new ChatService();

