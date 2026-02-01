'use client';

import React from 'react';
import { GroupProgress } from '@/types/project';

interface GroupProgressCardProps {
  group: GroupProgress;
  groupName: string; // 'department' or 'team'
}

const GroupProgressCard: React.FC<GroupProgressCardProps> = ({ group, groupName }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white">{group.name}</h3>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {group.progressPercentage}%
          </span>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {group.completedMilestones}/{group.totalMilestones} 里程碑完成
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="h-2.5 rounded-full transition-all duration-500 ease-in-out"
            style={{ 
              width: `${group.progressPercentage}%`,
              backgroundColor: group.progressPercentage >= 70 ? '#10B981' : // green
                       group.progressPercentage >= 40 ? '#F59E0B' : // yellow
                       '#EF4444' // red
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default GroupProgressCard;