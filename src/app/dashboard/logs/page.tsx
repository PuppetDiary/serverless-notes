import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Music, Film, BookOpen, Dumbbell, Plane, FileText, ArrowRight } from 'lucide-react'

const moduleIcons: Record<string, React.ReactNode> = {
  music: <Music className="w-5 h-5" />,
  movies: <Film className="w-5 h-5" />,
  books: <BookOpen className="w-5 h-5" />,
  sports: <Dumbbell className="w-5 h-5" />,
  travel: <Plane className="w-5 h-5" />,
}

export default async function LogsPage() {
  let modules: Array<{ id: number; name: string; slug: string; description: string; icon: string }> = []
  let recentLogs: Array<{ id: number; description: string; operation_type: string; created_at: string; module_id: number }> = []
  let totalLogs = 0
  let totalNotes = 0

  try {
    const supabase = await createClient()

    const { data: modulesData } = await supabase
      .from('modules')
      .select('*')
      .order('sort_order')

    if (modulesData) modules = modulesData

    const { data: logsData, count } = await supabase
      .from('change_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(20)

    if (logsData) recentLogs = logsData
    if (count !== null) totalLogs = count

    const { count: notesCount } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })

    if (notesCount !== null) totalNotes = notesCount
  } catch {
    modules = [
      { id: 1, name: '音乐', slug: 'music', description: '音乐相关的随笔和评论', icon: '🎵' },
      { id: 2, name: '电影', slug: 'movies', description: '电影观后感和影评', icon: '🎬' },
      { id: 3, name: '书籍', slug: 'books', description: '读书笔记和书评', icon: '📚' },
      { id: 4, name: '运动', slug: 'sports', description: '运动记录和健身日志', icon: '⚽' },
      { id: 5, name: '旅游', slug: 'travel', description: '旅行游记和攻略', icon: '✈️' },
    ]
  }

  // 按日期分组日志
  const logsByDate: Record<string, typeof recentLogs> = {}
  recentLogs.forEach(log => {
    const date = new Date(log.created_at).toLocaleDateString('zh-CN')
    if (!logsByDate[date]) logsByDate[date] = []
    logsByDate[date].push(log)
  })

  return (
    <div className="space-y-6">
      {/* 一级日志：系统概览 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          系统日志概览
        </h1>
        <p className="text-muted-foreground mt-1">
          完整追溯系统演进历史和内容变更记录
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总随笔数</CardDescription>
            <CardTitle className="text-3xl">{totalNotes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>变更日志</CardDescription>
            <CardTitle className="text-3xl">{totalLogs}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>活跃模块</CardDescription>
            <CardTitle className="text-3xl">{modules.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 二级日志入口：各模块状态 */}
      <div>
        <h2 className="text-lg font-semibold mb-3">模块状态日志</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {modules.map((module) => (
            <Link key={module.id} href={`/dashboard/logs/modules/${module.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-xl">{module.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{module.name}</p>
                    <p className="text-xs text-muted-foreground">查看模块日志</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 最近变更时间线 */}
      <div>
        <h2 className="text-lg font-semibold mb-3">最近变更时间线</h2>
        <Card>
          <CardContent className="p-4">
            {Object.keys(logsByDate).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(logsByDate).map(([date, logs]) => (
                  <div key={date}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">{date}</h3>
                    <div className="space-y-2 ml-4 border-l-2 border-border pl-4">
                      {logs.map((log) => {
                        const module = modules.find(m => m.id === log.module_id)
                        return (
                          <div key={log.id} className="flex items-start gap-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
                              log.operation_type === 'CREATE' ? 'bg-green-100 text-green-800' :
                              log.operation_type === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                              log.operation_type === 'DELETE' ? 'bg-red-100 text-red-800' :
                              log.operation_type === 'PUBLISH' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.operation_type === 'CREATE' ? '新增' :
                               log.operation_type === 'UPDATE' ? '更新' :
                               log.operation_type === 'DELETE' ? '删除' :
                               log.operation_type === 'PUBLISH' ? '发布' :
                               log.operation_type}
                            </span>
                            {module && (
                              <span className="text-xs text-muted-foreground shrink-0">
                                [{module.name}]
                              </span>
                            )}
                            <span className="flex-1">{log.description}</span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {new Date(log.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                暂无变更记录。开始创建您的第一篇随笔，日志系统将自动记录所有操作。
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}