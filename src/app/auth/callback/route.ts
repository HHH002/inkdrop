import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // OAuth 初回ログイン時にユーザーレコードを作成
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existing) {
        const name =
          data.user.user_metadata?.full_name ??
          data.user.user_metadata?.name ??
          data.user.email?.split('@')[0] ??
          'ユーザー'

        await supabase.from('users').insert({
          id: data.user.id,
          name,
          email: data.user.email ?? '',
          terms_accepted_at: new Date().toISOString(),
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
}
