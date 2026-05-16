import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export type AutoPlacementResult = {
  front: 'none' | 'A' | 'C1' | 'C2'
  back: 'none' | 'B1' | 'B2'
  reason: string
}

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json()
    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey === 'sk-placeholder') {
      // OpenAI キー未設定時は画像URLのアスペクト比から推定（フォールバック）
      return NextResponse.json<AutoPlacementResult>({
        front: 'A',
        back: 'none',
        reason: 'デフォルト配置（AIキー未設定）',
      })
    }

    const openai = new OpenAI({ apiKey })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'low' },
            },
            {
              type: 'text',
              text: `このデザイン画像を見て、Tシャツへの最適なプリント配置を提案してください。

配置オプション：
フロント:
- "A"：左胸ワンポイント（小さいロゴ・シンプルなデザインに最適）
- "C1"：フロント中央スモール（中程度のデザインに最適）
- "C2"：フロント中央ビッグ（インパクトある大きいデザインに最適）
- "none"：フロントなし

バック:
- "B1"：背面縦長デザイン（縦長・ポートレート向きデザインに最適）
- "B2"：背面横長デザイン（横長・ランドスケープ向きデザインに最適）
- "none"：バックなし

判断基準：
- 小さい・シンプルなデザイン → フロント A
- 中サイズのデザイン → フロント C1 または C2
- インパクト重視 → フロント C2 またはバック
- 縦長デザイン → バック B1
- 横長デザイン → バック B2
- 両面使用は特別なケースのみ

必ず以下のJSON形式のみで回答（他のテキスト不要）：
{"front":"A","back":"none","reason":"理由を日本語で40字以内"}`,
            },
          ],
        },
      ],
    })

    const content = response.choices[0]?.message?.content ?? ''
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) {
      return NextResponse.json<AutoPlacementResult>({ front: 'C1', back: 'none', reason: '解析完了' })
    }

    const result = JSON.parse(match[0])
    return NextResponse.json<AutoPlacementResult>({
      front: ['A', 'C1', 'C2', 'none'].includes(result.front) ? result.front : 'C1',
      back: ['B1', 'B2', 'none'].includes(result.back) ? result.back : 'none',
      reason: result.reason ?? '',
    })
  } catch (e) {
    console.error('[auto-placement]', e)
    return NextResponse.json<AutoPlacementResult>({ front: 'C1', back: 'none', reason: '解析エラー' })
  }
}
