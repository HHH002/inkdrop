// 決済プロバイダーのエントリーポイント
// PAYMENT_PROVIDER 環境変数で切り替える（デフォルト: stripe）

import { stripeProvider } from './stripe'
import type { PaymentProvider } from './types'

export type { PaymentProvider, CreateCheckoutParams, CreateCheckoutResult, WebhookEvent } from './types'

function getPaymentProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER ?? 'stripe'

  switch (provider) {
    case 'stripe':
      return stripeProvider
    // TODO: 他の決済プロバイダーをここに追加する
    default:
      return stripeProvider
  }
}

export const paymentProvider = getPaymentProvider()
