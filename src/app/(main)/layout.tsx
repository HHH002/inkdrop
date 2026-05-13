import { BottomNav } from '@/components/layout/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-14">
      {children}
      <BottomNav />
    </div>
  )
}
