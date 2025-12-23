import { useState, useEffect, useRef } from 'react';
import api from '../services/auth.service';
import { useToast } from '../hooks/useToast';
import { chatService, ChatMessage, ChatSession } from '../services/chat.service';

interface ChatSessionWithUser extends ChatSession {
  user: {
    id: string;
    email: string;
    nome: string | null;
  };
  assignedAdmin?: {
    id: string;
    email: string;
    nome: string | null;
  } | null;
}

export default function AdminChat() {
  const { showToast, ToastContainer } = useToast();
  const [sessions, setSessions] = useState<ChatSessionWithUser[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSessionWithUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [filter, setFilter] = useState<'all' | 'bot' | 'human' | 'closed'>('all');
  const [stats, setStats] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
    loadStats();
    
    // Conectar WebSocket
    const token = localStorage.getItem('adminAccessToken') || localStorage.getItem('accessToken');
    if (token) {
      chatService.connect(token).catch(console.error);
    }

    // Listeners
    chatService.onMessage((data) => {
      if (selectedSession && data.message.sessionId === selectedSession.id) {
        setMessages((prev) => [...prev, data.message]);
      }
      loadSessions(); // Atualizar lista
    });

    chatService.onSessionAssigned(() => {
      loadSessions();
    });

    return () => {
      chatService.off('chat:message');
      chatService.off('chat:session_assigned');
    };
  }, [selectedSession]);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id);
      chatService.joinSession(selectedSession.id);
    }
    return () => {
      if (selectedSession) {
        chatService.leaveSession(selectedSession.id);
      }
    };
  }, [selectedSession?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      const response = await api.get(`/admin/chat/sessions?${params.toString()}`);
      setSessions(response.data.sessions || response.data);
    } catch (error: any) {
      console.error('Erro ao carregar sessões:', error);
      showToast('Erro ao carregar sessões', 'error');
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await api.get(`/admin/chat/sessions/${sessionId}`);
      setMessages(response.data.messages || []);
    } catch (error: any) {
      console.error('Erro ao carregar mensagens:', error);
      showToast('Erro ao carregar mensagens', 'error');
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/chat/sessions/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedSession || loading) return;

    const content = inputValue.trim();
    setInputValue('');

    try {
      setLoading(true);
      await api.post(`/admin/chat/sessions/${selectedSession.id}/messages`, { content });
      await loadMessages(selectedSession.id);
      await loadSessions();
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      showToast('Erro ao enviar mensagem', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSession = async (sessionId: string) => {
    try {
      await api.put(`/admin/chat/sessions/${sessionId}/assign`);
      await loadSessions();
      showToast('Sessão atribuída com sucesso', 'success');
    } catch (error: any) {
      console.error('Erro ao atribuir sessão:', error);
      showToast('Erro ao atribuir sessão', 'error');
    }
  };

  const handleUpdateStatus = async (sessionId: string, status: string) => {
    try {
      await api.put(`/admin/chat/sessions/${sessionId}/status`, { status });
      await loadSessions();
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
      showToast('Status atualizado', 'success');
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      showToast('Erro ao atualizar status', 'error');
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bot':
        return 'bg-blue-500/20 text-blue-400';
      case 'human':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'closed':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Chat - Atendimento</h1>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0F0E0A] border border-white/10 rounded-lg p-4">
              <p className="text-white/60 text-sm">Total</p>
              <p className="text-2xl font-bold text-primary">{stats.total || 0}</p>
            </div>
            <div className="bg-[#0F0E0A] border border-white/10 rounded-lg p-4">
              <p className="text-white/60 text-sm">Bot</p>
              <p className="text-2xl font-bold text-blue-400">{stats.byStatus?.bot || 0}</p>
            </div>
            <div className="bg-[#0F0E0A] border border-white/10 rounded-lg p-4">
              <p className="text-white/60 text-sm">Aguardando</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.unassigned || 0}</p>
            </div>
            <div className="bg-[#0F0E0A] border border-white/10 rounded-lg p-4">
              <p className="text-white/60 text-sm">Hoje</p>
              <p className="text-2xl font-bold text-primary">{stats.today || 0}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de sessões */}
          <div className="lg:col-span-1">
            <div className="bg-[#0F0E0A] border border-white/10 rounded-lg p-4">
              <div className="flex gap-2 mb-4">
                {(['all', 'bot', 'human', 'closed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFilter(f);
                      loadSessions();
                    }}
                    className={`px-3 py-1 rounded text-sm transition ${
                      filter === f
                        ? 'bg-primary text-black font-semibold'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {f === 'all' ? 'Todas' : f === 'bot' ? 'Bot' : f === 'human' ? 'Humanas' : 'Fechadas'}
                  </button>
                ))}
              </div>

              {loadingSessions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`w-full text-left p-3 rounded-lg border transition ${
                        selectedSession?.id === session.id
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {session.user.nome || session.user.email}
                          </p>
                          <p className="text-xs text-white/60">{session.user.email}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(session.status)}`}
                        >
                          {session.status}
                        </span>
                      </div>
                      {session.messages && session.messages[0] && (
                        <p className="text-xs text-white/40 truncate">
                          {session.messages[0].content}
                        </p>
                      )}
                      {session.unreadCount > 0 && (
                        <span className="inline-block mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          {session.unreadCount} não lidas
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Área de conversa */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <div className="bg-[#0F0E0A] border border-white/10 rounded-lg flex flex-col h-[600px]">
                {/* Header da conversa */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {selectedSession.user.nome || selectedSession.user.email}
                    </h3>
                    <p className="text-sm text-white/60">{selectedSession.user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {!selectedSession.assignedAdmin && selectedSession.status === 'human' && (
                      <button
                        onClick={() => handleAssignSession(selectedSession.id)}
                        className="px-3 py-1 bg-primary text-black rounded text-sm font-semibold hover:bg-primary/90"
                      >
                        Atribuir
                      </button>
                    )}
                    {selectedSession.status !== 'closed' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedSession.id, 'closed')}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30"
                      >
                        Fechar
                      </button>
                    )}
                  </div>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isUser = message.direction === 'user';
                    const isAdmin = message.direction === 'admin';

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            isUser
                              ? 'bg-primary/20 text-light'
                              : isAdmin
                              ? 'bg-primary text-black'
                              : 'bg-white/10 text-light'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs mt-1 opacity-60">
                            {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-light placeholder-white/40 focus:outline-none focus:border-primary"
                      disabled={loading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={loading || !inputValue.trim()}
                      className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0F0E0A] border border-white/10 rounded-lg h-[600px] flex items-center justify-center">
                <p className="text-white/60">Selecione uma conversa para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

