'use client';

import React, { useState, useEffect } from 'react';
import UserProjectCard from '@/components/UserProjectCard';
import GroupProgressCard from '@/components/GroupProgressCard';
import DepartmentTeamManager from '@/components/DepartmentTeamManager';
import DefaultMilestonesEditor from '@/components/DefaultMilestonesEditor';
import ProjectRankChart from '@/components/ProjectRankChart';
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
    
    // Get default milestones and set them as unchecked for new project
    const defaultMilestones = config?.defaultMilestones ?? [];
    const newProjectMilestones = Array.isArray(defaultMilestones) 
      ? defaultMilestones.map(dm => ({
          ...dm,
          completed: false // Set all default milestones as unchecked initially
        }))
      : [];
    
    const newProject = {
      id: `project-${Date.now()}`, // Generate a unique ID
      name: '新项目',
      owner: '新负责人',
      department: defaultDepartment,
      team: defaultTeam,
      milestones: newProjectMilestones, // Include all default milestones as unchecked
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-black font-sans py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <div className="animate-pulse">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4">
                {(config && config.projectName) || '项目进度管理仪表板'}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">正在加载项目进度数据...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-black font-sans py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4">
              {(config && config.projectName) || '项目进度管理仪表板'}
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
  const defaultMilestones = config?.defaultMilestones || [];
  let totalMilestones = 0;
  let completedMilestones = 0;
  
  if (defaultMilestones.length > 0) {
    // Count only milestones that match the default milestones
    data.userProjects.forEach(project => {
      defaultMilestones.forEach((dm: { id: string; name: string; completed: boolean }) => {
        const projectMilestone = project.milestones.find((pm: any) => pm.name === dm.name);
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
      const defaultMilestones = config?.defaultMilestones || [];
      
      let totalDeptMilestones = 0;
      let completedDeptMilestones = 0;
      
      if (defaultMilestones.length > 0) {
        // Count only default milestones for this department
        deptProjects.forEach(project => {
          defaultMilestones.forEach((dm: { id: string; name: string; completed: boolean }) => {
            const projectMilestone = project.milestones.find((pm: any) => pm.name === dm.name);
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
      const defaultMilestones = config?.defaultMilestones || [];
      
      let totalTeamMilestones = 0;
      let completedTeamMilestones = 0;
      
      if (defaultMilestones.length > 0) {
        // Count only default milestones for this team
        teamProjects.forEach(project => {
          defaultMilestones.forEach((dm: { id: string; name: string; completed: boolean }) => {
            const projectMilestone = project.milestones.find((pm: any) => pm.name === dm.name);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-black font-sans py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="mb-10 text-center relative">
          {isEditing && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-100 dark:border-blue-800/50 shadow-sm">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
                最后更新时间: {new Date().toLocaleString('zh-CN')}
              </p>
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
            <div className="flex-1 text-center md:text-left">
              {isEditing && editingConfig ? (
                <input
                  type="text"
                  value={editingConfig.projectName || ''}
                  onChange={(e) => updateConfigField('projectName', e.target.value)}
                  className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-transparent border-b-2 border-indigo-300 dark:border-indigo-600 focus:outline-none w-full max-w-2xl"
                  onBlur={saveConfigChanges}
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {(config && config.projectName) || '项目进度管理仪表板'}
                </h1>
              )}
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto md:mx-0">
                个性化项目跟踪，按进度排名的竞赛视图
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    编辑模式
                  </span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      退出编辑
                    </span>
                  </button>
                  {editingConfig && (
                    <button
                      onClick={cancelConfigEditing}
                      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        取消
                      </span>
                    </button>
                  )}
                  {editingConfig && (
                    <button
                      onClick={saveConfigChanges}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        保存
                      </span>
                    </button>
                  )}
                  {!editingConfig && (
                    <button
                      onClick={startConfigEditing}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-xl hover:from-purple-700 hover:to-fuchsia-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        编辑配置
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Overall company progress */}
          <div className="mt-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 max-w-2xl mx-auto border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              {isEditing && editingConfig ? (
                <input
                  type="text"
                  value={editingConfig.companyProgressTitle || ''}
                  onChange={(e) => updateConfigField('companyProgressTitle', e.target.value)}
                  className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-transparent border-b-2 border-indigo-200 dark:border-indigo-700 focus:outline-none focus:border-indigo-400 w-full max-w-xs"
                  onBlur={saveConfigChanges}
                />
              ) : (
                <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {(config && config.companyProgressTitle) || '公司整体进度'}
                </h2>
              )}
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2" 
                style={{ width: `${overallProgress}%` }}
              >
                {overallProgress > 20 && (
                  <span className="text-[10px] font-bold text-white drop-shadow">{overallProgress}%</span>
                )}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 flex justify-between">
              <span>
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  {completedMilestones} 完成
                </span>
              </span>
              <span>
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                  {totalMilestones} 总计
                </span>
              </span>
            </div>
          </div>
          
          {userProjects.length > 0 && (
            <div className="mt-10 max-w-6xl mx-auto bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-gray-700">
              <ProjectRankChart projects={userProjects} isEditing={isEditing} />
            </div>
          )}
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">个人项目排名</h2>
              {isEditing && (
                <button
                  onClick={handleAddProject}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  添加项目
                </button>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              按完成度排序（进度快的在上，慢的在下）
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="transform transition-all duration-300 hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <UserProjectCard 
                    project={project} 
                    onToggleMilestone={toggleMilestoneCompletion} 
                    onProjectUpdate={handleProjectUpdate}
                    onProjectDelete={handleProjectDelete}
                    isEditing={isEditing}
                    departments={data.departments}
                    teams={data.teams}
                    defaultMilestones={config?.defaultMilestones}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Department Progress Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-6 text-center">
              {isEditing && editingConfig ? (
                <input
                  type="text"
                  value={editingConfig.departmentProgressTitle || ''}
                  onChange={(e) => updateConfigField('departmentProgressTitle', e.target.value)}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-transparent border-b-2 border-indigo-200 dark:border-indigo-700 focus:outline-none focus:border-indigo-400 w-full max-w-xs"
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
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-6 text-center">
              {isEditing && editingConfig ? (
                <input
                  type="text"
                  value={editingConfig.teamProgressTitle || ''}
                  onChange={(e) => updateConfigField('teamProgressTitle', e.target.value)}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-transparent border-b-2 border-indigo-200 dark:border-indigo-700 focus:outline-none focus:border-indigo-400 w-full max-w-xs"
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
          <div className="fixed inset-0 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">请输入编辑密码</h3>
              </div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="输入密码"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-3 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              {passwordError && (
                <p className="text-red-500 text-sm mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                  {passwordError}
                </p>
              )}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md"
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