export function dispararConversaoAssinatura(transactionId?: string) {
  if (typeof window === 'undefined' || !(window as any).gtag) return

  ;(window as any).gtag('event', 'conversion', {
    send_to: 'AW-448210685/2_AoCMyDkM8bEP3N3NUB',
    value: 1.0,
    currency: 'BRL',
    transaction_id: transactionId || ''
  })

  ;(window as any).gtag('event', 'manual_event_SUBSCRIBE_PAID', {})
}
