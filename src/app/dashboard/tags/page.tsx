'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit, Trash2, Tag as TagIcon } from 'lucide-react'

interface Tag {
  id: number
  name: string
  color: string | null
  created_at: string
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState({ name: '', color: '#1976d2' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) throw error
      setTags(data || [])
    } catch (err) {
      console.error('加载标签失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('请输入标签名称')
      return
    }

    setError(null)
    try {
      const supabase = createClient()

      if (editingTag) {
        // 更新标签
        const { error } = await supabase
          .from('tags')
          .update({ name: formData.name.trim(), color: formData.color })
          .eq('id', editingTag.id)

        if (error) throw error
      } else {
        // 创建标签
        const { error } = await supabase
          .from('tags')
          .insert({ name: formData.name.trim(), color: formData.color })

        if (error) throw error
      }

      setFormData({ name: '', color: '#1976d2' })
      setShowForm(false)
      setEditingTag(null)
      loadTags()
    } catch (err: any) {
      setError(err.message || '操作失败')
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({ name: tag.name, color: tag.color || '#1976d2' })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个标签吗？')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('tags').delete().eq('id', id)

      if (error) throw error
      loadTags()
    } catch (err: any) {
      setError(err.message || '删除失败')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingTag(null)
    setFormData({ name: '', color: '#1976d2' })
    setError(null)
  }

  const colorOptions = [
    { value: '#1976d2', label: '蓝色' },
    { value: '#388e3c', label: '绿色' },
    { value: '#f57c00', label: '橙色' },
    { value: '#d32f2f', label: '红色' },
    { value: '#7b1fa2', label: '紫色' },
    { value: '#0097a7', label: '青色' },
    { value: '#c2185b', label: '粉色' },
    { value: '#616161', label: '灰色' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">标签管理</h1>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-4 h-4 mr-1" />
          新建标签
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* 创建/编辑表单 */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTag ? '编辑标签' : '新建标签'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">标签名称</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="输入标签名称"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">颜色</label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: option.value })}
                      className={`p-3 rounded-md border-2 transition-all ${
                        formData.color === option.value
                          ? 'border-primary scale-105'
                          : 'border-transparent hover:border-muted'
                      }`}
                      style={{ backgroundColor: option.value }}
                    >
                      <span className="text-white text-xs font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  取消
                </Button>
                <Button type="submit">
                  {editingTag ? '保存' : '创建'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 标签列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tags.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center text-muted-foreground">
              <TagIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">暂无标签</p>
              <p className="text-sm">点击"新建标签"创建第一个标签</p>
            </CardContent>
          </Card>
        ) : (
          tags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color || '#1976d2' }}
                    />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tag)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tag.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}