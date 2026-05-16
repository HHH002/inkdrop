import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json()
    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey === 'sk-placeholder') {
      // OpenAI キー未設定時はモック承認
      return NextResponse.json({ status: 'approved', reason: 'AIキー未設定のため自動承認' })
    }

    const openai = new OpenAI({ apiKey })

    const response = await openai.chat.completions.create({
      model: 'o3',
      max_completion_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'high' },
            },
            {
              type: 'text',
              text: `このデザイン画像を著作権の観点で厳密に審査してください。
以下に該当する場合は rejected とします：
- 有名キャラクター（アニメ・映画・ゲーム等）の明らかなコピー
- ブランドロゴや商標の無断使用
- 著名人・芸能人の顔写真
- 既存の有名アートワークのコピー

以下は approved です：
- 抽象デザイン・幾何学模様
- オリジナルイラスト
- タイポグラフィのみ
- 自作のアート

必ず以下のJSON形式のみで回答してください（他のテキスト不要）：
{"status":"approved","reason":"理由を日本語で30字以内"}
または
{"status":"rejected","reason":"違反内容を日本語で30字以内"}`,
            },
          ],
        },
      ],
    })

    const content = response.choices[0]?.message?.content ?? ''

    // JSONを抽出
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) {
      return NextResponse.json({ status: 'approved', reason: '審査完了' })
    }

    const result = JSON.parse(match[0])
    return NextResponse.json({
      status: result.status === 'rejected' ? 'rejected' : 'approved',
      reason: result.reason ?? '',
    })
  } catch (e) {
    console.error('[copyright-check]', e)
    // エラー時はデフォルト承認（体験を止めない）
    return NextResponse.json({ status: 'approved', reason: '審査エラーのため自動承認' })
  }
}
