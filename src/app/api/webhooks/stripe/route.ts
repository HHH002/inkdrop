import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { paymentProvider } from '@/lib/payment'
import { DEFAULT_PRICES, type BodyType } from '@/types'

// Service Role Key を使った管理者クライアント（webhook 用）
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  )
}

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('stripe-signature') ?? ''
    const payload = await request.text()
    const event = await paymentProvider.verifyWebhook(payload, signature)

    if (event.status !== 'succeeded' || !event.orderId) {
      return NextResponse.json({ received: true })
    }

    const supabase = getAdminClient()

    // 注文取得
    const { data: order } = await supabase
      .from('orders')
      .select('*, design:designs(*)')
      .eq('id', event.orderId)
      .single()
    if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 })

    // 注文をpaymentIdで紐づけ
    await supabase
      .from('orders')
      .update({ stripe_payment_id: event.paymentId })
      .eq('id', event.orderId)

    const bodyType = order.body_type as BodyType
    const creatorReward = DEFAULT_PRICES[bodyType].creator_reward
    const designerId = order.design.user_id

    // earnings レコード作成（pending）
    await supabase.from('earnings').insert({
      user_id: designerId,
      order_id: order.id,
      design_id: order.design_id,
      body_type: order.body_type,
      placement: order.placement,
      amount: creatorReward,
      status: 'pending',
    })

    // creator_balances を更新（pending_balance に加算）
    {
      const { error: rpcErr } = await supabase.rpc('increment_pending_balance', {
        uid: designerId,
        amt: creatorReward,
      })
      if (rpcErr) {
        const { data: cb } = await supabase
          .from('creator_balances')
          .select('*')
          .eq('user_id', designerId)
          .single()
        if (cb) {
          await supabase
            .from('creator_balances')
            .update({
              pending_balance: (cb.pending_balance ?? 0) + creatorReward,
              total_income: (cb.total_income ?? 0) + creatorReward,
              total_sales_count: (cb.total_sales_count ?? 0) + 1,
            })
            .eq('user_id', designerId)
        } else {
          await supabase.from('creator_balances').insert({
            user_id: designerId,
            pending_balance: creatorReward,
            total_income: creatorReward,
            total_sales_count: 1,
          })
        }
      }
    }

    // sold_items に記録
    await supabase.from('sold_items').insert({
      user_id: designerId,
      order_id: order.id,
      design_id: order.design_id,
      design_title: order.design.title,
      body_type: order.body_type,
      placement: order.placement,
      creator_reward: creatorReward,
      sold_at: new Date().toISOString(),
    })

    // designs.sales_count をインクリメント
    const newSalesCount = (order.design.sales_count ?? 0) + 1
    await supabase
      .from('designs')
      .update({
        sales_count: newSalesCount,
        is_sales_stopped: newSalesCount >= (order.design.max_sales_count ?? 100),
      })
      .eq('id', order.design_id)

    // design_sales_summary を更新
    const { data: sum } = await supabase
      .from('design_sales_summary')
      .select('*')
      .eq('design_id', order.design_id)
      .single()
    if (sum) {
      const newCount = (sum.sales_count ?? 0) + 1
      await supabase
        .from('design_sales_summary')
        .update({
          sales_count: newCount,
          earnings_amount: (sum.earnings_amount ?? 0) + creatorReward,
          remaining_sales_count: Math.max(0, (sum.max_sales_count ?? 100) - newCount),
          is_sales_stopped: newCount >= (sum.max_sales_count ?? 100),
        })
        .eq('design_id', order.design_id)
    }

    // 投稿者に購入通知
    await supabase.from('notifications').insert({
      user_id: designerId,
      type: 'purchase',
      message: `「${order.design.title}」が購入されました`,
    })

    return NextResponse.json({ received: true })
  } catch (e) {
    return NextResponse.json({ error: 'webhook_failed' }, { status: 400 })
  }
}
