'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart2, PlusSquare, DollarSign, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'ホーム' },
  { href: '/ranking', icon: BarChart2, label: 'ランキング' },
  { href: '/post', icon: PlusSquare, label: '投稿' },
  { href: '/earnings', icon: DollarSign, label: '収益' },
  { href: '/mypage', icon: User, label: 'マイページ' },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-white border-t border-gray-100 safe-bottom">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                isActive ? 'text-black' : 'text-gray-400'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.7} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
