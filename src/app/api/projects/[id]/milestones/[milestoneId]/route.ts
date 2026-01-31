import { NextRequest } from 'next/server';

// Mock data - in a real implementation, this would come from a database
let mockProjectData = {
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

// Helper function to find a project by ID
function findProjectAndMilestone(projectId: string, milestoneId: string) {
  for (const dept of mockProjectData.departments) {
    for (const team of dept.teams) {
      for (const project of team.projects) {
        if (project.id === projectId) {
          const milestone = project.milestones.find(m => m.id === milestoneId);
          if (milestone) {
            return { project, milestone };
          }
        }
      }
    }
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; milestoneId: string } }
) {
  try {
    const { id: projectId, milestoneId } = params;
    const { completed } = await request.json();

    const result = findProjectAndMilestone(projectId, milestoneId);
    
    if (!result) {
      return Response.json(
        { error: 'Project or milestone not found' },
        { status: 404 }
      );
    }

    // Update the milestone completion status
    result.milestone.completed = completed;

    return Response.json({
      success: true,
      message: 'Milestone updated successfully',
      project: result.project
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}