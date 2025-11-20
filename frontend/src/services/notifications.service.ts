// Service para gerenciar notificações do navegador

export class NotificationService {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  static async show(title: string, options?: NotificationOptions): Promise<void> {
    if (!(await this.requestPermission())) {
      return
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    // Fechar automaticamente após 5 segundos
    setTimeout(() => {
      notification.close()
    }, 5000)
  }

  static async showTreinoDisponivel(): Promise<void> {
    await this.show('Treino Disponível!', {
      body: 'Seu treino do dia está pronto. Clique para começar!',
      tag: 'treino-disponivel',
      requireInteraction: false
    })
  }

  static async showLembretePeso(): Promise<void> {
    await this.show('Lembrete de Peso', {
      body: 'Não esqueça de registrar seu peso semanal!',
      tag: 'lembrete-peso',
      requireInteraction: false
    })
  }

  static async showTreinoConcluido(): Promise<void> {
    await this.show('Treino Concluído!', {
      body: 'Parabéns! Você completou seu treino de hoje.',
      tag: 'treino-concluido',
      requireInteraction: false
    })
  }

  static async showProgresso(ganho: string): Promise<void> {
    await this.show('📈 Progresso Registrado!', {
      body: `Seu progresso: ${ganho}`,
      tag: 'progresso',
      requireInteraction: false
    })
  }
}

