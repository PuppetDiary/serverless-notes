'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { X, Plus } from 'lucide-react'

interface Tag {
  id: number
  name: string
  color: string | null
}

interface TagSelectorProps {
  noteId?: number
  selectedTags: number[]
  onChange: (tagIds: number[]) => void
}

export function TagSelector({ noteId, selectedTags, onChange }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase.from('tags').select('*').order('name')
      if (data) setAllTags(data)
    } catch (err) {
      console.error('加载标签失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTag = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId))
    } else {
      onChange([...selectedTags, tagId])
    }
  }

  const selectedTagObjects = allTags.filter(tag => selectedTags.includes(tag.id))
  const availableTags = allTags.filter(tag => !selectedTags.includes(tag.id))

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">标签</label>
      
      {/* 已选标签 */}
      <div className="flex flex-wrap gap-2">
        {selectedTagObjects.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white"
            style={{ backgroundColor: tag.color || '#1976d2' }}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleToggleTag(tag.id)}
              className="hover:bg-white/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        {/* 添加标签按钮 */}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border border-dashed hover:bg-accent"
        >
          <Plus className="w-3 h-3" />
          添加标签
        </button>
      </div>

      {/* 标签下拉列表 */}
      {showDropdown && (
        <div className="relative">
          <div className="absolute z-10 mt-1 w-full max-w-xs bg-background border rounded-md shadow-lg p-2 space-y-1">
            {loading ? (
              <div className="text-sm text-muted-foreground p-2">加载中...</div>
            ) : availableTags.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2">
                没有更多标签了
              </div>
            ) : (
              availableTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    handleToggleTag(tag.id)
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent text-sm flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color || '#1976d2' }}
                  />
                  {tag.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}