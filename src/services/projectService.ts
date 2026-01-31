import { supabase } from '@/lib/supabaseClient';
import { ProjectData } from '@/types/project';

// Define table name
const PROJECTS_TABLE = 'projects';

// Initialize Supabase with default data if needed
export const initializeDatabase = async () => {
  if (!supabase) {
    console.warn('Supabase not configured, using fallback data');
    return;
  }

  // Check if we already have data
  const { data, error } = await supabase.from(PROJECTS_TABLE).select('*').limit(1);
  
  if (error) {
    console.error('Error checking initial data:', error);
    return;
  }

  // If no data exists, insert default data
  if (!data || data.length === 0) {
    const defaultData: ProjectData = {
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

    const { error: insertError } = await supabase
      .from(PROJECTS_TABLE)
      .insert([{ id: 'main', data: defaultData, updated_at: new Date().toISOString() }]);

    if (insertError) {
      console.error('Error inserting default data:', insertError);
    } else {
      console.log('Default data inserted successfully');
    }
  }
};

// Fetch project data from Supabase
export const fetchProjectData = async (): Promise<ProjectData | null> => {
  if (!supabase) {
    // Fallback to default data if Supabase is not configured
    return {
      departments: []
    };
  }

  try {
    const { data, error } = await supabase
      .from(PROJECTS_TABLE)
      .select('data')
      .eq('id', 'main')
      .single();

    if (error) {
      console.error('Error fetching project data:', error);
      return null;
    }

    return data?.data as ProjectData || null;
  } catch (error) {
    console.error('Unexpected error fetching project data:', error);
    return null;
  }
};

// Update project data in Supabase
export const updateProjectData = async (updatedData: ProjectData): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping data update');
    return false;
  }

  try {
    const { error } = await supabase
      .from(PROJECTS_TABLE)
      .update({ 
        data: updatedData, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', 'main');

    if (error) {
      console.error('Error updating project data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating project data:', error);
    return false;
  }
};

// Toggle milestone completion status
export const toggleMilestoneCompletion = async (
  projectId: string, 
  milestoneId: string
): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping milestone update');
    return false;
  }

  try {
    // Fetch current data
    const currentData = await fetchProjectData();
    if (!currentData) {
      console.error('Could not fetch current project data');
      return false;
    }

    // Find and update the milestone
    let found = false;
    const updatedData = { ...currentData };
    
    for (const dept of updatedData.departments) {
      for (const team of dept.teams) {
        for (const project of team.projects) {
          if (project.id === projectId) {
            const milestone = project.milestones.find(m => m.id === milestoneId);
            if (milestone) {
              milestone.completed = !milestone.completed;
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (found) break;
      }
      if (found) break;
    }

    if (!found) {
      console.error(`Milestone ${milestoneId} not found in project ${projectId}`);
      return false;
    }

    // Save updated data
    return await updateProjectData(updatedData);
  } catch (error) {
    console.error('Error toggling milestone completion:', error);
    return false;
  }
};