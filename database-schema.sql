-- Create the tables for the claw-vibecoding application with user-specific projects

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
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;

-- Create policies to allow read/write access for anon users (for demo purposes)
-- In production, you may want to implement more granular security policies

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