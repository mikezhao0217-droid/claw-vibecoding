const { createClient } = require('@supabase/supabase-js');

// 使用您提供的服务角色密钥
const supabaseUrl = 'https://lgxjdlscsuwgxurlxpk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneGp4ZGxzY3N1d2d4dXJseHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg2NDQ4MCwiZXhwIjoyMDg1NDQwNDgwfQ.S4gEG-zkEB63mD1HIZJIaU2GGst0rqBYhFgJ4Ko0ECQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('开始创建数据库表...');

  try {
    // 创建 page_config 表
    console.log('创建 page_config 表...');
    let { error: pageConfigError } = await supabase.rpc('create_extension', { name: 'pg_stat_statements' });
    
    // 尝试创建表（如果不存在）
    const pageConfigQuery = `
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
    
    const { error: createTableError } = await supabase
      .from('page_config')
      .select()
      .limit(1)
      .then(() => ({ error: null }))
      .catch(async () => {
        // 如果表不存在，则执行创建语句
        console.log('page_config 表不存在，正在创建...');
        const { error } = await supabase.rpc('execute', {
          sql: pageConfigQuery
        }).catch(() => {
          // 如果 rpc.execute 不可用，尝试其他方法
          console.log('使用其他方法创建表...');
          return { error: null }; // 我们将在下一步中处理
        });
        return { error };
      });

    // 实际执行创建表的SQL命令
    const { error: pageConfigCreateError } = await supabase.rpc('execute_sql', {
      statement: pageConfigQuery
    }).catch(() => {
      // 如果自定义RPC不可用，我们需要使用更直接的方法
      console.log('尝试直接创建表...');
      return { error: null };
    });

    // 实际创建表 - 使用 supabase 的标准方法
    // 注意：对于DDL语句，我们需要使用特殊的处理方式
    const ddlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_ddl`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sql: pageConfigQuery
      })
    }).catch(() => {
      console.log('DDL endpoint not available, trying alternative method');
    });

    // 由于 Supabase 不直接支持 DDL 操作，让我们尝试通过自定义函数
    console.log('使用 Supabase RPC 创建表...');
    
    // 部门表
    console.log('创建 departments 表...');
    const departmentsQuery = `
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // 团队表
    console.log('创建 teams 表...');
    const teamsQuery = `
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department_id TEXT REFERENCES departments(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // 用户项目表
    console.log('创建 user_projects 表...');
    const userProjectsQuery = `
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
    `;
    
    // 启用 RLS
    console.log('启用行级安全...');
    const enableRLSQueries = [
      'ALTER TABLE page_config ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE departments ENABLE ROW LEVEL SECURITY;', 
      'ALTER TABLE teams ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;'
    ];
    
    // 创建策略
    console.log('创建安全策略...');
    const policyQueries = [
      // Page config policies
      `CREATE POLICY "Allow read access for all users" ON page_config
        FOR SELECT TO anon
        USING (true);`,
      `CREATE POLICY "Allow insert access for all users" ON page_config
        FOR INSERT TO anon
        WITH CHECK (true);`,
      `CREATE POLICY "Allow update access for all users" ON page_config
        FOR UPDATE TO anon
        USING (true);`,
      
      // Departments policies
      `CREATE POLICY "Allow read access for all users" ON departments
        FOR SELECT TO anon
        USING (true);`,
      `CREATE POLICY "Allow insert access for all users" ON departments
        FOR INSERT TO anon
        WITH CHECK (true);`,
      `CREATE POLICY "Allow update access for all users" ON departments
        FOR UPDATE TO anon
        USING (true);`,
      
      // Teams policies
      `CREATE POLICY "Allow read access for all users" ON teams
        FOR SELECT TO anon
        USING (true);`,
      `CREATE POLICY "Allow insert access for all users" ON teams
        FOR INSERT TO anon
        WITH CHECK (true);`,
      `CREATE POLICY "Allow update access for all users" ON teams
        FOR UPDATE TO anon
        USING (true);`,
      
      // User projects policies
      `CREATE POLICY "Allow read access for all users" ON user_projects
        FOR SELECT TO anon
        USING (true);`,
      `CREATE POLICY "Allow insert access for all users" ON user_projects
        FOR INSERT TO anon
        WITH CHECK (true);`,
      `CREATE POLICY "Allow update access for all users" ON user_projects
        FOR UPDATE TO anon
        USING (true);`
    ];

    // 将所有查询合并
    const allQueries = [pageConfigQuery, departmentsQuery, teamsQuery, userProjectsQuery, ...enableRLSQueries, ...policyQueries];
    
    // 对于 Supabase，我们需要使用 SQL 编辑器功能，这通常通过 API 的特殊方式实现
    console.log('正在执行 SQL 查询...');
    
    // 尝试通过 Supabase API 执行 DDL 语句
    for (let i = 0; i < allQueries.length; i++) {
      const query = allQueries[i];
      console.log(`执行查询 ${i+1}/${allQueries.length}: ${query.substring(0, 50)}...`);
      
      try {
        // 使用 POSTGRES_TYPES 环境变量和 REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ statement: query })
        });
        
        if (!response.ok) {
          console.log(`查询 ${i+1} 可能需要通过 SQL 编辑器手动执行: ${response.status}`);
        }
      } catch (e) {
        console.log(`执行查询 ${i+1} 时遇到预期的限制: ${e.message}`);
        console.log('此查询需要通过 Supabase 仪表板的 SQL 编辑器手动执行');
      }
    }

    // 现在尝试插入默认配置数据
    console.log('尝试插入默认配置数据...');
    const { data, error: selectError } = await supabase
      .from('page_config')
      .select()
      .eq('id', 'main');
      
    if (selectError && selectError.code === '42P01') { // 表不存在错误
      console.log('page_config 表尚未创建，请在 Supabase 仪表板中运行 SQL 脚本');
    } else if (!data || data.length === 0) {
      // 插入默认配置
      const { error: insertError } = await supabase
        .from('page_config')
        .insert([{
          id: 'main',
          project_name: 'Web编码竞赛项目',
          company_progress_title: '公司整体进度',
          department_progress_title: '部门进度排行榜',
          team_progress_title: '小组进度排行榜'
        }]);
        
      if (insertError) {
        console.log('插入默认配置时出错:', insertError.message);
      } else {
        console.log('默认配置已成功插入');
      }
    } else {
      console.log('page_config 表已存在且已有数据');
    }

    console.log('表创建过程完成（可能需要手动完成某些步骤）');
  } catch (error) {
    console.error('创建表时发生错误:', error.message);
  }
}

createTables();