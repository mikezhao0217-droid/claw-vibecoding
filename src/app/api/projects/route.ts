import { NextRequest } from 'next/server';
import { ProjectData } from '@/types/project';

// Mock data storage - in a real implementation, this would connect to a database or file system
let mockProjectData: ProjectData = {
  departments: [
    {
      id: "engineering",
      name: "工程部",
      teams: [
        {
          id: "frontend",
          name: "前端组",
          projects: [
            {
              id: "web-redesign",
              name: "官网重构项目",
              members: ["张三", "李四", "王五"],
              milestones: [
                { id: "planning", name: "项目规划", completed: true },
                { id: "design", name: "UI/UX设计", completed: true },
                { id: "development", name: "开发阶段", completed: false },
                { id: "testing", name: "测试阶段", completed: false },
                { id: "deployment", name: "部署上线", completed: false }
              ]
            }
          ]
        },
        {
          id: "backend",
          name: "后端组",
          projects: [
            {
              id: "api-overhaul",
              name: "API重构项目",
              members: ["赵六", "孙七"],
              milestones: [
                { id: "analysis", name: "需求分析", completed: true },
                { id: "architecture", name: "架构设计", completed: false },
                { id: "implementation", name: "实现阶段", completed: false },
                { id: "review", name: "代码审查", completed: false }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "marketing",
      name: "市场部",
      teams: [
        {
          id: "content",
          name: "内容组",
          projects: [
            {
              id: "campaign-q1",
              name: "Q1营销活动",
              members: ["周八", "吴九"],
              milestones: [
                { id: "research", name: "市场调研", completed: true },
                { id: "strategy", name: "策略制定", completed: true },
                { id: "execution", name: "执行阶段", completed: false }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export async function GET(request: NextRequest) {
  return Response.json(mockProjectData);
}

import { NextRequest } from 'next/server';
import { ProjectData } from '@/types/project';

// Mock data storage - in a real implementation, this would connect to a database or file system
let mockProjectData: ProjectData = {
  departments: [
    {
      id: "engineering",
      name: "工程部",
      teams: [
        {
          id: "frontend",
          name: "前端组",
          projects: [
            {
              id: "web-redesign",
              name: "官网重构项目",
              members: ["张三", "李四", "王五"],
              milestones: [
                { id: "planning", name: "项目规划", completed: true },
                { id: "design", name: "UI/UX设计", completed: true },
                { id: "development", name: "开发阶段", completed: false },
                { id: "testing", name: "测试阶段", completed: false },
                { id: "deployment", name: "部署上线", completed: false }
              ]
            }
          ]
        },
        {
          id: "backend",
          name: "后端组",
          projects: [
            {
              id: "api-overhaul",
              name: "API重构项目",
              members: ["赵六", "孙七"],
              milestones: [
                { id: "analysis", name: "需求分析", completed: true },
                { id: "architecture", name: "架构设计", completed: false },
                { id: "implementation", name: "实现阶段", completed: false },
                { id: "review", name: "代码审查", completed: false }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "marketing",
      name: "市场部",
      teams: [
        {
          id: "content",
          name: "内容组",
          projects: [
            {
              id: "campaign-q1",
              name: "Q1营销活动",
              members: ["周八", "吴九"],
              milestones: [
                { id: "research", name: "市场调研", completed: true },
                { id: "strategy", name: "策略制定", completed: true },
                { id: "execution", name: "执行阶段", completed: false }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export async function GET(request: NextRequest) {
  return Response.json(mockProjectData);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real implementation, we would validate and update the actual data
    // For now, we'll just return success
    mockProjectData = body;
    
    return Response.json({ success: true, message: 'Project data updated successfully' });
  } catch (error) {
    return Response.json({ success: false, error: 'Failed to update project data' }, { status: 500 });
  }
}