// 尝试通过 Supabase REST API 创建表
require('dotenv').config();

const SUPABASE_URL = 'https://lgxjdlscsuwgxurlxpk.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneGp4ZGxzY3N1d2d4dXJseHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg2NDQ4MCwiZXhwIjoyMDg1NDQwNDgwfQ.S4gEG-zkEB63mD1HIZJIaU2GGst0rqBYhFgJ4Ko0ECQ';

async function createTableViaRestApi() {
  console.log('尝试通过 Supabase REST API 创建表...');

  // 尝试通过 PostgREST 直接执行 SQL（如果 Supabase 有此功能）
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS page_config (
      id TEXT PRIMARY KEY DEFAULT 'main',
      project_name TEXT NOT NULL DEFAULT 'Web编码竞赛项目',
      company_progress_title TEXT NOT NULL DEFAULT '公司整体进度',
      department_progress_title TEXT NOT NULL DEFAULT '部门进度排行榜',
      team_progress_title TEXT NOT NULL DEFAULT '小组进度排行榜',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  try {
    // 尝试使用一个特殊的 RPC 函数来执行 DDL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ddl_execute`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql_command: createTableQuery })
    });

    console.log('尝试 1 - 通过 rpc/ddl_execute:', response.status, response.statusText);
  } catch (e) {
    console.log('尝试 1 失败 - rpc/ddl_execute 不存在');
  }

  try {
    // 尝试使用另一个可能的端点
    const response2 = await fetch(`${SUPABASE_URL}/v1/rpc/execute_ddl`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statement: createTableQuery })
    });

    console.log('尝试 2 - 通过 v1/rpc/execute_ddl:', response2.status, response2.statusText);
  } catch (e) {
    console.log('尝试 2 失败 - v1/rpc/execute_ddl 不存在');
  }

  try {
    // 尝试使用 _/functions 端点
    const response3 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statement: createTableQuery })
    });

    console.log('尝试 3 - 通过 rest/v1/rpc/execute_sql:', response3.status, response3.statusText);
  } catch (e) {
    console.log('尝试 3 失败 - rest/v1/rpc/execute_sql 不存在或不允许 DDL');
  }

  // 如果以上都不行，尝试通过数据库连接直接执行
  console.log('\n由于安全限制，标准的 Supabase API 不允许执行 DDL 操作。');
  console.log('需要通过 Supabase 仪表板的 SQL 编辑器来创建表。');
  
  // 现在尝试连接数据库并创建一个简单的测试表来验证连接
  console.log('\n正在验证数据库连接...');
  
  try {
    // 尝试连接并检查现有表
    const testConnection = await fetch(`${SUPABASE_URL}/rest/v1/users?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('连接测试状态:', testConnection.status);
    if (testConnection.ok) {
      console.log('✅ 数据库连接正常！');
    } else {
      console.log('⚠️  数据库连接可能有问题');
    }
  } catch (e) {
    console.log('⚠️  连接测试失败:', e.message);
  }

  console.log('\n=== 总结 ===');
  console.log('我无法通过 API 调用直接创建表，这是 Supabase 的安全特性。');
  console.log('请按照以下步骤手动创建表：');
  console.log('');
  console.log('1. 访问 Supabase 仪表板:');
  console.log('   https://supabase.com/dashboard/project/lgxjdlscsuwgxurlxpk/sql');
  console.log('');
  console.log('2. 在 SQL 编辑器中运行以下完整的 SQL 脚本:');
  console.log('');
  console.log('-- 创建 page_config 表');
  console.log(createTableQuery);
  console.log('');
  console.log('-- 启用行级安全');
  console.log('ALTER TABLE page_config ENABLE ROW LEVEL SECURITY;');
  console.log('');
  console.log('-- 创建安全策略');
  console.log(`CREATE POLICY "Allow read access for all users" ON page_config
    FOR SELECT TO anon
    USING (true);

CREATE POLICY "Allow insert access for all users" ON page_config
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON page_config
  FOR UPDATE TO anon
  USING (true);`);
  console.log('');
  console.log('3. 然后运行以下命令来创建其他必需的表:');
  console.log(`
-- 部门表
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 团队表
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户项目表
CREATE TABLE IF NOT EXISTS user_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  department TEXT REFERENCES departments(id),
  team TEXT REFERENCES teams(id),
  milestones JSONB NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- 部门策略
CREATE POLICY "Allow read access for all users" ON departments
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON departments
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON departments
  FOR UPDATE TO anon
  USING (true);

-- 团队策略
CREATE POLICY "Allow read access for all users" ON teams
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON teams
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON teams
  FOR UPDATE TO anon
  USING (true);

-- 用户项目策略
CREATE POLICY "Allow read access for all users" ON user_projects
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON user_projects
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON user_projects
  FOR UPDATE TO anon
  USING (true);
  `);
  console.log('');
  console.log('完成这些步骤后，我们的应用将能够完全正常运行。');
}

createTableViaRestApi();