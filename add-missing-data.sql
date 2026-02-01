-- 添加缺失的部门
INSERT INTO departments (id, name) VALUES 
  ('engineering2', '工程二部')
ON CONFLICT (id) DO NOTHING;

-- 添加缺失的团队
INSERT INTO teams (id, name, department_id) VALUES 
  ('frontend1', '前端一组', 'engineering2')
ON CONFLICT (id) DO NOTHING;

-- 验证数据是否已添加
SELECT 'Departments:' as info;
SELECT * FROM departments;

SELECT 'Teams:' as info;
SELECT * FROM teams;