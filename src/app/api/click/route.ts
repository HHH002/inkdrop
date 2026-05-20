import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { design_id } = await req.json()
    if (!design_id) return NextResponse.json({ error: 'design_id required' }, { status: 400 })

    // RPC経由でclick_count+1 & design_click_eventsに記録（SECURITY DEFINER）
    const { error } = await adminClient.rpc('increment_design_click', { design_id })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
