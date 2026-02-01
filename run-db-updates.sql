-- Run these DDL statements in your Supabase SQL editor:

-- 1. Add deleted column to departments table
ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- 2. Add deleted column to teams table  
ALTER TABLE teams ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- 3. Remove foreign key constraint from teams table (making it independent)
-- First, drop the existing constraint if it exists
DO $$ 
BEGIN
    ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_department_id_fkey;
EXCEPTION
    WHEN undefined_object THEN 
        -- Constraint doesn't exist, ignore
        NULL;
END $$;

-- 4. Drop the department_id column from teams table
ALTER TABLE teams DROP COLUMN IF EXISTS department_id;

-- 5. Update policies to handle soft deletes
-- Departments: exclude deleted records from selection
DROP POLICY IF EXISTS "Allow read access for all users" ON departments;
CREATE POLICY "Allow read access for all users" ON departments
  FOR SELECT TO anon
  USING (deleted IS NOT TRUE);

-- Teams: exclude deleted records from selection
DROP POLICY IF EXISTS "Allow read access for all users" ON teams;
CREATE POLICY "Allow read access for all users" ON teams
  FOR SELECT TO anon
  USING (deleted IS NOT TRUE);

-- Verify the changes worked
SELECT 'Departments table structure:' AS info;
\d departments;

SELECT 'Teams table structure:' AS info;
\d teams;