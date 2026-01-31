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

  const toggleMilestoneCompletion = async (projectId: string, milestoneId: string) => {
    if (!data) return;

    try {
      // Optimistically update the UI
      setData(prevData => {
        if (!prevData) return prevData;

        const newData = JSON.parse(JSON.stringify(prevData)) as ProjectData;

        for (const dept of newData.departments) {
          for (const team of dept.teams) {
            for (const project of team.projects) {
              if (project.id === projectId) {
                const milestone = project.milestones.find(m => m.id === milestoneId);
                if (milestone) {
                  milestone.completed = !milestone.completed;
                  return newData;
                }
              }
            }
          }
        }

        return prevData;
      });

      // Then update in Supabase
      const success = await toggleMilestone(projectId, milestoneId);
      
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