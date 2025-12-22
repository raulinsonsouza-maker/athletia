import { useEffect, useState } from 'react'
import { useToast } from '../hooks/useToast'
import { whatsappAdminService, WhatsAppStatus, WhatsAppConfig, WhatsAppMessage, WhatsAppConversation, WhatsAppCadence } from '../services/whatsapp-admin.service'

export default function AdminWhatsApp() {
  const { showToast, ToastContainer } = useToast()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [config, setConfig] = useState<WhatsAppConfig | null>(null)
  const [activeSection, setActiveSection] = useState<'dashboard' | 'messages' | 'conversations' | 'cadence' | 'users' | 'templates'>('dashboard')
  
  // Messages
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [messagesPage] = useState(1)
  // const [messagesTotal, setMessagesTotal] = useState(0) // Para uso futuro com paginação
  
  // Conversations
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([])
  const [loadingConversations, setLoadingConversations] = useState(false)
  // const [selectedConversation, setSelectedConversation] = useState<string | null>(null) // Para uso futuro
  // const [conversationDetails, setConversationDetails] = useState<any>(null) // Para uso futuro
  
  // Cadence
  const [cadenceStats, setCadenceStats] = useState<any>(null)
  const [cadenceUsers, setCadenceUsers] = useState<WhatsAppCadence[]>([])
  const [loadingCadence, setLoadingCadence] = useState(false)
  
  // Users
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    loadData()
  }, [activeSection])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statusData, configData] = await Promise.all([
        whatsappAdminService.getStatus().catch(() => ({ isActive: false })),
        whatsappAdminService.getConfig().catch(() => ({ configured: false }))
      ])
      setStatus(statusData)
      setConfig(configData)
      
      if (activeSection === 'messages') {
        await loadMessages()
      } else if (activeSection === 'conversations') {
        await loadConversations()
      } else if (activeSection === 'cadence') {
        await loadCadence()
      } else if (activeSection === 'users') {
        await loadUsers()
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados WhatsApp:', error)
      showToast('Erro ao carregar dados do WhatsApp', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    setLoadingMessages(true)
    try {
      const data = await whatsappAdminService.listMessages({ page: messagesPage, limit: 50 })
      setMessages(data.messages)
      // setMessagesTotal(data.pagination.total) // Para uso futuro com paginação
    } catch (error: any) {
      showToast('Erro ao carregar mensagens', 'error')
    } finally {
      setLoadingMessages(false)
    }
  }

  const loadConversations = async () => {
    setLoadingConversations(true)
    try {
      const data = await whatsappAdminService.listConversations({ page: 1, limit: 50 })
      setConversations(data.conversations)
    } catch (error: any) {
      showToast('Erro ao carregar conversas', 'error')
    } finally {
      setLoadingConversations(false)
    }
  }

  const loadCadence = async () => {
    setLoadingCadence(true)
    try {
      const [stats, usersData] = await Promise.all([
        whatsappAdminService.getCadenceStats(),
        whatsappAdminService.listCadenceUsers({ page: 1, limit: 50 })
      ])
      setCadenceStats(stats.stats)
      setCadenceUsers(usersData.cadences)
    } catch (error: any) {
      showToast('Erro ao carregar cadência', 'error')
    } finally {
      setLoadingCadence(false)
    }
  }

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const data = await whatsappAdminService.listUsers({ page: 1, limit: 50 })
      setUsers(data.users)
    } catch (error: any) {
      showToast('Erro ao carregar usuários', 'error')
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      const result = await whatsappAdminService.testConnection()
      if (result.success) {
        showToast('Conexão testada com sucesso!', 'success')
        await loadData()
      } else {
        showToast(result.error || 'Erro ao testar conexão', 'error')
      }
    } catch (error: any) {
      showToast('Erro ao testar conexão', 'error')
    }
  }

  const handleStartOnboarding = async () => {
    try {
      const result = await whatsappAdminService.startOnboarding()
      if (result.success && result.oauthUrl) {
        window.location.href = result.oauthUrl
      }
    } catch (error: any) {
      showToast('Erro ao iniciar onboarding', 'error')
    }
  }

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <ToastContainer />
      
      {/* Header */}
      <div className="border-b border-white/10 mb-6">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold">WhatsApp Business</h1>
            <p className="text-sm text-white/60 mt-1">Gerenciamento da integração WhatsApp</p>
          </div>
          <div className="flex gap-3">
            {!config?.configured && (
              <button
                onClick={handleStartOnboarding}
                className="px-4 py-2 rounded-lg bg-primary text-dark font-semibold"
              >
                Configurar WhatsApp
              </button>
            )}
            {config?.configured && (
              <button
                onClick={handleTestConnection}
                className="px-4 py-2 rounded-lg border border-white/20 text-white"
              >
                Testar Conexão
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'messages', label: 'Mensagens', icon: '💬' },
            { id: 'conversations', label: 'Conversas', icon: '💭' },
            { id: 'cadence', label: 'Cadência', icon: '⏰' },
            { id: 'users', label: 'Usuários', icon: '👥' },
            { id: 'templates', label: 'Templates', icon: '📝' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeSection === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Card */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Status da Integração</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Status:</span>
                  <span className={`font-semibold ${status?.isActive ? 'text-green-500' : 'text-red-500'}`}>
                    {status?.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {config?.phoneNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Número:</span>
                    <span className="font-mono text-sm">{config.phoneNumber}</span>
                  </div>
                )}
                {status?.qualityRating && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Quality Rating:</span>
                    <span className={`font-semibold ${
                      status.qualityRating === 'GREEN' ? 'text-green-500' :
                      status.qualityRating === 'YELLOW' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {status.qualityRating}
                    </span>
                  </div>
                )}
                {status?.qualityScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Quality Score:</span>
                    <span className="font-semibold">{status.qualityScore}/100</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            {status?.stats && (
              <>
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Mensagens</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-primary">{status.stats.mensagensHoje}</div>
                      <div className="text-sm text-white/60">Hoje</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">{status.stats.mensagensSemana}</div>
                      <div className="text-sm text-white/60">Esta semana</div>
                    </div>
                    <div>
                      <div className="text-xl font-semibold">{status.stats.mensagensMes}</div>
                      <div className="text-sm text-white/60">Este mês</div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Métricas</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Taxa de Entrega:</span>
                      <span className="font-semibold text-green-500">{status.stats.deliveryRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Taxa de Leitura:</span>
                      <span className="font-semibold">{status.stats.readRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Taxa de Falhas:</span>
                      <span className="font-semibold text-red-500">{status.stats.failureRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Conversas Ativas:</span>
                      <span className="font-semibold">{status.stats.conversasAtivas}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!status?.isActive && (
              <div className="card col-span-full">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold mb-2">WhatsApp não configurado</h3>
                  <p className="text-white/60 mb-4">
                    Configure a integração com WhatsApp Business para começar a usar.
                  </p>
                  <button
                    onClick={handleStartOnboarding}
                    className="px-6 py-3 rounded-lg bg-primary text-dark font-semibold"
                  >
                    Configurar Agora
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'messages' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Logs de Mensagens</h3>
            {loadingMessages ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                Nenhuma mensagem encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Data</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Direção</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Tipo</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Conteúdo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(msg => (
                      <tr key={msg.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-sm">{new Date(msg.createdAt).toLocaleString('pt-BR')}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            msg.direction === 'outbound' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {msg.direction === 'outbound' ? 'Enviada' : 'Recebida'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{msg.messageType}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            msg.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            msg.status === 'read' ? 'bg-blue-500/20 text-blue-400' :
                            msg.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {msg.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-white/80 max-w-xs truncate">{msg.messageBody}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === 'conversations' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Conversas</h3>
            {loadingConversations ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                Nenhuma conversa encontrada
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    className="border border-white/10 rounded-lg p-4 hover:bg-white/5 cursor-pointer"
                    onClick={() => {
                      // TODO: Implementar visualização de detalhes da conversa
                      console.log('Conversa selecionada:', conv.id)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{conv.phoneNumber}</div>
                        {conv.user && (
                          <div className="text-sm text-white/60">{conv.user.nome} ({conv.user.email})</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-white/60">
                          {new Date(conv.lastMessageAt).toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs mt-1">
                          <span className={`px-2 py-1 rounded ${
                            conv.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {conv.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      {conv.messageCount} mensagens • Opt-in: {conv.optIn ? 'Sim' : 'Não'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'cadence' && (
          <div className="space-y-6">
            {cadenceStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                  <div className="text-2xl font-bold text-primary">{cadenceStats.totalUsuariosTrial}</div>
                  <div className="text-sm text-white/60 mt-1">Usuários em Trial</div>
                </div>
                <div className="card">
                  <div className="text-xl font-semibold">{cadenceStats.hoje.d1}</div>
                  <div className="text-sm text-white/60 mt-1">D1 Enviadas (Hoje)</div>
                </div>
                <div className="card">
                  <div className="text-xl font-semibold">{cadenceStats.hoje.d2}</div>
                  <div className="text-sm text-white/60 mt-1">D2 Enviadas (Hoje)</div>
                </div>
                <div className="card">
                  <div className="text-xl font-semibold">{cadenceStats.hoje.d3}</div>
                  <div className="text-sm text-white/60 mt-1">D3 Enviadas (Hoje)</div>
                </div>
              </div>
            )}
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Usuários em Cadência</h3>
              {loadingCadence ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : cadenceUsers.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  Nenhum usuário em cadência
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm font-semibold">Usuário</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Estágio</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">D1</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">D2</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">D3</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold">Expirado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cadenceUsers.map(cad => (
                        <tr key={cad.id} className="border-b border-white/5">
                          <td className="py-3 px-4">
                            {cad.user ? (
                              <div>
                                <div className="font-semibold">{cad.user.nome}</div>
                                <div className="text-sm text-white/60">{cad.user.email}</div>
                              </div>
                            ) : (
                              <span className="text-white/60">Não identificado</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                              {cad.trialStage}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {cad.d1Sent ? '✅' : '❌'}
                          </td>
                          <td className="py-3 px-4">
                            {cad.d2Sent ? '✅' : '❌'}
                          </td>
                          <td className="py-3 px-4">
                            {cad.d3Sent ? '✅' : '❌'}
                          </td>
                          <td className="py-3 px-4">
                            {cad.expiredSent ? '✅' : '❌'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Usuários com WhatsApp</h3>
            {loadingUsers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                Nenhum usuário com WhatsApp encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Usuário</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Telefone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Opt-in</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Data Opt-in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-white/5">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-semibold">{user.nome}</div>
                            <div className="text-sm text-white/60">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm">{user.whatsappPhoneNumber || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.whatsappOptIn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.whatsappOptIn ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-white/60">
                          {user.whatsappOptInDate ? new Date(user.whatsappOptInDate).toLocaleDateString('pt-BR') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === 'templates' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Templates de Mensagens</h3>
            <div className="text-center py-8 text-white/60">
              <p>Funcionalidade de gerenciamento de templates em desenvolvimento.</p>
              <p className="text-sm mt-2">Use o Meta Business Manager para criar e gerenciar templates.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

