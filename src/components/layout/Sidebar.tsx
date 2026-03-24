'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Music,
  Film,
  BookOpen,
  Dumbbell,
  Plane,
  FileText,
  Tags,
  Settings,
  Menu,
  X,
  Search,
} from 'lucide-react'
import { useState } from 'react'

const modules = [
  { name: '音乐', slug: 'music', icon: Music, emoji: '🎵' },
  { name: '电影', slug: 'movies', icon: Film, emoji: '🎬' },
  { name: '书籍', slug: 'books', icon: BookOpen, emoji: '📚' },
  { name: '运动', slug: 'sports', icon: Dumbbell, emoji: '⚽' },
  { name: '旅游', slug: 'travel', icon: Plane, emoji: '✈️' },
]

const navItems = [
  { name: '仪表盘', href: '/dashboard', icon: LayoutDashboard },
  { name: '搜索', href: '/dashboard/search', icon: Search },
  ...modules.map((m) => ({
    name: m.name,
    href: `/dashboard/modules/${m.slug}`,
    icon: m.icon,
  })),
  { name: '标签管理', href: '/dashboard/tags', icon: Tags },
  { name: '系统日志', href: '/dashboard/logs', icon: FileText },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r flex flex-col transition-transform duration-200 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <span className="font-bold text-lg">个人随笔</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* 底部设置 */}
        <div className="p-3 border-t">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
            设置
          </Link>
        </div>
      </aside>
    </>
  )
}