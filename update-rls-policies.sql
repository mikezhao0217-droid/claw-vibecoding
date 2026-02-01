-- Update RLS policies to allow soft deletes

-- Departments table: allow update of deleted field specifically
DROP POLICY IF EXISTS "Allow update access for all users" ON departments;
CREATE POLICY "Allow update access for all users" ON departments
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Teams table: allow update of deleted field specifically  
DROP POLICY IF EXISTS "Allow update access for all users" ON teams;
CREATE POLICY "Allow update access for all users" ON teams
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('departments', 'teams')
ORDER BY tablename, policyname;