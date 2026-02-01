const { createClient } = require('@supabase/supabase-js');

// 使用您提供的 Supabase 信息
const supabaseUrl = 'https://lgxjdlscsuwgxurlxpk.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneGp4ZGxzY3N1d2d4dXJseHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg2NDQ4MCwiZXhwIjoyMDg1NDQwNDgwfQ.S4gEG-zkEB63mD1HIZJIaU2GGst0rqBYhFgJ4Ko0ECQ';

// 创建具有服务角色权限的客户端
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function createTablesAndPolicies() {
  console.log('正在使用服务角色密钥直接创建 Supabase 表...');

  try {
    // 由于 Supabase JavaScript 客户端不直接支持 DDL 操作，
    // 我们需要使用 PostgREST 直接接口
    
    // 首先尝试通过 REST 接口执行 SQL
    const executeSQL = async (sql) => {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceRoleKey,
          'Authorization': `Bearer ${supabaseServiceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ statement: sql })
      });
      
      return response;
    };

    // 创建 page_config 表
    console.log('创建 page_config 表...');
    const pageConfigSQL = `
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
      const pageConfigResp = await executeSQL(pageConfigSQL);
      console.log(`page_config 表创建状态: ${pageConfigResp.status}`);
      if (!pageConfigResp.ok) {
        console.log('可能需要使用另一种方法创建表');
      }
    } catch (e) {
      console.log('通过 REST API 创建 page_config 表时遇到限制，尝试其他方法');
    }

    // 创建 departments 表
    console.log('创建 departments 表...');
    const departmentsSQL = `
      CREATE TABLE IF NOT EXISTS departments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    try {
      const deptResp = await executeSQL(departmentsSQL);
      console.log(`departments 表创建状态: ${deptResp.status}`);
    } catch (e) {
      console.log('通过 REST API 创建 departments 表时遇到限制');
    }

    // 创建 teams 表
    console.log('创建 teams 表...');
    const teamsSQL = `
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        department_id TEXT REFERENCES departments(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    try {
      const teamsResp = await executeSQL(teamsSQL);
      console.log(`teams 表创建状态: ${teamsResp.status}`);
    } catch (e) {
      console.log('通过 REST API 创建 teams 表时遇到限制');
    }

    // 创建 user_projects 表
    console.log('创建 user_projects 表...');
    const userProjectsSQL = `
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
    
    try {
      const userProjResp = await executeSQL(userProjectsSQL);
      console.log(`user_projects 表创建状态: ${userProjResp.status}`);
    } catch (e) {
      console.log('通过 REST API 创建 user_projects 表时遇到限制');
    }

    // 启用 RLS
    console.log('启用行级安全...');
    const rlsSQLs = [
      'ALTER TABLE page_config ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE departments ENABLE ROW LEVEL SECURITY;', 
      'ALTER TABLE teams ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;'
    ];
    
    for (const rlsSQL of rlsSQLs) {
      try {
        const rlsResp = await executeSQL(rlsSQL);
        console.log(`RLS 语句执行状态: ${rlsResp.status} - ${rlsSQL.substring(0, 40)}...`);
      } catch (e) {
        console.log(`RLS 语句执行遇到限制: ${rlsSQL.substring(0, 40)}...`);
      }
    }

    // 创建策略
    console.log('创建安全策略...');
    const policySQLs = [
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

    for (const policySQL of policySQLs) {
      try {
        const policyResp = await executeSQL(policySQL);
        console.log(`Policy 语句执行状态: ${policyResp.status} - ${policySQL.split('\n')[0]}...`);
      } catch (e) {
        console.log(`Policy 语句执行遇到限制: ${policySQL.split('\n')[0]}...`);
      }
    }

    // 现在尝试插入默认配置数据
    console.log('尝试插入默认配置数据...');
    const { data: existingConfig, error: selectError } = await supabase
      .from('page_config')
      .select()
      .eq('id', 'main');
      
    if (selectError) {
      console.log('查询 page_config 表时出错，表可能还未完全创建:', selectError.message);
    } else if (!existingConfig || existingConfig.length === 0) {
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
        console.log('✅ 默认配置已成功插入到 page_config 表中！');
      }
    } else {
      console.log('ℹ️  page_config 表已存在且已有数据');
    }

    // 验证所有表是否都存在
    console.log('\n验证表的存在...');
    const tablesToCheck = ['page_config', 'departments', 'teams', 'user_projects'];
    
    for (const table of tablesToCheck) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.log(`⚠️  表 ${table} 可能存在问题:`, error.message);
        } else {
          console.log(`✅ 表 ${table} 存在，当前记录数: ${count || 0}`);
        }
      } catch (e) {
        console.log(`⚠️  验证表 ${table} 时出错:`, e.message);
      }
    }

    console.log('\n表创建过程完成！');
    console.log('如果仍有表不存在，请稍等几分钟让 Supabase 完成后台操作，然后刷新仪表板。');
  } catch (error) {
    console.error('创建表时发生错误:', error.message);
    console.error('详细错误:', error);
  }
}

createTablesAndPolicies();