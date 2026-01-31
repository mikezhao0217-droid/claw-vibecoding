'use client';

import React from 'react';
import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
  onToggleMilestone: (projectId: string, milestoneId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onToggleMilestone }) => {
  const completedCount = project.milestones.filter(m => m.completed).length;
  const totalCount = project.milestones.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{project.name}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {project.members.map((member, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                >
                  {member}
                </span>
              ))}
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            {progressPercentage}% 完成
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Milestones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">里程碑:</h4>
          {project.milestones.map((milestone) => (
            <div key={milestone.id} className="flex items-center">
              <input
                type="checkbox"
                checked={milestone.completed}
                onChange={() => onToggleMilestone(project.id, milestone.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label 
                htmlFor={`${project.id}-${milestone.id}`}
                className={`ml-2 text-sm ${milestone.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}
              >
                {milestone.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;