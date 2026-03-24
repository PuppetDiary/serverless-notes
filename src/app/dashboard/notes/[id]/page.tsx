import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Calendar, Tag, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NoteDetailPage({ params }: PageProps) {
  const { id } = await params

  let note: {
    id: number
    title: string
    content: string
    status: string
    category: string
    created_at: string
    updated_at: string
    module_id: number
  } | null = null

  let moduleName = ''
  let moduleSlug = ''

  let tags: Array<{ id: number; name: string; color: string | null }> = []

  try {
    const supabase = await createClient()

    const { data } = await supabase
      .from('notes')
      .select('*, modules(name, slug)')
      .eq('id', Number(id))
      .single()

    if (!data) return notFound()
    note = data
    moduleName = (data as any).modules?.name || ''
    moduleSlug = (data as any).modules?.slug || ''

    // 加载标签
    const { data: tagData } = await supabase
      .from('note_tags')
      .select('tags(id, name, color)')
      .eq('note_id', Number(id))
    if (tagData) {
      tags = tagData.map((t: any) => t.tags).filter(Boolean)
    }
  } catch {
    return notFound()
  }

  if (!note) return notFound()

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* 顶部操作栏 */}
      <div className="flex items-center gap-4">
        <Link href={moduleSlug ? `/dashboard/modules/${moduleSlug}` : '/dashboard'}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{note.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            {moduleName && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {moduleName}
              </span>
            )}
            {note.category && (
              <span>· {note.category}</span>
            )}
            {tags.length > 0 && tags.map(tag => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: tag.color || '#1976d2' }}
              >
                {tag.name}
              </span>
            ))}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(note.created_at).toLocaleDateString('zh-CN')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              更新于 {new Date(note.updated_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${
          note.status === 'published'
            ? 'bg-green-100 text-green-800'
            : note.status === 'draft'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {note.status === 'published' ? '已发布' : note.status === 'draft' ? '草稿' : '已归档'}
        </span>
        <Link href={`/dashboard/notes/${note.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-1" />
            编辑
          </Button>
        </Link>
      </div>

      {/* 文章内容 */}
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none">
            {note.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">暂无内容</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}