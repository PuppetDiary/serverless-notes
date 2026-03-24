'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Save, Eye, Edit3 } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { TagSelector } from '@/components/notes/TagSelector'

const defaultModules = [
  { id: 1, name: '音乐', slug: 'music', icon: '🎵' },
  { id: 2, name: '电影', slug: 'movies', icon: '🎬' },
  { id: 3, name: '书籍', slug: 'books', icon: '📚' },
  { id: 4, name: '运动', slug: 'sports', icon: '⚽' },
  { id: 5, name: '旅游', slug: 'travel', icon: '✈️' },
]

function NewNoteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const moduleSlug = searchParams.get('module')

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [moduleId, setModuleId] = useState<number>(1)
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [modules, setModules] = useState(defaultModules)
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [loading, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadModules() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('modules').select('*').order('sort_order')
        if (data && data.length > 0) {
          setModules(data)
          if (moduleSlug) {
            const found = data.find((m: { slug: string }) => m.slug === moduleSlug)
            if (found) setModuleId(found.id)
          }
        }
      } catch {
        // 使用默认模块
        if (moduleSlug) {
          const found = defaultModules.find(m => m.slug === moduleSlug)
          if (found) setModuleId(found.id)
        }
      }
    }
    loadModules()
  }, [moduleSlug])

  const handleSave = async () => {
    if (!title.trim()) {
      setError('请输入标题')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('请先登录')
        router.push('/login')
        return
      }

      // 确保 profile 记录存在
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        // 创建 profile 记录
        await supabase.from('profiles').insert({
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          avatar_url: user.user_metadata?.avatar_url || null,
        })
      }

      const { data, error: insertError } = await supabase
        .from('notes')
        .insert({
          title: title.trim(),
          content,
          module_id: moduleId,
          author_id: user.id,
          status,
          category: category.trim() || null,
        })
        .select()
        .single()

      if (insertError) {
        setError(insertError.message)
      } else if (data) {
        // 保存标签关联
        if (selectedTags.length > 0) {
          const tagInserts = selectedTags.map(tagId => ({
            note_id: data.id,
            tag_id: tagId,
          }))
          await supabase.from('note_tags').insert(tagInserts)
        }
        router.push(`/dashboard/notes/${data.id}`)
      }
    } catch (err) {
      setError('保存失败，请重试')
    }

    setSaving(false)
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* 顶部操作栏 */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold flex-1">写随笔</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreview(!preview)}
        >
          {preview ? <Edit3 className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
          {preview ? '编辑' : '预览'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStatus('draft')
            handleSave()
          }}
          disabled={loading}
        >
          保存草稿
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setStatus('published')
            handleSave()
          }}
          disabled={loading}
        >
          <Save className="w-4 h-4 mr-1" />
          发布
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* 标题和元数据 */}
      <div className="space-y-3">
        <Input
          placeholder="请输入标题..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold h-12"
        />
        <div className="flex gap-3">
          <select
            value={moduleId}
            onChange={(e) => setModuleId(Number(e.target.value))}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.icon} {m.name}
              </option>
            ))}
          </select>
          <Input
            placeholder="分类（可选）"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="max-w-48"
          />
        </div>
        <TagSelector
          selectedTags={selectedTags}
          onChange={setSelectedTags}
        />
      </div>

      {/* 编辑器/预览 */}
      <Card className="min-h-[500px]">
        <CardContent className="p-0">
          {preview ? (
            <div className="prose prose-sm max-w-none p-6">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">暂无内容</p>
              )}
            </div>
          ) : (
            <textarea
              placeholder="使用 Markdown 语法开始写作...

# 标题
## 二级标题

**加粗** *斜体* ~~删除线~~

- 列表项 1
- 列表项 2

> 引用

```
代码块
```
"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[500px] p-6 bg-transparent resize-none outline-none text-sm font-mono"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewNotePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="text-muted-foreground">加载中...</div></div>}>
      <NewNoteForm />
    </Suspense>
  )
}