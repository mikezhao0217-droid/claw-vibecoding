# Web编码竞赛项目进度仪表板

这是一个用于跟踪Web编码竞赛中各部门、团队和项目里程碑进度的仪表板应用。

## 功能特点

- **部门视图**：按部门组织团队和项目
- **团队视图**：显示团队内所有项目的状态
- **项目追踪**：跟踪每个项目的里程碑进度
- **进度可视化**：直观显示完成百分比
- **实时更新**：点击复选框即可标记里程碑完成状态
- **响应式设计**：适配桌面和移动设备
- **数据持久化**：使用Supabase数据库保存数据

## 技术栈

- **Next.js 16.1.6**：React框架，支持App Router
- **TypeScript**：类型安全
- **Tailwind CSS**：实用优先的CSS框架
- **Supabase**：PostgreSQL数据库即服务，用于数据持久化

## 部署链接

线上演示地址：[https://claw-vibecoding.vercel.app/](https://claw-vibecoding.vercel.app/)

分享链接（公网可访问）：[https://claw-vibecoding.vercel.app?_vercel_share=TPgrc5yZ9cFxUf49IPS8h5aOJvJlWSzY](https://claw-vibecoding.vercel.app?_vercel_share=TPgrc5yZ9cFxUf49IPS8h5aOJvJlWSzY)

## 架构说明

- `/src/app` - Next.js App Router页面和布局
- `/src/components` - 可重用UI组件
- `/src/types` - TypeScript类型定义
- `/src/hooks` - 自定义React hooks
- `/src/lib` - 第三方库配置（如Supabase）
- `/src/services` - 业务逻辑服务（数据操作）
- `/src/utils` - 工具函数

## 数据模型

数据存储在Supabase数据库中，包含以下结构：

- 部门 (Departments)
  - 团队 (Teams)
    - 项目 (Projects)
      - 里程碑 (Milestones)

## 配置环境

1. 创建 Supabase 项目并获取 API 密钥
2. 复制 `.env.example` 为 `.env.local`
3. 在 `.env.local` 中填入 Supabase URL 和 publishable key
4. 使用 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY 作为环境变量名

## 部署

该项目可直接部署到以下平台：

- **Vercel**：支持从GitHub仓库直接导入
- **Netlify**：支持Next.js应用
- **GitHub Pages**：配合静态导出

## 开发

1. 安装依赖：`npm install`
2. 启动开发服务器：`npm run dev`
3. 访问 `http://localhost:3000`

## 数据持久化

项目现在使用 Supabase 数据库进行数据持久化：
1. 里程碑状态变更会保存到云端数据库
2. 刷新页面后数据不会丢失
3. 支持多用户协作访问

## 使用场景

这个仪表板特别适用于：

- 公司内部编程竞赛
- 多部门协作项目
- 里程碑驱动的项目管理
- 需要透明进度跟踪的团队