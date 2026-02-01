-- Fix security policies to allow soft delete operations

-- Update departments table policies to allow updating deleted field
DROP POLICY IF EXISTS "Allow update access for all users" ON departments;
CREATE POLICY "Allow update access for all users" ON departments
  FOR UPDATE TO anon
  USING (true);  -- Allow updates to any department

-- Update teams table policies to allow updating deleted field
DROP POLICY IF EXISTS "Allow update access for all users" ON teams;
CREATE POLICY "Allow update access for all users" ON teams
  FOR UPDATE TO anon
  USING (true);  -- Allow updates to any team

-- Verify the changes
SELECT 'Updated departments policies:' AS info;
SELECT policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'departments';

SELECT 'Updated teams policies:' AS info;
SELECT policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'teams';