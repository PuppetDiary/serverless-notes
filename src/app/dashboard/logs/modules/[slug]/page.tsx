import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ModuleLogPage({ params }: PageProps) {
  const { slug } = await params

  let module: { id: number; name: string; slug: string; description: string; icon: string } | null = null
  let logs: Array<{ id: number; description: string; operation_type: string; created_at: string; note_id: number | null }> = []
  let noteCount = 0

  try {
    const supabase = await createClient()

    const { data: moduleData } = await supabase
      .from('modules')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!moduleData) return notFound()
    module = moduleData

    // 获取该模块的日志（此时 module 已赋值，但 TS 分析不到，用 moduleData）
    const { data: logsData } = await supabase
      .from('change_logs')
      .select('*')
      .eq('module_id', moduleData.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (logsData) logs = logsData

    // 获取该模块的随笔数量
    const { count } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', moduleData.id)

    if (count !== null) noteCount = count
  } catch {
    const defaultModules: Record<string, { id: number; name: string; slug: string; description: string; icon: string }> = {
      music: { id: 1, name: '音乐', slug: 'music', description: '音乐相关的随笔和评论', icon: '🎵' },
      movies: { id: 2, name: '电影', slug: 'movies', description: '电影观后感和影评', icon: '🎬' },
      books: { id: 3, name: '书籍', slug: 'books', description: '读书笔记和书评', icon: '📚' },
      sports: { id: 4, name: '运动', slug: 'sports', description: '运动记录和健身日志', icon: '⚽' },
      travel: { id: 5, name: '旅游', slug: 'travel', description: '旅行游记和攻略', icon: '✈️' },
    }
    module = defaultModules[slug] || null
  }

  if (!module) return notFound()

  // 按月份分组日志
  const logsByMonth: Record<string, typeof logs> = {}
  logs.forEach(log => {
    const date = new Date(log.created_at)
    const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`
    if (!logsByMonth[monthKey]) logsByMonth[monthKey] = []
    logsByMonth[monthKey].push(log)
  })

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/logs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>{module.icon}</span>
            {module.name}模块状态日志
          </h1>
          <p className="text-muted-foreground">{module.description}</p>
        </div>
      </div>

      {/* 模块统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>随笔数量</CardDescription>
            <CardTitle className="text-2xl">{noteCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>变更记录</CardDescription>
            <CardTitle className="text-2xl">{logs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>最后更新</CardDescription>
            <CardTitle className="text-lg">
              {logs.length > 0
                ? new Date(logs[0].created_at).toLocaleDateString('zh-CN')
                : '暂无记录'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 快速链接 */}
      <div className="flex gap-3">
        <Link href={`/dashboard/modules/${slug}`}>
          <Button variant="outline" size="sm">
            查看{module.name}随笔 <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* 详细日志（按月分组） */}
      <div>
        <h2 className="text-lg font-semibold mb-3">详细修改日志</h2>
        {Object.keys(logsByMonth).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(logsByMonth).map(([month, monthLogs]) => (
              <Card key={month}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{month}</CardTitle>
                  <CardDescription>{monthLogs.length} 条记录</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 text-sm border-b last:border-0 pb-2 last:pb-0">
                        <span className="text-xs text-muted-foreground shrink-0 w-16">
                          {new Date(log.created_at).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
                          log.operation_type === 'CREATE' ? 'bg-green-100 text-green-800' :
                          log.operation_type === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                          log.operation_type === 'DELETE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.operation_type === 'CREATE' ? '新增' :
                           log.operation_type === 'UPDATE' ? '更新' :
                           log.operation_type === 'DELETE' ? '删除' :
                           log.operation_type}
                        </span>
                        <span className="flex-1">{log.description}</span>
                        {log.note_id && (
                          <Link href={`/dashboard/notes/${log.note_id}`}>
                            <Button variant="ghost" size="sm" className="h-6 text-xs">
                              查看
                            </Button>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              暂无{module.name}模块的修改日志
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}