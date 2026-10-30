const PRECOS: Record<string, number> = {
  MENSAL: 29.9,
  TRIMESTRAL: 49.9,
  SEMESTRAL: 89.9
}

type ConversaoAssinatura = {
  transactionId?: string
  plano?: string
  value?: number
  newCustomer?: boolean
}

export function dispararConversaoAssinatura(transactionIdOrOptions?: string | ConversaoAssinatura) {
  if (typeof window === 'undefined' || !(window as any).gtag) return

  const options: ConversaoAssinatura = typeof transactionIdOrOptions === 'string'
    ? { transactionId: transactionIdOrOptions }
    : (transactionIdOrOptions || {})

  const transactionId = options.transactionId || ''
  const sessao = 'ads-purchase-sent'
  if (transactionId) {
    const chave = `ads-purchase-${transactionId}`
    if (sessionStorage.getItem(chave)) return
    sessionStorage.setItem(chave, '1')
  } else if (sessionStorage.getItem(sessao)) {
    return
  }
  sessionStorage.setItem(sessao, '1')

  const value = options.value ?? (options.plano ? PRECOS[options.plano] : undefined) ?? 0
  const purchase: Record<string, unknown> = {
    transaction_id: transactionId,
    value,
    currency: 'BRL'
  }
  if (typeof options.newCustomer === 'boolean') {
    purchase.new_customer = options.newCustomer
  }

  const gtag = (window as any).gtag
  gtag('event', 'conversion_event_purchase', purchase)
  gtag('event', 'purchase', purchase)
  gtag('event', 'conversion', {
    send_to: 'AW-448210685/2_AoCMyDkM8bEP3N3NUB',
    value,
    currency: 'BRL',
    transaction_id: transactionId
  })
  gtag('event', 'manual_event_SUBSCRIBE_PAID', {})
}
