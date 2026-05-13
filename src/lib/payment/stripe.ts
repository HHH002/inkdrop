import Stripe from 'stripe'
import type {
  PaymentProvider,
  CreateCheckoutParams,
  CreateCheckoutResult,
  WebhookEvent,
} from './types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const stripeProvider: PaymentProvider = {
  async createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult> {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: params.item.currency,
            product_data: { name: params.item.name },
            unit_amount: params.item.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        order_id: params.orderId,
        ...params.metadata,
      },
    })

    return {
      checkoutUrl: session.url!,
      sessionId: session.id,
    }
  },

  async verifyWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      return {
        type: event.type,
        orderId: session.metadata?.order_id ?? '',
        paymentId: session.payment_intent as string,
        status: 'succeeded',
      }
    }

    return {
      type: event.type,
      orderId: '',
      paymentId: '',
      status: 'failed',
    }
  },
}
