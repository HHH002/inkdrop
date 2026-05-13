import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="p-1">
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-base font-semibold">利用規約</h1>
      </div>

      <div className="px-5 py-6 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-black mb-2">1. 著作権について</h2>
          <p>
            当プラットフォームへの投稿デザインは、著作権法を遵守している必要があります。
            著作権を侵害するデザイン（他者の著作物を無断使用したもの、既存キャラクターの模倣など）の投稿は固く禁止します。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-black mb-2">2. 投稿者の責任</h2>
          <p>
            投稿されたデザインに関する著作権上の問題・第三者からのクレームについては、すべて投稿者本人が責任を負うものとします。
            運営は投稿デザインによる著作権問題について一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-black mb-2">3. 違反コンテンツの対応</h2>
          <p>
            著作権違反が検知または報告された場合、運営は投稿者へ通知のうえ、当該投稿を削除する権限を有します。
            公開後に違反が判明した場合も同様に削除を行います。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-black mb-2">4. キャンセル・返品不可</h2>
          <p>
            当プラットフォームで販売される商品は受注生産品のため、<strong>注文確定後のキャンセルは一切承りません。</strong>また、<strong>返品・交換も承りません。</strong>ご注文前に商品詳細・プレビューをよく確認してください。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-black mb-2">5. 配送について</h2>
          <p>
            配送は日本国内のみ対応します。本土への送料は無料ですが、離島への配送には別途追加送料が発生します。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-black mb-2">6. アカウントの利用</h2>
          <p>
            アカウントは個人・ブランドどちらでも使用できます。退会時は、そのユーザーが投稿した全デザインが削除されます。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-black mb-2">7. 免責事項</h2>
          <p>
            運営は、本サービスの提供・停止・変更について、ユーザーまたは第三者に生じた損害について一切の責任を負わないものとします。
          </p>
        </section>

        <p className="text-xs text-gray-400 pt-4">最終更新日：2026年5月</p>
      </div>
    </div>
  )
}
