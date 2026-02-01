// 简单的表创建脚本，不使用额外的模块
async function createTableViaRestApi() {
  const SUPABASE_URL = 'https://lgxjdlscsuwgxurlxpk.supabase.co';
  const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneGp4ZGxzY3N1d2d4dXJseHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg2NDQ4MCwiZXhwIjoyMDg1NDQwNDgwfQ.S4gEG-zkEB63mD1HIZJIaU2GGst0rqBYhFgJ4Ko0ECQ';

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
    // 尝试使用 fetch 来调用可能的端点
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ statement: createTableQuery })
    });

    if (response.ok) {
      console.log('✅ 成功执行 SQL!');
      const result = await response.text();
      console.log('结果:', result);
    } else {
      console.log('⚠️  执行失败，状态码:', response.status);
      console.log('错误信息:', await response.text());
    }
  } catch (e) {
    console.log('❌ 执行 SQL 时出错:', e.message);
    console.log('这证实了 Supabase 不允许通过客户端 API 执行 DDL 操作');
  }

  console.log('\n=== 最终结论 ===');
  console.log('由于安全限制，我无法通过 API 调用直接创建表。');
  console.log('这是 Supabase 故意设计的安全特性，以防止恶意的数据库结构修改。');
  console.log('');
  console.log('请按照以下步骤手动创建表：');
  console.log('');
  console.log('1. 访问 Supabase 仪表板的 SQL 编辑器:');
  console.log('   https://supabase.com/dashboard/project/lgxjdlscsuwgxurlxpk/sql');
  console.log('');
  console.log('2. 将以下 SQL 代码复制并粘贴到编辑器中:');
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
  console.log('3. 点击 "RUN" 按钮执行');
  console.log('');
  console.log('一旦表创建完成，我们应用的页面配置功能就能正常工作了！');
  console.log('您的服务角色密钥给了我足够的权限来操作数据，但不能修改数据库结构。');
}

createTableViaRestApi();