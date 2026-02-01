#!/bin/bash

# Supabase 表创建脚本
# 请注意：通常情况下，DDL 操作（如 CREATE TABLE）需要通过 Supabase 仪表板的 SQL 编辑器执行
# 但我们可以使用服务角色密钥通过 API 来执行

echo "正在准备创建 Supabase 表..."

# 提取 Supabase 信息
PROJECT_ID="lgxjdlscsuwgxurlxpk"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxneGp4ZGxzY3N1d2d4dXJseHBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTg2NDQ4MCwiZXhwIjoyMDg1NDQwNDgwfQ.S4gEG-zkEB63mD1HIZJIaU2GGst0rqBYhFgJ4Ko0ECQ"

# 创建包含所有 DDL 语句的 SQL 文件
cat > /tmp/schema.sql << EOF
-- Page configuration table
CREATE TABLE IF NOT EXISTS page_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  project_name TEXT NOT NULL DEFAULT 'Web编码竞赛项目',
  company_progress_title TEXT NOT NULL DEFAULT '公司整体进度',
  department_progress_title TEXT NOT NULL DEFAULT '部门进度排行榜',
  team_progress_title TEXT NOT NULL DEFAULT '小组进度排行榜',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  department_id TEXT REFERENCES departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User projects table (each user has their own project instances)
CREATE TABLE IF NOT EXISTS user_projects (
  id TEXT TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  department TEXT REFERENCES departments(id),
  team TEXT REFERENCES teams(id),
  milestones JSONB NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE page_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Page config policies
CREATE POLICY "Allow read access for all users" ON page_config
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON page_config
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON page_config
  FOR UPDATE TO anon
  USING (true);

-- Departments policies
CREATE POLICY "Allow read access for all users" ON departments
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON departments
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON departments
  FOR UPDATE TO anon
  USING (true);

-- Teams policies
CREATE POLICY "Allow read access for all users" ON teams
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON teams
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON teams
  FOR UPDATE TO anon
  USING (true);

-- User projects policies
CREATE POLICY "Allow read access for all users" ON user_projects
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON user_projects
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON user_projects
  FOR UPDATE TO anon
  USING (true);
EOF

echo "SQL 文件已创建，内容如下："
echo "----------------------------------------"
cat /tmp/schema.sql
echo "----------------------------------------"
echo ""
echo "注意：由于安全限制，您需要在 Supabase 仪表板中运行这些 SQL 语句。"
echo "请执行以下步骤："
echo "1. 访问 https://supabase.com/dashboard/project/lgxjdlscsuwgxurlxpk/sql"
echo "2. 将上面的 SQL 语句复制到 SQL 编辑器中"
echo "3. 点击 'RUN' 按钮执行"
echo ""
echo "或者，如果您有 pgAdmin 或其他 PostgreSQL 客户端，可以使用以下连接信息："
echo "Host: lgxjdlscsuwgxurlxpk.supabase.co"
echo "Database: postgres"
echo "Username: postgres"
echo "Password: 从项目设置中获取"
echo "Port: 5432"
echo ""
echo "执行完这些 SQL 语句后，表结构就会被创建，我们的应用就可以正常使用了。"