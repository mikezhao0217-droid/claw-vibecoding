-- Add default_milestones column to page_config table
ALTER TABLE page_config ADD COLUMN IF NOT EXISTS default_milestones JSONB DEFAULT '[]'::JSONB;

-- Update RLS policy to allow access to the new column
-- We need to make sure our policy allows access to the new column
DROP POLICY IF EXISTS "Allow read access for all users" ON page_config;
CREATE POLICY "Allow read access for all users" ON page_config
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow insert access for all users" ON page_config;
CREATE POLICY "Allow insert access for all users" ON page_config
  FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update access for all users" ON page_config;
CREATE POLICY "Allow update access for all users" ON page_config
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'page_config' AND column_name = 'default_milestones';