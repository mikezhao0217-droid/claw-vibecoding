'use client';

import React from 'react';
import { Team } from '@/types/project';
import ProjectCard from './ProjectCard';

interface TeamCardProps {
  team: Team;
  onToggleMilestone: (projectId: string, milestoneId: string) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onToggleMilestone }) => {
  // Calculate overall progress for the team
  const allMilestones = team.projects.flatMap(project => project.milestones);
  const totalMilestones = allMilestones.length;
  const completedMilestones = allMilestones.filter(m => m.completed).length;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</h3>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            团队进度: <span className="font-bold">{progressPercentage}%</span>
          </span>
        </div>
      </div>
      <div className="p-4 space-y-4">
        {team.projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onToggleMilestone={onToggleMilestone} 
          />
        ))}
      </div>
    </div>
  );
};

export default TeamCard;