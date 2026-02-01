import { supabase } from '@/lib/supabaseClient';
import { ProjectData, UserProject } from '@/types/project';

// Define table names
const PROJECTS_TABLE = 'projects';
const USER_PROJECTS_TABLE = 'user_projects';
const DEPARTMENTS_TABLE = 'departments';
const TEAMS_TABLE = 'teams';
const PAGE_CONFIG_TABLE = 'page_config';

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
        { id: "engineering", name: "工程部", deleted: false },
        { id: "marketing", name: "市场部", deleted: false },
        { id: "sales", name: "销售部", deleted: false },
        { id: "hr", name: "人事部", deleted: false }
      ];
      
      await supabase.from(DEPARTMENTS_TABLE).insert(departments);
      
      // Insert default teams
      const teams = [
        { id: "frontend", name: "前端组", deleted: false },
        { id: "backend", name: "后端组", deleted: false },
        { id: "mobile", name: "移动端组", deleted: false },
        { id: "content", name: "内容组", deleted: false },
        { id: "creative", name: "创意组", deleted: false }
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

    // Normalize team data to match our type structure (no department_id anymore)
    const normalizedTeams = teams.map(team => ({
      id: team.id,
      name: team.name
    }));

    // Fetch user projects (excluding those marked as deleted)
    const { data: userProjects, error: projectError } = await supabase
      .from(USER_PROJECTS_TABLE)
      .select('*')
      .is('deleted', false); // Only fetch non-deleted projects

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
      userId: project.user_id,
      deleted: project.deleted
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

// Update project data in Supabase - more efficient approach
export const updateProjectData = async (updatedData: ProjectData): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping data update');
    return false;
  }

  try {
    // Update departments - for now keep the simple approach as departments don't change often
    if (updatedData.departments && updatedData.departments.length > 0) {
      // Clear existing departments and insert new ones
      await supabase.from(DEPARTMENTS_TABLE).delete().gt('id', '');
      await supabase.from(DEPARTMENTS_TABLE).insert(
        updatedData.departments.map(dept => ({
          id: dept.id,
          name: dept.name,
          deleted: dept.deleted || false
        }))
      );
    }

    // Update teams - for now keep the simple approach as teams don't change often
    if (updatedData.teams && updatedData.teams.length > 0) {
      // Clear existing teams and insert new ones
      await supabase.from(TEAMS_TABLE).delete().gt('id', '');
      await supabase.from(TEAMS_TABLE).insert(
        updatedData.teams.map(team => ({
          id: team.id,
          name: team.name,
          deleted: team.deleted || false
        }))
      );
    }

    // For user projects, we need a more sophisticated approach to handle additions, updates, and deletions
    if (updatedData.userProjects && updatedData.userProjects.length > 0) {
      // Fetch current projects to compare
      const { data: currentProjects, error: fetchError } = await supabase
        .from(USER_PROJECTS_TABLE)
        .select('id');
      
      if (fetchError) {
        console.error('Error fetching current projects:', fetchError);
        // Fallback to simple approach
        await supabase.from(USER_PROJECTS_TABLE).delete().gt('id', '');
        await supabase.from(USER_PROJECTS_TABLE).insert(
          updatedData.userProjects.map(project => ({
            id: project.id,
            name: project.name,
            owner: project.owner,
            department: project.department,
            team: project.team,
            milestones: project.milestones,
            user_id: project.userId,
            updated_at: new Date().toISOString()
          }))
        );
        return true;
      }

      // Get current project IDs
      const currentProjectIds = currentProjects?.map(p => p.id) || [];
      const updatedProjectIds = updatedData.userProjects.map(p => p.id);

      // Find projects to delete (exist in DB but not in updated data)
      const projectsToDelete = currentProjectIds.filter(id => !updatedProjectIds.includes(id));

      // Find projects to insert/update (exist in updated data)
      const projectsToUpsert = updatedData.userProjects.map(project => ({
        id: project.id,
        name: project.name,
        owner: project.owner,
        department: project.department,
        team: project.team,
        milestones: project.milestones,
        user_id: project.userId,
        updated_at: new Date().toISOString()
      }));

      // Delete removed projects
      if (projectsToDelete.length > 0) {
        await supabase
          .from(USER_PROJECTS_TABLE)
          .delete()
          .in('id', projectsToDelete);
      }

      // Upsert updated projects (this handles both inserts and updates)
      if (projectsToUpsert.length > 0) {
        await supabase
          .from(USER_PROJECTS_TABLE)
          .upsert(projectsToUpsert, { onConflict: 'id' }); // Use upsert to handle both insert and update
      }
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating project data:', error);
    return false;
  }
};

// Add a new project to the database
export const addProject = async (project: UserProject): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping project addition');
    return false;
  }

  try {
    // Validate department and team exist, or use defaults
    if (project.department) {
      const { data: deptData, error: deptError } = await supabase
        .from(DEPARTMENTS_TABLE)
        .select('id')
        .eq('id', project.department)
        .eq('deleted', false) // Only consider non-deleted departments
        .single();

      if (deptError || !deptData) {
        console.warn(`Department with ID ${project.department} does not exist or is deleted, using default`);
        project.department = 'engineering'; // Default to engineering
      }
    } else {
      project.department = 'engineering'; // Default if not provided
    }

    if (project.team) {
      const { data: teamData, error: teamError } = await supabase
        .from(TEAMS_TABLE)
        .select('id')
        .eq('id', project.team)
        .eq('deleted', false) // Only consider non-deleted teams
        .single();

      if (teamError || !teamData) {
        console.warn(`Team with ID ${project.team} does not exist or is deleted, using default`);
        project.team = 'frontend'; // Default to frontend
      }
    } else {
      project.team = 'frontend'; // Default if not provided
    }

    const { error } = await supabase
      .from(USER_PROJECTS_TABLE)
      .insert([{
        id: project.id,
        name: project.name,
        owner: project.owner,
        department: project.department,
        team: project.team,
        milestones: project.milestones,
        user_id: project.userId,
        deleted: false, // Ensure new projects are not marked as deleted
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error adding project:', error);
      return false;
    }

    console.log(`Successfully added project: ${project.name} (${project.id})`);
    return true;
  } catch (error) {
    console.error('Unexpected error adding project:', error);
    return false;
  }
};

// Update a specific project in the database
export const updateProject = async (project: UserProject): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping project update');
    return false;
  }

  try {
    // First verify that the referenced department and team exist and are not deleted
    if (project.department) {
      const { data: deptData, error: deptError } = await supabase
        .from(DEPARTMENTS_TABLE)
        .select('id')
        .eq('id', project.department)
        .eq('deleted', false) // Only consider non-deleted departments
        .single();

      if (deptError || !deptData) {
        console.error(`Department with ID ${project.department} does not exist or is deleted:`, deptError);
        // Use a default department if the specified one doesn't exist
        project.department = 'engineering'; // Default to engineering
      }
    }

    if (project.team) {
      const { data: teamData, error: teamError } = await supabase
        .from(TEAMS_TABLE)
        .select('id')
        .eq('id', project.team)
        .eq('deleted', false) // Only consider non-deleted teams
        .single();

      if (teamError || !teamData) {
        console.error(`Team with ID ${project.team} does not exist or is deleted:`, teamError);
        // Use a default team if the specified one doesn't exist
        project.team = 'frontend'; // Default to frontend
      }
    }

    const { error } = await supabase
      .from(USER_PROJECTS_TABLE)
      .update({
        name: project.name,
        owner: project.owner,
        department: project.department,
        team: project.team,
        milestones: project.milestones,
        user_id: project.userId,
        deleted: project.deleted || false, // Preserve the deleted status, default to false
        updated_at: new Date().toISOString()
      })
      .eq('id', project.id);

    if (error) {
      console.error('Error updating project:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating project:', error);
    return false;
  }
};

// Delete a project from the database (soft delete using deleted flag)
export const deleteProject = async (projectId: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping project deletion');
    return false;
  }

  try {
    // Instead of physically deleting the record, set the deleted flag to true
    const { error } = await supabase
      .from(USER_PROJECTS_TABLE)
      .update({ deleted: true })
      .eq('id', projectId);

    if (error) {
      console.error('Error marking project as deleted:', error);
      return false;
    }

    console.log(`Successfully marked project as deleted: ${projectId}`);
    return true;
  } catch (error) {
    console.error('Unexpected error marking project as deleted:', error);
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
      .select('*') // Select all fields, not just milestones
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error || !projectData) {
      console.error('Error fetching project or project not found:', error);
      console.log(`Looking for project ID: ${projectId} and user ID: ${userId}`);
      return false;
    }

    // Update the milestone status
    const updatedMilestones = projectData.milestones.map((milestone: any) => 
      milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone
    );

    // Update the project in the database
    const { error: updateError } = await supabase
      .from(USER_PROJECTS_TABLE)
      .update({ 
        milestones: updatedMilestones,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating milestone:', updateError);
      return false;
    }

    console.log(`Successfully toggled milestone ${milestoneId} for project ${projectId} and user ${userId}`);
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
      .select('*')
      .is('deleted', false); // Only include non-deleted projects

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

// Add a new department to the database
export const addDepartment = async (department: { id: string; name: string }): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping department addition');
    return false;
  }

  try {
    const { error } = await supabase
      .from(DEPARTMENTS_TABLE)
      .insert([{
        id: department.id,
        name: department.name,
        deleted: false
      }]);

    if (error) {
      console.error('Error adding department:', error);
      return false;
    }

    console.log(`Successfully added department: ${department.name} (${department.id})`);
    return true;
  } catch (error) {
    console.error('Unexpected error adding department:', error);
    return false;
  }
};

// Update a specific department in the database
export const updateDepartment = async (id: string, name: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping department update');
    return false;
  }

  try {
    const { error } = await supabase
      .from(DEPARTMENTS_TABLE)
      .update({ name })
      .eq('id', id);

    if (error) {
      console.error('Error updating department:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating department:', error);
    return false;
  }
};

// Delete a department from the database (soft delete using deleted flag)
export const deleteDepartment = async (id: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping department deletion');
    return false;
  }

  try {
    // Instead of physically deleting the record, set the deleted flag to true
    const { error } = await supabase
      .from(DEPARTMENTS_TABLE)
      .update({ deleted: true })
      .eq('id', id)
      .select(); // Adding select() might help with RLS policy verification

    if (error) {
      console.error('Error marking department as deleted:', error);
      console.error('Error details:', error.details, error.hint, error.message);
      return false;
    }

    console.log(`Successfully marked department as deleted: ${id}`);
    return true;
  } catch (error: any) {
    console.error('Unexpected error marking department as deleted:', error);
    console.error('Error details:', error.details, error.hint, error.message);
    return false;
  }
};

// Add a new team to the database
export const addTeam = async (team: { id: string; name: string }): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping team addition');
    return false;
  }

  try {
    const { error } = await supabase
      .from(TEAMS_TABLE)
      .insert([{
        id: team.id,
        name: team.name,
        deleted: false
      }]);

    if (error) {
      console.error('Error adding team:', error);
      return false;
    }

    console.log(`Successfully added team: ${team.name} (${team.id})`);
    return true;
  } catch (error) {
    console.error('Unexpected error adding team:', error);
    return false;
  }
};

// Update a specific team in the database
export const updateTeam = async (id: string, name: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping team update');
    return false;
  }

  try {
    const { error } = await supabase
      .from(TEAMS_TABLE)
      .update({ name })
      .eq('id', id);

    if (error) {
      console.error('Error updating team:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating team:', error);
    return false;
  }
};

// Delete a team from the database (soft delete using deleted flag)
export const deleteTeam = async (id: string): Promise<boolean> => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping team deletion');
    return false;
  }

  try {
    // Instead of physically deleting the record, set the deleted flag to true
    const { error } = await supabase
      .from(TEAMS_TABLE)
      .update({ deleted: true })
      .eq('id', id)
      .select(); // Adding select() might help with RLS policy verification

    if (error) {
      console.error('Error marking team as deleted:', error);
      console.error('Error details:', error.details, error.hint, error.message);
      return false;
    }

    console.log(`Successfully marked team as deleted: ${id}`);
    return true;
  } catch (error: any) {
    console.error('Unexpected error marking team as deleted:', error);
    console.error('Error details:', error.details, error.hint, error.message);
    return false;
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
      .select('*')
      .is('deleted', false); // Only include non-deleted projects

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

// Fetch page configuration from Supabase
export const fetchPageConfig = async () => {
  if (!supabase) {
    // Fallback to default config if Supabase is not configured
    return {
      id: 'main',
      projectName: 'Web编码竞赛项目',
      companyProgressTitle: '公司整体进度',
      departmentProgressTitle: '部门进度排行榜',
      teamProgressTitle: '小组进度排行榜',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  try {
    const { data, error } = await supabase
      .from(PAGE_CONFIG_TABLE)
      .select('*')
      .single(); // We expect only one config record with id='main'

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('Not Found')) {
        // Config doesn't exist, initialize with default values
        console.log('No page config found, initializing with default values...');
        
        const defaultConfig = {
          id: 'main',
          project_name: 'Web编码竞赛项目',
          company_progress_title: '公司整体进度',
          department_progress_title: '部门进度排行榜',
          team_progress_title: '小组进度排行榜',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const insertResult = await supabase
          .from(PAGE_CONFIG_TABLE)
          .insert([defaultConfig]);

        if (insertResult.error) {
          console.error('Error inserting default config:', insertResult.error);
          return null;
        }

        console.log('Default config inserted successfully');
        return {
          id: 'main',
          projectName: defaultConfig.project_name,
          companyProgressTitle: defaultConfig.company_progress_title,
          departmentProgressTitle: defaultConfig.department_progress_title,
          teamProgressTitle: defaultConfig.team_progress_title,
          createdAt: defaultConfig.created_at,
          updatedAt: defaultConfig.updated_at
        };
      } else {
        console.error('Error fetching page config:', error);
        return null;
      }
    }

    // Map the database field names to our interface field names
    return {
      id: data.id,
      projectName: data.project_name,
      companyProgressTitle: data.company_progress_title,
      departmentProgressTitle: data.department_progress_title,
      teamProgressTitle: data.team_progress_title,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Unexpected error fetching page config:', error);
    return null;
  }
};

// Update page configuration in Supabase
export const updatePageConfig = async (config: any) => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping config update');
    return false;
  }

  try {
    const { error } = await supabase
      .from(PAGE_CONFIG_TABLE)
      .update({
        project_name: config.projectName,
        company_progress_title: config.companyProgressTitle,
        department_progress_title: config.departmentProgressTitle,
        team_progress_title: config.teamProgressTitle,
        updated_at: new Date().toISOString()
      })
      .eq('id', config.id || 'main');

    if (error) {
      console.error('Error updating page config:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating page config:', error);
    return false;
  }
};