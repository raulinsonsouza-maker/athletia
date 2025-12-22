import api from './auth.service'

export interface WhatsAppStatus {
  isActive: boolean
  phoneNumber?: string
  phoneNumberId?: string
  businessAccountId?: string
  qualityRating?: string
  qualityScore?: number
  lastHealthCheck?: string
  stats?: {
    mensagensHoje: number
    mensagensSemana: number
    mensagensMes: number
    conversasAtivas: number
    usuariosOptIn: number
    usuariosOptOut: number
    deliveryRate: number
    readRate: number
    failureRate: number
  }
}

export interface WhatsAppConfig {
  configured: boolean
  phoneNumber?: string
  phoneNumberId?: string
  businessAccountId?: string
  apiVersion?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface WhatsAppTemplate {
  id: string
  name: string
  category: string
  language: string
  status: string
  components: any[]
}

export interface WhatsAppMessage {
  id: string
  direction: 'inbound' | 'outbound'
  messageType: string
  messageBody: string
  toPhone: string
  fromPhone: string
  status: string
  templateName?: string
  createdAt: string
  user?: {
    id: string
    nome: string
    email: string
  }
}

export interface WhatsAppConversation {
  id: string
  phoneNumber: string
  status: string
  lastMessageAt: string
  messageCount: number
  optIn: boolean
  user?: {
    id: string
    nome: string
    email: string
  }
}

export interface WhatsAppCadence {
  id: string
  userId: string
  trialStage: string
  d1Sent: boolean
  d2Sent: boolean
  d3Sent: boolean
  expiredSent: boolean
  user?: {
    id: string
    nome: string
    email: string
    whatsappOptIn: boolean
    whatsappPhoneNumber: string
    dataInicioTrial: string
    dataFimTrial: string
  }
}

export const whatsappAdminService = {
  // Status
  async getStatus(): Promise<WhatsAppStatus> {
    const response = await api.get('/admin/whatsapp/status')
    return response.data
  },

  async getConfig(): Promise<WhatsAppConfig> {
    const response = await api.get('/admin/whatsapp/config')
    return response.data
  },

  async testConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.post('/admin/whatsapp/test-connection')
    return response.data
  },

  // Templates
  async listTemplates(): Promise<WhatsAppTemplate[]> {
    const response = await api.get('/admin/whatsapp/templates')
    return response.data.templates || []
  },

  async createTemplate(data: {
    name: string
    category: string
    language: string
    components: any[]
  }): Promise<{ success: boolean; templateId?: string; error?: string }> {
    const response = await api.post('/admin/whatsapp/templates', data)
    return response.data
  },

  // Messages
  async listMessages(params?: {
    page?: number
    limit?: number
    direction?: string
    status?: string
    messageType?: string
    userId?: string
    templateName?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    success: boolean
    messages: WhatsAppMessage[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const response = await api.get('/admin/whatsapp/messages', { params })
    return response.data
  },

  // Conversations
  async listConversations(params?: {
    page?: number
    limit?: number
    status?: string
    optIn?: boolean
    hasUser?: boolean
  }): Promise<{
    success: boolean
    conversations: WhatsAppConversation[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const response = await api.get('/admin/whatsapp/conversations', { params })
    return response.data
  },

  async getConversationDetails(id: string): Promise<{
    success: boolean
    conversation: WhatsAppConversation & {
      messages: WhatsAppMessage[]
    }
  }> {
    const response = await api.get(`/admin/whatsapp/conversations/${id}`)
    return response.data
  },

  async sendManualMessage(conversationId: string, message: string): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    const response = await api.post(`/admin/whatsapp/conversations/${conversationId}/message`, {
      message
    })
    return response.data
  },

  // Cadence
  async getCadenceStats(): Promise<{
    success: boolean
    stats: {
      totalUsuariosTrial: number
      hoje: {
        d1: number
        d2: number
        d3: number
        expired: number
      }
      total: {
        d1: number
        d2: number
        d3: number
        expired: number
      }
    }
  }> {
    const response = await api.get('/admin/whatsapp/cadence/stats')
    return response.data
  },

  async listCadenceUsers(params?: {
    page?: number
    limit?: number
    stage?: string
  }): Promise<{
    success: boolean
    cadences: WhatsAppCadence[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const response = await api.get('/admin/whatsapp/cadence/users', { params })
    return response.data
  },

  // Users
  async listUsers(params?: {
    page?: number
    limit?: number
    optIn?: boolean
    search?: string
  }): Promise<{
    success: boolean
    users: Array<{
      id: string
      nome: string
      email: string
      whatsappOptIn: boolean
      whatsappOptInDate: string | null
      whatsappPhoneNumber: string | null
      createdAt: string
    }>
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const response = await api.get('/admin/whatsapp/users', { params })
    return response.data
  },

  async manageOptIn(userId: string, action: 'enable' | 'disable', justification: string): Promise<{
    success: boolean
    message: string
  }> {
    const response = await api.post(`/admin/whatsapp/users/${userId}/opt-in`, {
      action,
      justification
    })
    return response.data
  },

  // Onboarding
  async startOnboarding(): Promise<{
    success: boolean
    oauthUrl: string
    message: string
  }> {
    const response = await api.get('/whatsapp/onboarding/start')
    return response.data
  }
}

