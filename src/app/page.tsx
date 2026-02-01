'use client';

import React, { useState } from 'react';
import UserProjectCard from '@/components/UserProjectCard';
import GroupProgressCard from '@/components/GroupProgressCard';
import { useProjectData } from '@/hooks/useProjectData';

export default function Home() {
  const { data, loading, toggleMilestoneCompletion } = useProjectData();
  const [currentUser] = useState("current-user"); // In a real app, this would come from authentication

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Web编码竞赛项目进度仪表板</h1>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Web编码竞赛项目进度仪表板</h1>
            <p className="text-lg text-red-600 dark:text-red-400">无法加载项目数据</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter projects for the current user and sort by completion rate (descending)
  const userProjects = [...data.userProjects]
    .filter(project => project.userId === currentUser || currentUser === "current-user") // For demo, show all projects
    .sort((a, b) => {
      const aProgress = a.milestones.filter(m => m.completed).length / a.milestones.length;
      const bProgress = b.milestones.filter(m => m.completed).length / b.milestones.length;
      return bProgress - aProgress; // Sort descending (higher progress first)
    });

  // Calculate overall company progress
  const allMilestones = data.userProjects.flatMap(project => project.milestones);
  const totalMilestones = allMilestones.length;
  const completedMilestones = allMilestones.filter(m => m.completed).length;
  const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  // Calculate department progress
  const departmentProgress = data.departments.map(dept => {
    const deptProjects = data.userProjects.filter(p => p.department === dept.id);
    const deptMilestones = deptProjects.flatMap(p => p.milestones);
    const totalDeptMilestones = deptMilestones.length;
    const completedDeptMilestones = deptMilestones.filter(m => m.completed).length;
    const deptProgress = totalDeptMilestones > 0 ? Math.round((completedDeptMilestones / totalDeptMilestones) * 100) : 0;

    return {
      id: dept.id,
      name: dept.name,
      totalMilestones: totalDeptMilestones,
      completedMilestones: completedDeptMilestones,
      progressPercentage: deptProgress
    };
  }).sort((a, b) => b.progressPercentage - a.progressPercentage); // Sort by progress (highest first)

  // Calculate team progress
  const teamProgress = Array.from(new Set(data.userProjects.map(p => p.team))).map(teamId => {
    const teamProjects = data.userProjects.filter(p => p.team === teamId);
    const teamMilestones = teamProjects.flatMap(p => p.milestones);
    const totalTeamMilestones = teamMilestones.length;
    const completedTeamMilestones = teamMilestones.filter(m => m.completed).length;
    const teamProgress = totalTeamMilestones > 0 ? Math.round((completedTeamMilestones / totalTeamMilestones) * 100) : 0;

    // Get team name from data.teams array
    const teamInfo = data.teams.find(t => t.id === teamId);
    const teamName = teamInfo ? teamInfo.name : teamId;

    return {
      id: teamId,
      name: teamName,
      totalMilestones: totalTeamMilestones,
      completedMilestones: completedTeamMilestones,
      progressPercentage: teamProgress
    };
  }).sort((a, b) => b.progressPercentage - a.progressPercentage); // Sort by progress (highest first)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-12">
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Web编码竞赛项目进度仪表板</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            个性化项目跟踪，按进度排名的竞赛视图
          </p>
          
          {/* Overall company progress */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">公司整体进度</h2>
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
          {/* Personal Projects Section - Ranked by completion */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">个人项目排名</h2>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
              按完成度排序（进度快的在上，慢的在下）
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProjects.map((project) => (
                <UserProjectCard 
                  key={project.id} 
                  project={project} 
                  onToggleMilestone={toggleMilestoneCompletion} 
                />
              ))}
            </div>
          </section>

          {/* Department Progress Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">部门进度排行榜</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentProgress.map((dept) => (
                <GroupProgressCard 
                  key={dept.id} 
                  group={dept} 
                  groupName="department" 
                />
              ))}
            </div>
          </section>

          {/* Team Progress Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">小组进度排行榜</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamProgress.map((team) => (
                <GroupProgressCard 
                  key={team.id} 
                  group={team} 
                  groupName="team" 
                />
              ))}
            </div>
          </section>
        </main>

        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Web编码竞赛项目仪表板 • 个性化跟踪与竞赛排名
          </p>
        </footer>
      </div>
    </div>
  );
}