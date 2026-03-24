import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Music, Film, BookOpen, Dumbbell, Plane, Plus, FileText } from 'lucide-react'

const moduleIcons: Record<string, React.ReactNode> = {
  music: <Music className="w-8 h-8" />,
  movies: <Film className="w-8 h-8" />,
  books: <BookOpen className="w-8 h-8" />,
  sports: <Dumbbell className="w-8 h-8" />,
  travel: <Plane className="w-8 h-8" />,
}

const moduleColors: Record<string, string> = {
  music: 'text-purple-500',
  movies: 'text-red-500',
  books: 'text-blue-500',
  sports: 'text-green-500',
  travel: 'text-orange-500',
}

export default async function DashboardPage() {
  let modules: Array<{ id: number; name: string; slug: string; description: string; icon: string }> = []
  let noteCounts: Record<number, number> = {}
  let recentLogs: Array<{ id: number; description: string; operation_type: string; created_at: string }> = []
  let totalNotes = 0

  try {
    const supabase = await createClient()

    // 获取模块列表
    const { data: modulesData } = await supabase
      .from('modules')
      .select('*')
      .order('sort_order', { ascending: true })

    if (modulesData) modules = modulesData

    // 获取每个模块的随笔数量
    const { data: notesData } = await supabase
      .from('notes')
      .select('module_id')

    if (notesData) {
      totalNotes = notesData.length
      notesData.forEach((note: { module_id: number }) => {
        noteCounts[note.module_id] = (noteCounts[note.module_id] || 0) + 1
      })
    }

    // 获取最近的日志
    const { data: logsData } = await supabase
      .from('change_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (logsData) recentLogs = logsData
  } catch {
    // Supabase 未配置时使用默认数据
    modules = [
      { id: 1, name: '音乐', slug: 'music', description: '音乐相关的随笔和评论', icon: '🎵' },
      { id: 2, name: '电影', slug: 'movies', description: '电影观后感和影评', icon: '🎬' },
      { id: 3, name: '书籍', slug: 'books', description: '读书笔记和书评', icon: '📚' },
      { id: 4, name: '运动', slug: 'sports', description: '运动记录和健身日志', icon: '⚽' },
      { id: 5, name: '旅游', slug: 'travel', description: '旅行游记和攻略', icon: '✈️' },
    ]
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">仪表盘</h1>
          <p className="text-muted-foreground">欢迎回来！这里是您的个人随笔系统概览。</p>
        </div>
        <Link href="/dashboard/notes/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            写随笔
          </Button>
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总随笔数</CardDescription>
            <CardTitle className="text-3xl">{totalNotes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">所有模块中的随笔总数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>活跃模块</CardDescription>
            <CardTitle className="text-3xl">{modules.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">音乐 · 电影 · 书籍 · 运动 · 旅游</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>最近变更</CardDescription>
            <CardTitle className="text-3xl">{recentLogs.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">最近的操作日志记录</p>
          </CardContent>
        </Card>
      </div>

      {/* 模块卡片 */}
      <div>
        <h2 className="text-lg font-semibold mb-3">模块概览</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {modules.map((module) => (
            <Link key={module.id} href={`/dashboard/modules/${module.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className={`${moduleColors[module.slug] || 'text-primary'}`}>
                    {moduleIcons[module.slug] || <FileText className="w-8 h-8" />}
                  </div>
                  <CardTitle className="text-base">{module.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {noteCounts[module.id] || 0} 篇随笔
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 最近日志 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">最近变更</h2>
          <Link href="/dashboard/logs">
            <Button variant="ghost" size="sm">查看全部</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-4">
            {recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      log.operation_type === 'CREATE' ? 'bg-green-100 text-green-800' :
                      log.operation_type === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                      log.operation_type === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.operation_type}
                    </span>
                    <span className="flex-1">{log.description}</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(log.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                暂无日志记录。开始创建您的第一篇随笔吧！
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}