// 決済プロバイダーを抽象化するインターフェース
// 将来的に Stripe 以外への切り替えを可能にする

export interface PaymentItem {
  name: string
  amount: number
  currency: string
}

export interface CreateCheckoutParams {
  orderId: string
  item: PaymentItem
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export interface CreateCheckoutResult {
  checkoutUrl: string
  sessionId: string
}

export interface PaymentProvider {
  createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult>
  verifyWebhook(payload: string, signature: string): Promise<WebhookEvent>
}

export interface WebhookEvent {
  type: string
  orderId: string
  paymentId: string
  status: 'succeeded' | 'failed'
}
