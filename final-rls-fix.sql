-- Final fix for RLS policies to support soft deletes

-- First, let's check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('departments', 'teams')
ORDER BY tablename, policyname;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow update access for all users" ON departments;
DROP POLICY IF EXISTS "Allow update access for all users" ON teams;

-- Create proper policies for departments with soft delete support
-- SELECT: Only show non-deleted records
DROP POLICY IF EXISTS "Allow read access for all users" ON departments;
CREATE POLICY "Allow read access for all users" ON departments
  FOR SELECT TO anon
  USING (deleted IS NOT TRUE);

-- INSERT: Allow inserts
DROP POLICY IF EXISTS "Allow insert access for all users" ON departments;
CREATE POLICY "Allow insert access for all users" ON departments
  FOR INSERT TO anon
  WITH CHECK (true);

-- UPDATE: Allow updates but with relaxed WITH CHECK condition
CREATE POLICY "Allow update access for all users" ON departments
  FOR UPDATE TO anon
  USING (true)        -- Can update any record
  WITH CHECK (true);  -- Allow any update result, including setting deleted=true

-- Create proper policies for teams with soft delete support
-- SELECT: Only show non-deleted records
DROP POLICY IF EXISTS "Allow read access for all users" ON teams;
CREATE POLICY "Allow read access for all users" ON teams
  FOR SELECT TO anon
  USING (deleted IS NOT TRUE);

-- INSERT: Allow inserts
DROP POLICY IF EXISTS "Allow insert access for all users" ON teams;
CREATE POLICY "Allow insert access for all users" ON teams
  FOR INSERT TO anon
  WITH CHECK (true);

-- UPDATE: Allow updates but with relaxed WITH CHECK condition
CREATE POLICY "Allow update access for all users" ON teams
  FOR UPDATE TO anon
  USING (true)        -- Can update any record
  WITH CHECK (true);  -- Allow any update result, including setting deleted=true

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('departments', 'teams')
ORDER BY tablename, policyname;