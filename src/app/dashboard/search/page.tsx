'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Calendar, Tag, FileText } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: number
  title: string
  content: string
  category: string | null
  created_at: string
  module_id: number
  modules?: {
    name: string
    slug: string
    icon: string
  }
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedModule, setSelectedModule] = useState<string>('all')
  const [modules, setModules] = useState<Array<{ id: number; name: string; slug: string; icon: string }>>([])

  useEffect(() => {
    async function loadModules() {
      const supabase = createClient()
      const { data } = await supabase.from('modules').select('*').order('sort_order')
      if (data) setModules(data)
    }
    loadModules()
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      let queryBuilder = supabase
        .from('notes')
        .select('*, modules(name, slug, icon)')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(50)

      if (selectedModule !== 'all') {
        const module = modules.find(m => m.slug === selectedModule)
        if (module) {
          queryBuilder = queryBuilder.eq('module_id', module.id)
        }
      }

      const { data, error } = await queryBuilder

      if (error) {
        console.error('搜索失败:', error)
        setResults([])
      } else {
        setResults(data || [])
      }
    } catch (err) {
      console.error('搜索出错:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch()
    }, 300)
    return () => clearTimeout(timer)
  }, [query, selectedModule])

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>
        : part
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">搜索随笔</h1>
        
        {/* 搜索框 */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索标题或内容..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="all">所有模块</option>
            {modules.map((m) => (
              <option key={m.id} value={m.slug}>
                {m.icon} {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* 搜索统计 */}
        {query && (
          <div className="text-sm text-muted-foreground">
            {loading ? '搜索中...' : `找到 ${results.length} 条结果`}
          </div>
        )}
      </div>

      {/* 搜索结果 */}
      <div className="space-y-3">
        {results.length === 0 && query && !loading && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>未找到相关随笔</p>
            </CardContent>
          </Card>
        )}

        {results.map((note) => (
          <Link key={note.id} href={`/dashboard/notes/${note.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {highlightText(note.title, query)}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {note.modules && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {note.modules.icon} {note.modules.name}
                      </span>
                    )}
                    {note.category && (
                      <span>· {note.category}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>

                  {note.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {highlightText(
                        note.content.substring(0, 200).replace(/[#*`>\-\[\]]/g, ''),
                        query
                      )}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 空状态 */}
      {!query && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">开始搜索</p>
            <p className="text-sm">输入关键词搜索您的随笔</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}