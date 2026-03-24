import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, ArrowLeft, Calendar, Tag } from 'lucide-react'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ModulePage({ params }: PageProps) {
  const { slug } = await params

  let module: { id: number; name: string; slug: string; description: string; icon: string } | null = null
  let notes: Array<{
    id: number
    title: string
    content: string
    status: string
    category: string
    created_at: string
    updated_at: string
  }> = []

  try {
    const supabase = await createClient()

    // 获取模块信息
    const { data: moduleData } = await supabase
      .from('modules')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!moduleData) return notFound()
    module = moduleData

    // 获取该模块下的随笔
    const { data: notesData } = await supabase
      .from('notes')
      .select('*')
      .eq('module_id', moduleData.id)
      .order('updated_at', { ascending: false })

    if (notesData) notes = notesData
  } catch {
    // Supabase 未配置时使用模拟数据
    const defaultModules: Record<string, { id: number; name: string; slug: string; description: string; icon: string }> = {
      music: { id: 1, name: '音乐', slug: 'music', description: '音乐相关的随笔和评论', icon: '🎵' },
      movies: { id: 2, name: '电影', slug: 'movies', description: '电影观后感和影评', icon: '🎬' },
      books: { id: 3, name: '书籍', slug: 'books', description: '读书笔记和书评', icon: '📚' },
      sports: { id: 4, name: '运动', slug: 'sports', description: '运动记录和健身日志', icon: '⚽' },
      travel: { id: 5, name: '旅游', slug: 'travel', description: '旅行游记和攻略', icon: '✈️' },
    }
    module = defaultModules[slug] || null
    if (!module) return notFound()
  }

  if (!module) return notFound()

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{module.icon}</span>
            <h1 className="text-2xl font-bold">{module.name}</h1>
          </div>
          <p className="text-muted-foreground">{module.description}</p>
        </div>
        <Link href={`/dashboard/notes/new?module=${slug}`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            写随笔
          </Button>
        </Link>
      </div>

      {/* 统计 */}
      <div className="flex gap-4">
        <div className="text-sm text-muted-foreground">
          共 <span className="font-semibold text-foreground">{notes.length}</span> 篇随笔
        </div>
      </div>

      {/* 随笔列表 */}
      {notes.length > 0 ? (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Link key={note.id} href={`/dashboard/notes/${note.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{note.title}</CardTitle>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      note.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : note.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {note.status === 'published' ? '已发布' : note.status === 'draft' ? '草稿' : '已归档'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {note.content ? note.content.substring(0, 150) + '...' : '暂无内容'}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.updated_at).toLocaleDateString('zh-CN')}
                    </span>
                    {note.category && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {note.category}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <span className="text-4xl mb-4">{module.icon}</span>
            <h3 className="text-lg font-semibold mb-2">还没有随笔</h3>
            <p className="text-muted-foreground mb-4">在{module.name}模块中写下你的第一篇随笔吧</p>
            <Link href={`/dashboard/notes/new?module=${slug}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                开始创作
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}