'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Save, Eye, Edit3, Trash2 } from 'lucide-react'
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

export default function EditNotePage() {
  const router = useRouter()
  const params = useParams()
  const noteId = params.id as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [moduleId, setModuleId] = useState<number>(1)
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [modules, setModules] = useState(defaultModules)
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function loadNote() {
      try {
        const supabase = createClient()
        
        // 加载模块
        const { data: modulesData } = await supabase.from('modules').select('*').order('sort_order')
        if (modulesData && modulesData.length > 0) {
          setModules(modulesData)
        }

        // 加载随笔
        const { data: noteData, error: noteError } = await supabase
          .from('notes')
          .select('*')
          .eq('id', Number(noteId))
          .single()

        if (noteError) {
          setError('随笔不存在')
          return
        }

        if (noteData) {
          setTitle(noteData.title)
          setContent(noteData.content || '')
          setModuleId(noteData.module_id)
          setCategory(noteData.category || '')
          setStatus(noteData.status as 'draft' | 'published')

          // 加载标签
          const { data: tagData } = await supabase
            .from('note_tags')
            .select('tag_id')
            .eq('note_id', Number(noteId))
          if (tagData) {
            setSelectedTags(tagData.map(t => t.tag_id))
          }
        }
      } catch (err) {
        setError('加载失败')
      } finally {
        setLoading(false)
      }
    }
    loadNote()
  }, [noteId])

  const handleSave = async (newStatus?: 'draft' | 'published') => {
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

      const { error: updateError } = await supabase
        .from('notes')
        .update({
          title: title.trim(),
          content,
          module_id: moduleId,
          status: newStatus || status,
          category: category.trim() || null,
        })
        .eq('id', Number(noteId))

      if (updateError) {
        setError(updateError.message)
      } else {
        // 更新标签关联
        await supabase.from('note_tags').delete().eq('note_id', Number(noteId))
        if (selectedTags.length > 0) {
          const tagInserts = selectedTags.map(tagId => ({
            note_id: Number(noteId),
            tag_id: tagId,
          }))
          await supabase.from('note_tags').insert(tagInserts)
        }
        router.push(`/dashboard/notes/${noteId}`)
      }
    } catch (err) {
      setError('保存失败，请重试')
    }

    setSaving(false)
  }

  const handleDelete = async () => {
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', Number(noteId))

      if (deleteError) {
        setError(deleteError.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (error && !title) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
        <Link href="/dashboard">
          <Button variant="outline">返回首页</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* 顶部操作栏 */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/notes/${noteId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold flex-1">编辑随笔</h1>
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
          onClick={() => handleSave('draft')}
          disabled={saving}
        >
          保存草稿
        </Button>
        <Button
          size="sm"
          onClick={() => handleSave('published')}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-1" />
          {status === 'published' ? '更新' : '发布'}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">确认删除</h3>
              <p className="text-sm text-muted-foreground">
                确定要删除这篇随笔吗？此操作无法撤销。
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  确认删除
                </Button>
              </div>
            </CardContent>
          </Card>
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
          noteId={Number(noteId)}
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