-- Supabase 表创建脚本
-- 请在 Supabase 仪表板的 SQL 编辑器中运行此脚本

-- 创建 page_config 表（新增的表，用于存储页面配置）
CREATE TABLE IF NOT EXISTS page_config (
  id TEXT PRIMARY KEY DEFAULT 'main',
  project_name TEXT NOT NULL DEFAULT 'Web编码竞赛项目',
  company_progress_title TEXT NOT NULL DEFAULT '公司整体进度',
  department_progress_title TEXT NOT NULL DEFAULT '部门进度排行榜',
  team_progress_title TEXT NOT NULL DEFAULT '小组进度排行榜',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- 用户项目表（每个用户都有自己的项目实例）
CREATE TABLE IF NOT EXISTS user_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  department TEXT REFERENCES departments(id),
  team TEXT REFERENCES teams(id),
  milestones JSONB NOT NULL, -- 包含 id, name, completed 的里程碑对象数组
  user_id TEXT NOT NULL, -- 拥有此项目实例的用户ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全（RLS）
ALTER TABLE page_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- page_config 表的安全策略
CREATE POLICY "Allow read access for all users" ON page_config
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON page_config
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON page_config
  FOR UPDATE TO anon
  USING (true);

-- departments 表的安全策略
CREATE POLICY "Allow read access for all users" ON departments
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON departments
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON departments
  FOR UPDATE TO anon
  USING (true);

-- teams 表的安全策略
CREATE POLICY "Allow read access for all users" ON teams
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON teams
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON teams
  FOR UPDATE TO anon
  USING (true);

-- user_projects 表的安全策略
CREATE POLICY "Allow read access for all users" ON user_projects
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON user_projects
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON user_projects
  FOR UPDATE TO anon
  USING (true);

-- 插入默认配置数据（如果不存在）
INSERT INTO page_config (id, project_name, company_progress_title, department_progress_title, team_progress_title)
SELECT 'main', 'Web编码竞赛项目', '公司整体进度', '部门进度排行榜', '小组进度排行榜'
WHERE NOT EXISTS (SELECT 1 FROM page_config WHERE id = 'main');

-- 插入默认部门数据（如果不存在）
INSERT INTO departments (id, name)
SELECT 'engineering', '工程部'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE id = 'engineering');

INSERT INTO departments (id, name)
SELECT 'marketing', '市场部'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE id = 'marketing');

INSERT INTO departments (id, name)
SELECT 'sales', '销售部'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE id = 'sales');

INSERT INTO departments (id, name)
SELECT 'hr', '人事部'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE id = 'hr');

-- 插入默认团队数据（如果不存在）
INSERT INTO teams (id, name, department_id)
SELECT 'frontend', '前端组', 'engineering'
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE id = 'frontend');

INSERT INTO teams (id, name, department_id)
SELECT 'backend', '后端组', 'engineering'
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE id = 'backend');

INSERT INTO teams (id, name, department_id)
SELECT 'mobile', '移动端组', 'engineering'
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE id = 'mobile');

INSERT INTO teams (id, name, department_id)
SELECT 'content', '内容组', 'marketing'
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE id = 'content');

INSERT INTO teams (id, name, department_id)
SELECT 'creative', '创意组', 'marketing'
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE id = 'creative');

-- 输出确认信息
SELECT '所有表和默认数据已创建完成！' AS status;