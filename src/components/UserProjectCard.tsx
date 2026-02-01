'use client';

import React, { useState } from 'react';
import { UserProject } from '@/types/project';

interface UserProjectCardProps {
  project: UserProject;
  onToggleMilestone: (projectId: string, milestoneId: string, userId: string) => void;
  onProjectUpdate: (updatedProject: UserProject) => void;
  onProjectDelete: (projectId: string) => void;
  isEditing: boolean;
  departments?: Array<{ id: string; name: string }>;
  teams?: Array<{ id: string; name: string; department_id: string }> | import('@/types/project').Team[];
  defaultMilestones?: Array<{ id: string; name: string; completed: boolean }>;
}

const UserProjectCard: React.FC<UserProjectCardProps> = ({ 
  project, 
  onToggleMilestone, 
  onProjectUpdate,
  onProjectDelete,
  isEditing,
  departments = [],
  teams = [],
  defaultMilestones
}) => {
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: project.name,
    owner: project.owner,
    department: project.department,
    team: project.team
  });
  
  const completedCount = project.milestones.filter(m => m.completed).length;
  const totalCount = project.milestones.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Helper function to handle toggling with default milestones
  const onToggleMilestoneWithDefaults = (milestone: any) => {
    // Check if this milestone already exists in the project
    const existingMilestone = project.milestones.find((m: any) => m.name === milestone.name);
    
    if (existingMilestone) {
      // Milestone exists in project, toggle its completion status
      onToggleMilestone(project.id, existingMilestone.id, project.userId);
    } else {
      // Milestone doesn't exist in project, add it first with the correct completion status
      const newMilestone = {
        id: `proj-${project.id}-ms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate a unique ID for this project's milestone
        name: milestone.name,
        completed: !milestone.completed // Toggle the status
      };
      
      // Create updated project with the new milestone
      const updatedProject = {
        ...project,
        milestones: [...project.milestones, newMilestone]
      };
      
      // Update the project first
      onProjectUpdate(updatedProject);
      
      // Then toggle the milestone to ensure the completion state is correct
      setTimeout(() => {
        onToggleMilestone(project.id, newMilestone.id, project.userId);
      }, 0);
    }
  };

  const handleSave = () => {
    const updatedProject = {
      ...project,
      name: editForm.name,
      owner: editForm.owner,
      department: editForm.department,
      team: editForm.team
    };
    onProjectUpdate(updatedProject);
    setIsEditingLocal(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {isEditing && !isEditingLocal ? (
              <button
                onClick={() => setIsEditingLocal(true)}
                className="text-left text-lg font-semibold text-green-700 dark:text-green-300 hover:underline"
              >
                {project.name}
              </button>
            ) : isEditingLocal ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full text-lg font-semibold text-gray-900 dark:text-white mb-1 border rounded px-2 py-1"
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            ) : (
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-1">{project.name}</h3>
            )}
            
            <div className="flex flex-wrap gap-2 mb-3">
              {isEditing && !isEditingLocal ? (
                <button
                  onClick={() => setIsEditingLocal(true)}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                >
                  负责人: {project.owner}
                </button>
              ) : isEditingLocal ? (
                <input
                  type="text"
                  value={editForm.owner}
                  onChange={(e) => setEditForm({...editForm, owner: e.target.value})}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border"
                  onBlur={handleSave}
                />
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  负责人: {project.owner}
                </span>
              )}
              
              {isEditing && !isEditingLocal ? (
                <button
                  onClick={() => setIsEditingLocal(true)}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                >
                  {departments.find(d => d.id === project.department)?.name || project.department}
                </button>
              ) : isEditingLocal ? (
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border"
                  onBlur={handleSave}
                >
                  {(departments as any[]).filter(dept => !dept.deleted).map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  {departments.find(d => d.id === project.department)?.name || project.department}
                </span>
              )}
              
              {isEditing && !isEditingLocal ? (
                <button
                  onClick={() => setIsEditingLocal(true)}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                >
                  {(() => {
                    const team = teams.find(t => t.id === project.team);
                    return team ? (typeof team.name !== 'undefined' ? team.name : project.team) : project.team;
                  })()}
                </button>
              ) : isEditingLocal ? (
                <select
                  value={editForm.team}
                  onChange={(e) => setEditForm({...editForm, team: e.target.value})}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 border"
                  onBlur={handleSave}
                >
                  {(teams as any[]).filter(team => !team.deleted).map(team => {
                    // Handle both formats: API format (department_id) and TypeScript interface format (departmentId)
                    const departmentId = 'department_id' in team ? team.department_id : (team as any).departmentId;
                    return (
                      <option key={team.id} value={team.id}>
                        {team.name} ({departments.find(d => d.id === departmentId)?.name || departmentId})
                      </option>
                    );
                  })}
                </select>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                  {(() => {
                    const team = teams.find(t => t.id === project.team);
                    return team ? (typeof team.name !== 'undefined' ? team.name : project.team) : project.team;
                  })()}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {progressPercentage}% 完成
            </span>
            {isEditing && (
              <button
                onClick={() => onProjectDelete(project.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                删除
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Milestones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">里程碑:</h4>
          {(() => {
            // Determine which milestones to display
            let milestonesToDisplay = project.milestones;
            
            if (defaultMilestones && defaultMilestones.length > 0) {
              // If we have default milestones, use them as the base but merge with project's actual state
              milestonesToDisplay = defaultMilestones.map(dm => {
                // Check if this default milestone exists in the project and get its actual state
                const projectMilestone = project.milestones.find(pm => pm.name === dm.name);
                return {
                  ...dm,
                  completed: projectMilestone ? projectMilestone.completed : false,
                  id: projectMilestone ? projectMilestone.id : dm.id
                };
              });
              
              // Add any project-specific milestones that aren't in defaults
              project.milestones.forEach(pm => {
                if (!defaultMilestones.some(dm => dm.name === pm.name)) {
                  milestonesToDisplay.push(pm);
                }
              });
            }
            
            return milestonesToDisplay.map((milestone) => (
              <div key={milestone.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={milestone.completed}
                  onChange={() => isEditing && onToggleMilestoneWithDefaults(milestone)}
                  disabled={!isEditing}
                  className={isEditing ? "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" : 
                             milestone.completed ? "h-4 w-4 text-green-500 focus:ring-green-300 border-gray-300 rounded cursor-not-allowed" :
                             "h-4 w-4 text-gray-400 focus:ring-gray-300 border-gray-300 rounded cursor-not-allowed opacity-60"}
                />
                <label 
                  htmlFor={`${project.id}-${milestone.id}`}
                  className={`ml-2 text-sm ${milestone.completed ? 'line-through text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {milestone.name}
                </label>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default UserProjectCard;