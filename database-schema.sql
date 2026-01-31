-- Create the projects table for the claw-vibecoding application
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow read/write access for anon users (for demo purposes)
-- In production, you may want to implement more granular security policies
CREATE POLICY "Allow read access for all users" ON projects
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Allow insert access for all users" ON projects
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON projects
  FOR UPDATE TO anon
  USING (true);