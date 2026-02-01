import { supabase } from '@/lib/supabaseClient';
import { ProjectData, UserProject } from '@/types/project';

// Define table names
const PROJECTS_TABLE = 'projects';
const USER_PROJECTS_TABLE = 'user_projects';
const DEPARTMENTS_TABLE = 'departments';
const TEAMS_TABLE = 'teams';

// Initialize Supabase with default data if needed
export const initializeDatabase = async () => {
  if (!supabase) {
    console.warn('Supabase not configured, using fallback data');
    return;
  }

  try {
    // Check if we already have data
    const { data, error } = await supabase.from(DEPARTMENTS_TABLE).select('*').limit(1);
    
    if (error) {
      console.error('Error checking initial data:', error);
      return;
    }

    // If no data exists, insert default data
    if (!data || data.length === 0) {
      // Insert default departments
      const departments = [
        { id: "engineering", name: "工程部" },
        { id: "marketing", name: "市场部" },
        { id: "sales", name: "销售部" },
        { id: "hr", name: "人事部" }
      ];
      
      await supabase.from(DEPARTMENTS_TABLE).insert(departments);
      
      // Insert default teams
      const teams = [
        { id: "frontend", name: "前端组", department_id: "engineering" },
        { id: "backend", name: "后端组", department_id: "engineering" },
        { id: "mobile", name: "移动端组", department_id: "engineering" },
        { id: "content", name: "内容组", department_id: "marketing" },
        { id: "creative", name: "创意组", department_id: "marketing" }
      ];
      
      await supabase.from(TEAMS_TABLE).insert(teams);
      
      // Insert default user projects
      const userProjects = [
        {
          id: "project-1",
          name: "官网重构项目",
          owner: "张三",
          department: "engineering",
          team: "frontend",
          milestones: [
            { id: "planning", name: "项目规划", completed: true },
            { id: "design", name: "UI/UX设计", completed: true },
            { id: "development", name: "开发阶段", completed: false },
            { id: "testing", name: "测试阶段", completed: false },
            { id: "deployment", name: "部署上线", completed: false }
          ],
          user_id: "user-1"
        },
        {
          id: "project-2",
          name: "API重构项目",
          owner: "李四",
          department: "engineering",
          team: "backend",
          milestones: [
            { id: "analysis", name: "需求分析", completed: true },
            { id: "architecture", name: "架构设计", completed: true },
            { id: "implementation", name: "实现阶段", completed: false },
            { id: "review", name: "代码审查", completed: false }
          ],
          user_id: "user-2"
        },
        {
          id: "project-3",
          name: "移动端适配",
          owner: "王五",
          department: "engineering",
          team: "mobile",
          milestones: [
            { id: "research", name: "技术调研", completed: true },
            { id: "prototyping", name: "原型设计", completed: false },
            { id: "development", name: "开发阶段", completed: false },
            { id: "testing", name: "测试阶段", completed: false }
          ],
          user_id: "user-3"
        },
        {
          id: "project-4",
          name: "Q1营销活动",
          owner: "赵六",
          department: "marketing",
          team: "content",
          milestones: [
            { id: "research", name: "市场调研", completed: true },
            { id: "strategy", name: "策略制定", completed: true },
            { id: "execution", name: "执行阶段", completed: false },
            { id: "evaluation", name: "效果评估", completed: false }
          ],
          user_id: "user-4"
        },
        {
          id: "project-5",
          name: "品牌视觉升级",
          owner: "孙七",
          department: "marketing",
          team: "creative",
          milestones: [
            { id: "concept", name: "概念设计", completed: true },
            { id: "feedback", name: "反馈收集", completed: false },
            { id: "revision", name: "修改完善", completed: false },
            { id: "approval", name: "最终审批", completed: false }
          ],
          user_id: "user-5"
        }
      ];
      
      await supabase.from(USER_PROJECTS_TABLE).insert(userProjects);
      
      console.log('Default data inserted successfully');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Fetch project data from Supabase
export const fetchProjectData = async (): Promise<ProjectData | null> => {
  if (!supabase) {
    // Fallback to default data if Supabase is not configured
    return {
      departments: [],
      teams: [],
      userProjects: []
    };
  }

  try {
    // Fetch departments
    const { data: departments, error: deptError } = await supabase
      .from(DEPARTMENTS_TABLE)
      .select('*');

    if (deptError) {
      console.error('Error fetching departments:', deptError);
      return null;
    }

    // Fetch teams
    const { data: teams, error: teamError } = await supabase
      .from(TEAMS_TABLE)
      .select('*');

    if (teamError) {
      console.error('Error fetching teams:', teamError);
      return null;
    }

    // Normalize team data to match our type structure
    const normalizedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      departmentId: team.department_id
    }));

    // Fetch user projects
    const { data: userProjects, error: projectError } = await supabase
      .from(USER_PROJECTS_TABLE)
      .select('*');

    if (projectError) {
      console.error('Error fetching user projects:', projectError);
      return null;
    }

    // Normalize user projects data
    const normalizedUserProjects = userProjects.map(project => ({
      id: project.id,
      name: project.name,
      owner: project.owner,
      department: project.department,
      team: project.team,
      milestones: project.milestones,
      userId: project.user_id
    }));

    return {
      departments: departments || [],
      teams: normalizedTeams,
      userProjects: normalizedUserProjects
    };
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
    // Update departments
    if (updatedData.departments && updatedData.departments.length > 0) {
      // Clear existing departments and insert new ones
      await supabase.from(DEPARTMENTS_TABLE).delete().gt('id', '');
      await supabase.from(DEPARTMENTS_TABLE).insert(
        updatedData.departments.map(dept => ({
          id: dept.id,
          name: dept.name
        }))
      );
    }

    // Update teams
    if (updatedData.teams && updatedData.teams.length > 0) {
      // Clear existing teams and insert new ones
      await supabase.from(TEAMS_TABLE).delete().gt('id', '');
      await supabase.from(TEAMS_TABLE).insert(
        updatedData.teams.map(team => ({
          id: team.id,
          name: team.name,
          department_id: team.departmentId
        }))
      );
    }

    // Update user projects
    if (updatedData.userProjects && updatedData.userProjects.length > 0) {
      // Clear existing user projects and insert new ones
      await supabase.from(USER_PROJECTS_TABLE).delete().gt('id', '');
      await supabase.from(USER_PROJECTS_TABLE).insert(
        updatedData.userProjects.map(project => ({
          id: project.id,
          name: project.name,
          owner: project.owner,
          department: project.department,
          team: project.team,
          milestones: project.milestones,
          user_id: project.userId
        }))
      );
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating project data:', error);
    return false;
  }
};

// Toggle milestone completion status for a specific user's project
export const toggleMilestoneCompletion = async (
  projectId: string, 
  milestoneId: string,
  userId: string
): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping milestone update');
    return false;
  }

  try {
    // Fetch the specific user's project
    const { data: projectData, error } = await supabase
      .from(USER_PROJECTS_TABLE)
      .select('milestones')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error || !projectData) {
      console.error('Error fetching project or project not found:', error);
      return false;
    }

    // Update the milestone status
    const updatedMilestones = projectData.milestones.map((milestone: any) => 
      milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone
    );

    // Update the project in the database
    const { error: updateError } = await supabase
      .from(USER_PROJECTS_TABLE)
      .update({ milestones: updatedMilestones })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating milestone:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error toggling milestone completion:', error);
    return false;
  }
};

// Calculate progress statistics by department
export const getDepartmentProgress = async (): Promise<any[]> => {
  if (!supabase) {
    return [];
  }

  try {
    const { data: userProjects, error } = await supabase
      .from(USER_PROJECTS_TABLE)
      .select('*');

    if (error) {
      console.error('Error fetching user projects for department progress:', error);
      return [];
    }

    // Group projects by department and calculate progress
    const deptMap: { [key: string]: { total: number, completed: number } } = {};

    userProjects?.forEach((project: any) => {
      const deptId = project.department;
      if (!deptMap[deptId]) {
        deptMap[deptId] = { total: 0, completed: 0 };
      }

      project.milestones.forEach((milestone: any) => {
        deptMap[deptId].total++;
        if (milestone.completed) {
          deptMap[deptId].completed++;
        }
      });
    });

    // Format the results
    const results = Object.entries(deptMap).map(([deptId, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      return {
        id: deptId,
        name: deptId, // Will be replaced with actual department name
        totalMilestones: stats.total,
        completedMilestones: stats.completed,
        progressPercentage: percentage
      };
    });

    // Fetch department names to replace IDs
    const { data: departments, error: deptError } = await supabase
      .from(DEPARTMENTS_TABLE)
      .select('id, name');

    if (!deptError && departments) {
      results.forEach(result => {
        const dept = departments.find((d: any) => d.id === result.id);
        if (dept) {
          result.name = dept.name;
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Error calculating department progress:', error);
    return [];
  }
};

// Calculate progress statistics by team
export const getTeamProgress = async (): Promise<any[]> => {
  if (!supabase) {
    return [];
  }

  try {
    const { data: userProjects, error } = await supabase
      .from(USER_PROJECTS_TABLE)
      .select('*');

    if (error) {
      console.error('Error fetching user projects for team progress:', error);
      return [];
    }

    // Group projects by team and calculate progress
    const teamMap: { [key: string]: { total: number, completed: number } } = {};

    userProjects?.forEach((project: any) => {
      const teamId = project.team;
      if (!teamMap[teamId]) {
        teamMap[teamId] = { total: 0, completed: 0 };
      }

      project.milestones.forEach((milestone: any) => {
        teamMap[teamId].total++;
        if (milestone.completed) {
          teamMap[teamId].completed++;
        }
      });
    });

    // Format the results
    const results = Object.entries(teamMap).map(([teamId, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      return {
        id: teamId,
        name: teamId, // Will be replaced with actual team name
        totalMilestones: stats.total,
        completedMilestones: stats.completed,
        progressPercentage: percentage
      };
    });

    // Fetch team names to replace IDs
    const { data: teams, error: teamError } = await supabase
      .from(TEAMS_TABLE)
      .select('id, name');

    if (!teamError && teams) {
      results.forEach(result => {
        const team = teams.find((t: any) => t.id === result.id);
        if (team) {
          result.name = team.name;
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Error calculating team progress:', error);
    return [];
  }
};