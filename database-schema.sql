-- Create the tables for the claw-vibecoding application with user-specific projects

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
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL, -- The user responsible for this project
  department TEXT REFERENCES departments(id),
  team TEXT REFERENCES teams(id),
  milestones JSONB NOT NULL, -- Array of milestone objects with id, name, completed
  user_id TEXT NOT NULL, -- References the user who owns this project instance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE page_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Create policies to allow read/write access for anon users (for demo purposes)
-- In production, you may want to implement more granular security policies

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