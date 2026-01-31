# Web编码竞赛项目进度仪表板

这是一个用于跟踪Web编码竞赛中各部门、团队和项目里程碑进度的仪表板应用。

## 功能特点

- **部门视图**：按部门组织团队和项目
- **团队视图**：显示团队内所有项目的状态
- **项目追踪**：跟踪每个项目的里程碑进度
- **进度可视化**：直观显示完成百分比
- **实时更新**：点击复选框即可标记里程碑完成状态
- **响应式设计**：适配桌面和移动设备

## 技术栈

- **Next.js 16.1.6**：React框架，支持App Router
- **TypeScript**：类型安全
- **Tailwind CSS**：实用优先的CSS框架
- **JSON Storage**：使用GitHub仓库存储数据

## 架构说明

- `/src/app` - Next.js App Router页面和布局
- `/src/components` - 可重用UI组件
- `/src/types` - TypeScript类型定义
- `/src/hooks` - 自定义React hooks
- `/src/utils` - 工具函数
- `/src/data` - 项目数据存储（JSON格式）

## 数据模型

数据存储在 `/src/data/projects.json` 中，包含以下结构：

- 部门 (Departments)
  - 团队 (Teams)
    - 项目 (Projects)
      - 里程碑 (Milestones)

## 部署

该项目可直接部署到以下平台：

- **Vercel**：支持从GitHub仓库直接导入
- **Netlify**：支持Next.js应用
- **GitHub Pages**：配合静态导出

## 开发

1. 安装依赖：`npm install`
2. 启动开发服务器：`npm run dev`
3. 访问 `http://localhost:3000`

## 数据更新

在当前实现中，我们使用模拟数据。在生产环境中，可以：

1. 通过GitHub API更新JSON文件
2. 集成简单的后端API
3. 使用第三方服务如Airtable或Google Sheets

## 使用场景

这个仪表板特别适用于：

- 公司内部编程竞赛
- 多部门协作项目
- 里程碑驱动的项目管理
- 需要透明进度跟踪的团队