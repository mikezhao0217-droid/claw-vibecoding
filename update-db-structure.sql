-- Update database structure: make teams and departments independent tables with deleted fields

-- Add deleted column to departments table
ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Add deleted column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Remove foreign key constraint from teams table (making it independent)
-- First, drop the existing constraint if it exists
DO $$ 
BEGIN
    ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_department_id_fkey;
EXCEPTION
    WHEN undefined_object THEN 
        -- Constraint doesn't exist, ignore
        NULL;
END $$;

-- Drop the department_id column from teams table
ALTER TABLE teams DROP COLUMN IF EXISTS department_id;

-- Update policies to handle soft deletes
-- Departments: exclude deleted records from selection
DROP POLICY IF EXISTS "Allow read access for all users" ON departments;
CREATE POLICY "Allow read access for all users" ON departments
  FOR SELECT TO anon
  USING (deleted IS NOT TRUE);

CREATE POLICY "Allow insert access for all users" ON departments
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON departments
  FOR UPDATE TO anon
  USING (true);

-- Teams: exclude deleted records from selection
DROP POLICY IF EXISTS "Allow read access for all users" ON teams;
CREATE POLICY "Allow read access for all users" ON teams
  FOR SELECT TO anon
  USING (deleted IS NOT TRUE);

CREATE POLICY "Allow insert access for all users" ON teams
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow update access for all users" ON teams
  FOR UPDATE TO anon
  USING (true);

-- Update user_projects table to reflect the change in foreign key constraints
-- We'll temporarily remove and re-add the constraints to reference the new structure
-- First, disable foreign key constraints temporarily (we'll handle this carefully)

-- Verify the changes
SELECT 'Departments table structure:' AS info;
\d departments;

SELECT 'Teams table structure:' AS info;
\d teams;