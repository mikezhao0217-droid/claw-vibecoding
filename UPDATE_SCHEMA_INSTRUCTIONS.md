# 数据库模式更新说明

由于我们添加了新的 `deleted` 字段，需要在 Supabase 数据库中执行以下 SQL 语句：

## 需要执行的 SQL 语句

请在 Supabase 仪表板的 SQL 编辑器中运行以下命令：

```sql
-- 为 user_projects 表添加 deleted 字段
ALTER TABLE user_projects ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- 如果之前没有此字段，可能还需要更新 RLS 策略以确保新字段不影响现有策略
-- 但通常不需要额外操作，因为我们现有的策略已经允许所有操作
```

## 执行步骤

1. 访问 Supabase 仪表板的 SQL 编辑器：
   https://supabase.com/dashboard/project/lgxjdlscsuwgxurlxpk/sql

2. 将上述 SQL 语句复制到编辑器中

3. 点击 "RUN" 按钮执行

## 重要提醒

- 对于任何 DDL 操作（CREATE、ALTER、DROP 等），都需要手动在 Supabase 仪表板中执行
- 这是由于 Supabase 的安全设计，不允许客户端 API 执行数据库结构修改操作
- 即使拥有服务角色密钥，也无法通过客户端 API 执行 DDL 语句

执行完成后，软删除功能将完全正常工作。