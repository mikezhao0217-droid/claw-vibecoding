'use client';

import React, { useState, useEffect } from 'react';
import UserProjectCard from '@/components/UserProjectCard';
import GroupProgressCard from '@/components/GroupProgressCard';
import DepartmentTeamManager from '@/components/DepartmentTeamManager';
import DefaultMilestonesEditor from '@/components/DefaultMilestonesEditor';
import { useProjectData } from '@/hooks/useProjectData';
import { initializeDatabase } from '@/services/projectService';

export default function Home() {
  const { data, config, loading, toggleMilestoneCompletion, addProject, updateSingleProject, deleteProject, updatePageConfig, updateDepartments, updateTeams } = useProjectData();
  const [currentUser] = useState("current-user"); // All users see all projects
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [editingConfig, setEditingConfig] = useState<any>(null);
  
  // Initialize database on component mount
  useEffect(() => {
    const initDb = async () => {
      await initializeDatabase();
    };
    
    initDb();
  }, []);

  const handlePasswordSubmit = () => {
    if (passwordInput === 'pimsvibe') {
      setIsEditing(true);
      setShowPasswordModal(false);
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('密码错误，请重试');
    }
  };

  // Configuration editing handlers
  const startConfigEditing = () => {
    if (config) {
      setEditingConfig({ ...config });
    }
  };

  const saveConfigChanges = () => {
    if (editingConfig) {
      updatePageConfig(editingConfig);
      setEditingConfig(null);
    }
  };

  const cancelConfigEditing = () => {
    setEditingConfig(null);
  };

  const updateConfigField = (field: string, value: string) => {
    if (editingConfig) {
      setEditingConfig({
        ...editingConfig,
        [field]: value
      });
    }
  };

  const handleAddProject = () => {
    if (!data) return;
    
    // Create a new project with default values
    // Only use department and team IDs that exist in the database
    const validDepartments = data.departments.map(d => d.id);
    const validTeams = data.teams.map(t => t.id);
    
    const defaultDepartment = validDepartments.length > 0 ? validDepartments[0] : 'engineering';
    const defaultTeam = validTeams.length > 0 ? validTeams[0] : 'frontend';
    
    const newProject = {
      id: `project-${Date.now()}`, // Generate a unique ID
      name: '新项目',
      owner: '新负责人',
      department: defaultDepartment,
      team: defaultTeam,
      milestones: [], // Start with empty milestones
      userId: currentUser
    };
    
    addProject(newProject);
  };

  const handleProjectUpdate = (updatedProject: any) => {
    updateSingleProject(updatedProject);
  };

  const handleProjectDelete = (projectId: string) => {
    deleteProject(projectId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {(config && config.projectName) || 'Web编码竞赛项目进度仪表板'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">正在加载项目数据...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {(config && config.projectName) || 'Web编码竞赛项目进度仪表板'}
            </h1>
            <p className="text-lg text-red-600 dark:text-red-400">无法加载项目数据</p>
          </div>
        </div>
      </div>
    );
  }

  // Show all non-deleted projects
  // In edit mode: keep projects in fixed order to prevent movement during interaction
  // In view mode: sort projects by completion rate
  let userProjects;
  if (isEditing) {
    // In edit mode, keep projects in a fixed order to prevent movement
    userProjects = data?.userProjects
      .filter(project => !project.deleted)
      .sort((a, b) => a.id.localeCompare(b.id)) || []; // Fixed alphabetical order by ID
  } else {
    // In view mode, sort by completion rate (descending)
    userProjects = data?.userProjects
      .filter(project => !project.deleted)
      .map(project => {
        const completedCount = project.milestones.filter(m => m.completed).length;
        const totalCount = project.milestones.length;
        const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        return { ...project, progressPercentage };
      })
      .sort((a, b) => b.progressPercentage - a.progressPercentage) || []; // Sort by progress (descending)
  }

  // Calculate overall company progress based only on default milestones
  const defaultMilestones = data?.config?.defaultMilestones || [];
  let totalMilestones = 0;
  let completedMilestones = 0;
  
  if (defaultMilestones.length > 0) {
    // Count only milestones that match the default milestones
    data.userProjects.forEach(project => {
      defaultMilestones.forEach(dm => {
        const projectMilestone = project.milestones.find(pm => pm.name === dm.name);
        if (projectMilestone) {
          totalMilestones++;
          if (projectMilestone.completed) {
            completedMilestones++;
          }
        } else {
          // If the default milestone doesn't exist in the project, count it as incomplete
          totalMilestones++;
        }
      });
    });
  } else {
    // Fallback to original logic if no default milestones
    const allMilestones = data.userProjects.flatMap(project => project.milestones);
    totalMilestones = allMilestones.length;
    completedMilestones = allMilestones.filter(m => m.completed).length;
  }
  
  const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Calculate department progress - only for non-deleted departments
  const departmentProgress = data.departments
    .filter(dept => !dept.deleted) // Filter out deleted departments
    .map(dept => {
      const deptProjects = data.userProjects.filter(p => p.department === dept.id);
      const defaultMilestones = data?.config?.defaultMilestones || [];
      
      let totalDeptMilestones = 0;
      let completedDeptMilestones = 0;
      
      if (defaultMilestones.length > 0) {
        // Count only default milestones for this department
        deptProjects.forEach(project => {
          defaultMilestones.forEach(dm => {
            const projectMilestone = project.milestones.find(pm => pm.name === dm.name);
            if (projectMilestone) {
              totalDeptMilestones++;
              if (projectMilestone.completed) {
                completedDeptMilestones++;
              }
            } else {
              // If the default milestone doesn't exist in the project, count it as incomplete
              totalDeptMilestones++;
            }
          });
        });
      } else {
        // Fallback to original logic if no default milestones
        const deptMilestones = deptProjects.flatMap(p => p.milestones);
        totalDeptMilestones = deptMilestones.length;
        completedDeptMilestones = deptMilestones.filter(m => m.completed).length;
      }
      
      const deptProgress = totalDeptMilestones > 0 ? Math.round((completedDeptMilestones / totalDeptMilestones) * 100) : 0;
      
      // Get unique members in this department
      const members = [...new Set(deptProjects.map(p => p.owner))];

      return {
        id: dept.id,
        name: dept.name,
        totalMilestones: totalDeptMilestones,
        completedMilestones: completedDeptMilestones,
        progressPercentage: deptProgress,
        members: members // Include members list
      };
    })
    .sort((a, b) => b.progressPercentage - a.progressPercentage); // Sort by progress (highest first)

  // Calculate team progress - only for non-deleted teams
  const teamProgress = data.teams
    .filter(team => !team.deleted) // Filter out deleted teams
    .map(team => {
      const teamProjects = data.userProjects.filter(p => p.team === team.id);
      const defaultMilestones = data?.config?.defaultMilestones || [];
      
      let totalTeamMilestones = 0;
      let completedTeamMilestones = 0;
      
      if (defaultMilestones.length > 0) {
        // Count only default milestones for this team
        teamProjects.forEach(project => {
          defaultMilestones.forEach(dm => {
            const projectMilestone = project.milestones.find(pm => pm.name === dm.name);
            if (projectMilestone) {
              totalTeamMilestones++;
              if (projectMilestone.completed) {
                completedTeamMilestones++;
              }
            } else {
              // If the default milestone doesn't exist in the project, count it as incomplete
              totalTeamMilestones++;
            }
          });
        });
      } else {
        // Fallback to original logic if no default milestones
        const teamMilestones = teamProjects.flatMap(p => p.milestones);
        totalTeamMilestones = teamMilestones.length;
        completedTeamMilestones = teamMilestones.filter(m => m.completed).length;
      }
      
      const teamProgress = totalTeamMilestones > 0 ? Math.round((completedTeamMilestones / totalTeamMilestones) * 100) : 0;
      
      // Get unique members in this team
      const members = [...new Set(teamProjects.map(p => p.owner))];

      return {
        id: team.id,
        name: team.name,
        totalMilestones: totalTeamMilestones,
        completedMilestones: completedTeamMilestones,
        progressPercentage: teamProgress,
        members: members // Include members list
      };
    })
    .sort((a, b) => b.progressPercentage - a.progressPercentage); // Sort by progress (highest first)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-12">
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          {isEditing && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                最后更新时间: {new Date().toLocaleString('zh-CN')}
              </p>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            {isEditing && editingConfig ? (
              <input
                type="text"
                value={editingConfig.projectName || ''}
                onChange={(e) => updateConfigField('projectName', e.target.value)}
                className="text-4xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                onBlur={saveConfigChanges}
              />
            ) : (
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {(config && config.projectName) || 'Web编码竞赛项目进度仪表板'}
              </h1>
            )}
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  编辑模式
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    退出编辑
                  </button>
                  {editingConfig && (
                    <button
                      onClick={cancelConfigEditing}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      取消
                    </button>
                  )}
                  {editingConfig && (
                    <button
                      onClick={saveConfigChanges}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      保存
                    </button>
                  )}
                  {!editingConfig && (
                    <button
                      onClick={startConfigEditing}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      编辑配置
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            个性化项目跟踪，按进度排名的竞赛视图
          </p>
          
          {/* Overall company progress */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              {isEditing && editingConfig ? (
                <input
                  type="text"
                  value={editingConfig.companyProgressTitle || ''}
                  onChange={(e) => updateConfigField('companyProgressTitle', e.target.value)}
                  className="text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                  onBlur={saveConfigChanges}
                />
              ) : (
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {(config && config.companyProgressTitle) || '公司整体进度'}
                </h2>
              )}
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-in-out" 
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {completedMilestones} / {totalMilestones} 里程碑已完成
            </div>
          </div>
        </header>

        <main>
          {/* Department and Team Management Section */}
          {isEditing && data && (
            <section className="mb-16">
              <DepartmentTeamManager
                departments={data.departments}
                teams={data.teams}
                onDepartmentsUpdate={updateDepartments}
                onTeamsUpdate={updateTeams}
                isEditing={isEditing}
              />
            </section>
          )}

          {/* Default Milestones Editor Section */}
          {isEditing && config && (
            <section className="mb-16">
              <DefaultMilestonesEditor
                defaultMilestones={config.defaultMilestones || []}
                onUpdate={(milestones) => {
                  if (config) {
                    updatePageConfig({ ...config, defaultMilestones: milestones });
                  }
                }}
                isEditing={isEditing}
              />
            </section>
          )}

          {/* Personal Projects Section - Ranked by completion */}
          <section className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">个人项目排名</h2>
              {isEditing && (
                <button
                  onClick={handleAddProject}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加项目
                </button>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              按完成度排序（进度快的在上，慢的在下）
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project) => (
                <UserProjectCard 
                  key={project.id} 
                  project={project} 
                  onToggleMilestone={toggleMilestoneCompletion} 
                  onProjectUpdate={handleProjectUpdate}
                  onProjectDelete={handleProjectDelete}
                  isEditing={isEditing}
                  departments={data.departments}
                  teams={data.teams}
                  defaultMilestones={config?.defaultMilestones}
                />
              ))}
            </div>
          </section>

          {/* Department Progress Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {isEditing && editingConfig ? (
                <input
                  type="text"
                  value={editingConfig.departmentProgressTitle || ''}
                  onChange={(e) => updateConfigField('departmentProgressTitle', e.target.value)}
                  className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                  onBlur={saveConfigChanges}
                />
              ) : (
                (config && config.departmentProgressTitle) || '部门进度排行榜'
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentProgress.map((dept) => (
                <GroupProgressCard 
                  key={dept.id} 
                  group={dept} 
                  groupName="department"
                  members={dept.members}
                />
              ))}
            </div>
          </section>

          {/* Team Progress Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              {isEditing && editingConfig ? (
                <input
                  type="text"
                  value={editingConfig.teamProgressTitle || ''}
                  onChange={(e) => updateConfigField('teamProgressTitle', e.target.value)}
                  className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                  onBlur={saveConfigChanges}
                />
              ) : (
                (config && config.teamProgressTitle) || '小组进度排行榜'
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamProgress.map((team) => (
                <GroupProgressCard 
                  key={team.id} 
                  group={team} 
                  groupName="team"
                  members={team.members}
                />
              ))}
            </div>
          </section>
        </main>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">请输入编辑密码</h3>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="输入密码"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-3 dark:bg-gray-700 dark:text-white"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              {passwordError && (
                <p className="text-red-500 text-sm mb-3">{passwordError}</p>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  取消
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}