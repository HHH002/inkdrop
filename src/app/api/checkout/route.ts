import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paymentProvider } from '@/lib/payment'
import {
  FIXED_PRICE,
  BODY_TYPE_LABELS,
  type BodyType,
  type ProductColor,
  type Size,
  type Placement,
  type PrintSize,
} from '@/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      design_id,
      body_type,
      color,
      size,
      placement,
      print_size,
    } = body as {
      design_id: string
      body_type: BodyType
      color: ProductColor
      size: Size
      placement: Placement
      print_size: PrintSize
    }

    // バリデーション
    if (!design_id || !body_type || !color || !size || !placement || !print_size) {
      return NextResponse.json({ error: 'invalid_params' }, { status: 400 })
    }

    // デザイン取得・在庫チェック
    const { data: design, error: dErr } = await supabase
      .from('designs')
      .select('*')
      .eq('id', design_id)
      .single()
    if (dErr || !design) return NextResponse.json({ error: 'design_not_found' }, { status: 404 })
    if (design.is_sales_stopped) {
      return NextResponse.json({ error: 'sales_stopped' }, { status: 400 })
    }

    const total = FIXED_PRICE

    // 注文レコードを事前作成
    const { data: order, error: oErr } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        design_id,
        body_type,
        color,
        size,
        placement,
        print_size,
        price: total,
        status: 'order_confirmed',
      })
      .select()
      .single()
    if (oErr || !order) {
      return NextResponse.json({ error: 'order_create_failed' }, { status: 500 })
    }

    const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // 抽象化された決済プロバイダー経由でCheckout作成
    const { checkoutUrl } = await paymentProvider.createCheckout({
      orderId: order.id,
      item: {
        name: `${BODY_TYPE_LABELS[body_type]} - ${design.title}`,
        amount: total,
        currency: 'jpy',
      },
      successUrl: `${origin}/orders/${order.id}?success=1`,
      cancelUrl: `${origin}/designs/${design_id}`,
      metadata: { design_id, body_type, placement },
    })

    return NextResponse.json({ url: checkoutUrl })
  } catch (e) {
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 })
  }
}
