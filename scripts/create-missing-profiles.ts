import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少必要的环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createMissingProfiles() {
  try {
    console.log('开始检查缺失的 profile 记录...')

    // 获取所有认证用户
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('获取用户列表失败:', usersError)
      return
    }

    console.log(`找到 ${users.length} 个用户`)

    // 获取所有现有的 profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')

    if (profilesError) {
      console.error('获取 profiles 失败:', profilesError)
      return
    }

    const existingProfileIds = new Set(profiles?.map(p => p.id) || [])
    console.log(`找到 ${existingProfileIds.size} 个现有 profile`)

    // 找出缺失的 profiles
    const missingProfiles = users.filter(user => !existingProfileIds.has(user.id))

    if (missingProfiles.length === 0) {
      console.log('所有用户都有对应的 profile 记录')
      return
    }

    console.log(`发现 ${missingProfiles.length} 个缺失的 profile，开始创建...`)

    // 创建缺失的 profiles
    const profileInserts = missingProfiles.map(user => ({
      id: user.id,
      username: user.email?.split('@')[0] || 'user',
      avatar_url: user.user_metadata?.avatar_url || null,
    }))

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(profileInserts)

    if (insertError) {
      console.error('创建 profiles 失败:', insertError)
      return
    }

    console.log(`成功创建 ${missingProfiles.length} 个 profile 记录`)
    
    // 显示创建的用户信息
    missingProfiles.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`)
    })

  } catch (error) {
    console.error('执行失败:', error)
  }
}

createMissingProfiles()