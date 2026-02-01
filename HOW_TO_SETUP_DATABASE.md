# 如何设置 Supabase 数据库表

由于 Supabase 的安全设计，即使是服务角色密钥也无法通过客户端 API 执行 DDL（数据定义语言）操作，如 `CREATE TABLE`。因此，需要通过 Supabase 仪表板手动创建表结构。

## 步骤

1. **访问 Supabase 仪表板**
   - 打开浏览器并访问：https://supabase.com/dashboard/project/lgxjdlscsuwgxurlxpk/sql

2. **运行 SQL 脚本**
   - 将 `full-setup-script.sql` 文件中的全部内容复制到 SQL 编辑器中
   - 点击 "RUN" 按钮执行

3. **等待执行完成**
   - 执行完成后，您会看到成功的消息
   - 所有必需的表和默认数据都将被创建

## 创建的表

脚本将创建以下表：

- `page_config`: 页面配置表（新增，用于存储可编辑的页面标题等）
- `departments`: 部门表
- `teams`: 团队表  
- `user_projects`: 用户项目表

## 安全策略

脚本还会为每个表启用行级安全（RLS）并创建适当的安全策略，以确保数据安全。

## 验证

执行完成后，您可以返回到应用页面（https://claw-vibecoding.vercel.app/），新的页面配置管理功能将可以正常工作。

## 注意事项

- 此操作只需要执行一次
- 脚本使用了 `IF NOT EXISTS` 来防止重复创建
- 脚本会同时插入一些默认数据，使应用可以立即使用

完成这些步骤后，您就可以在应用中使用编辑模式来修改页面标题和配置了！