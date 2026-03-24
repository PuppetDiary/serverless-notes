'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, Film, BookOpen, Dumbbell, Plane } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      } else {
        setMessage('注册成功！请检查您的邮箱以确认账号。')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo 和标题 */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-3 text-3xl">
            <span>🎵</span>
            <span>🎬</span>
            <span>📚</span>
            <span>⚽</span>
            <span>✈️</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">个人随笔系统</h1>
          <p className="text-muted-foreground">记录生活中的美好瞬间</p>
        </div>

        {/* 登录/注册表单 */}
        <Card>
          <CardHeader>
            <CardTitle>{isSignUp ? '创建账号' : '登录'}</CardTitle>
            <CardDescription>
              {isSignUp ? '填写以下信息创建您的账号' : '使用您的账号登录系统'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  邮箱
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  密码
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="至少6位密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
              {message && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  {message}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '处理中...' : isSignUp ? '注册' : '登录'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setMessage(null)
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignUp ? '已有账号？点击登录' : '没有账号？点击注册'}
              </button>
            </CardFooter>
          </form>
        </Card>

        {/* 模块展示 */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { icon: <Music className="w-5 h-5" />, label: '音乐' },
            { icon: <Film className="w-5 h-5" />, label: '电影' },
            { icon: <BookOpen className="w-5 h-5" />, label: '书籍' },
            { icon: <Dumbbell className="w-5 h-5" />, label: '运动' },
            { icon: <Plane className="w-5 h-5" />, label: '旅游' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary/50 text-secondary-foreground">
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}