'use client';

import React from 'react';
import DepartmentCard from '@/components/DepartmentCard';
import { useProjectData } from '@/hooks/useProjectData';

export default function Home() {
  const { data, loading, toggleMilestoneCompletion } = useProjectData();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">项目进度仪表板</h1>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">项目进度仪表板</h1>
            <p className="text-lg text-red-600 dark:text-red-400">无法加载项目数据</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate overall company progress
  const allMilestones = data.departments.flatMap(dept => 
    dept.teams.flatMap(team => 
      team.projects.flatMap(project => project.milestones)
    )
  );
  const totalMilestones = allMilestones.length;
  const completedMilestones = allMilestones.filter(m => m.completed).length;
  const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans py-12">
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Web编码竞赛项目进度仪表板</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            跟踪各部门和团队的项目里程碑进度
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
          {data.departments.map((department) => (
            <DepartmentCard 
              key={department.id} 
              department={department} 
              onToggleMilestone={toggleMilestoneCompletion} 
            />
          ))}
        </main>

        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Web编码竞赛项目仪表板 • 实时跟踪项目里程碑进度
          </p>
        </footer>
      </div>
    </div>
  );
}