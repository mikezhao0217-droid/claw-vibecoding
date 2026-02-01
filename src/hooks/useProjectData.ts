'use client';

import { useState, useEffect } from 'react';
import { ProjectData } from '@/types/project';
import { fetchProjectData, toggleMilestoneCompletion as toggleMilestone } from '@/services/projectService';

export const useProjectData = () => {
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchProjectData();
        setData(result);
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleMilestoneCompletion = async (projectId: string, milestoneId: string, userId: string) => {
    if (!data) return;

    try {
      // Optimistically update the UI
      setData(prevData => {
        if (!prevData) return prevData;

        const newData = JSON.parse(JSON.stringify(prevData)) as ProjectData;

        // Find and update the specific user's project
        const projectIndex = newData.userProjects.findIndex(
          p => p.id === projectId && p.userId === userId
        );
        
        if (projectIndex !== -1) {
          const project = newData.userProjects[projectIndex];
          const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
          
          if (milestoneIndex !== -1) {
            // Toggle the milestone completion status
            newData.userProjects[projectIndex].milestones[milestoneIndex].completed = 
              !newData.userProjects[projectIndex].milestones[milestoneIndex].completed;
            return newData;
          }
        }

        return prevData;
      });

      // Then update in Supabase
      const success = await toggleMilestone(projectId, milestoneId, userId);
      
      if (!success) {
        // If the server update fails, revert the optimistic update
        console.error('Failed to update milestone in database');
        const revertedData = await fetchProjectData();
        setData(revertedData);
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
      // Revert the optimistic update in case of network error
      const revertedData = await fetchProjectData();
      setData(revertedData);
    }
  };

  return {
    data,
    loading,
    toggleMilestoneCompletion
  };
};