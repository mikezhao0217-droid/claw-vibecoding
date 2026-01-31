'use client';

import React from 'react';
import { Department } from '@/types/project';
import TeamCard from './TeamCard';

interface DepartmentCardProps {
  department: Department;
  onToggleMilestone: (projectId: string, milestoneId: string) => void;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, onToggleMilestone }) => {
  // Calculate overall progress for the department
  const allMilestones = department.teams.flatMap(team => 
    team.projects.flatMap(project => project.milestones)
  );
  const totalMilestones = allMilestones.length;
  const completedMilestones = allMilestones.filter(m => m.completed).length;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{department.name}</h2>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">部门整体进度</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{progressPercentage}%</div>
          </div>
        </div>
        
        {/* Department progress bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {department.teams.map((team) => (
          <TeamCard 
            key={team.id} 
            team={team} 
            onToggleMilestone={onToggleMilestone} 
          />
        ))}
      </div>
    </div>
  );
};

export default DepartmentCard;