import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatService, ChatMessage, ChatSession, ChatbotOption } from '../services/chat.service';
import { useAuth } from '../contexts/AuthContext';

export default function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Verificar se deve mostrar o widget (apenas em /meu-plano e /perfil)
  const shouldShowWidget = () => {
    const path = location.pathname;
    return path === '/meu-plano' || path === '/perfil' || path.startsWith('/perfil/');
  };

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Conectar WebSocket (verificar ambos storages)
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      chatService.connect(token).catch(console.error);
    }

    // Listeners
    const handleMessage = (data: any) => {
      const message = data.message || data;
      
      // Verificar se mensagem já existe (evitar duplicatas)
      setMessages((prev) => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
      
      if (data.session) {
        setSession(data.session);
      }
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    chatService.onMessage(handleMessage);

    chatService.onSessionClosed(() => {
      setIsOpen(false);
    });

    // Carregar sessão existente ou criar nova
    loadSession();

    return () => {
      chatService.off('chat:message');
      chatService.off('chat:session_closed');
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const sessions = await chatService.getSessions();
      
      // Buscar sessão aberta ou criar nova
      let activeSession = sessions.find(s => s.status !== 'closed');
      
      if (!activeSession) {
        const newSession = await chatService.createSession();
        activeSession = newSession.session;
        setMessages(newSession.messages || []);
      } else {
        const sessionMessages = await chatService.getMessages(activeSession.id);
        setMessages(sessionMessages);
        setUnreadCount(activeSession.unreadCount || 0);
      }

      setSession(activeSession);
      if (activeSession) {
        chatService.joinSession(activeSession.id);
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !session || loading) return;

    const content = inputValue.trim();
    setInputValue('');
    
    try {
      setLoading(true);
      const response = await chatService.sendMessage(session.id, content);
      
      // Adicionar mensagem do usuário (evitar duplicatas)
      if (response.userMessage) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === response.userMessage.id);
          if (exists) return prev;
          return [...prev, response.userMessage];
        });
      }
      
      // Adicionar resposta do bot se houver (evitar duplicatas)
      if (response.botMessage) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === response.botMessage.id);
          if (exists) return prev;
          return [...prev, response.botMessage];
        });
      }

      // Atualizar sessão
      if (response.session) {
        setSession(response.session);
      }
      
      // Recarregar mensagens para garantir sincronização
      if (session) {
        const updatedMessages = await chatService.getMessages(session.id);
        setMessages(updatedMessages);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Restaurar input em caso de erro
      setInputValue(content);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleOptionClick = async (option: ChatbotOption) => {
    if (!session || loading) return;
    const content = option.label;
    setInputValue('');
    
    try {
      setLoading(true);
      const response = await chatService.sendMessage(session.id, content);
      
      // Adicionar mensagem do usuário (evitar duplicatas)
      if (response.userMessage) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === response.userMessage.id);
          if (exists) return prev;
          return [...prev, response.userMessage];
        });
      }
      
      // Adicionar resposta do bot se houver (evitar duplicatas)
      if (response.botMessage) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === response.botMessage.id);
          if (exists) return prev;
          return [...prev, response.botMessage];
        });
      }

      // Atualizar sessão
      if (response.session) {
        setSession(response.session);
      }
      
      // Recarregar mensagens para garantir sincronização
      if (session) {
        const updatedMessages = await chatService.getMessages(session.id);
        setMessages(updatedMessages);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
      setUnreadCount(0);
      inputRef.current?.focus();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (!isAuthenticated || !shouldShowWidget()) return null;

  return (
    <>
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 md:w-16 md:h-16 bg-primary rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center group"
          aria-label="Abrir chat"
        >
          <svg
            className="w-6 h-6 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Widget de chat */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-96 max-w-[calc(100vw-3rem)] bg-[#0F0E0A] border-2 border-primary/30 rounded-xl shadow-2xl flex flex-col transition-all ${
            isMinimized ? 'h-16' : 'h-[600px] max-h-[calc(100vh-10rem)] md:max-h-[calc(100vh-8rem)]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-semibold text-light">Atendimento</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded transition"
                aria-label={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                <svg
                  className="w-5 h-5 text-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMinimized ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  )}
                </svg>
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/10 rounded transition"
                aria-label="Fechar"
              >
                <svg
                  className="w-5 h-5 text-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mensagens */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading && messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => {
                      const isUser = message.direction === 'user';
                      const isBot = message.direction === 'bot';
                      const options: ChatbotOption[] = message.metadata?.options || [];

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              isUser
                                ? 'bg-primary text-black'
                                : isBot
                                ? 'bg-white/10 text-light'
                                : 'bg-primary/20 text-light'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {options.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {options.map((option) => (
                                  <button
                                    key={option.id}
                                    onClick={() => handleOptionClick(option)}
                                    className="block w-full text-left px-3 py-2 bg-primary/20 hover:bg-primary/30 rounded text-sm text-light transition"
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
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
                    disabled={loading || !session}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !inputValue.trim() || !session}
                    className="bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

