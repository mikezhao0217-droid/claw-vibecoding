'use client';

import { useState, useEffect } from 'react';
import { ProjectData } from '@/types/project';

export const useProjectData = () => {
  const [data, setData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const result: ProjectData = await response.json();
          setData(result);
        } else {
          console.error('Failed to fetch project data');
        }
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
            const project = team.projects.find(p => p.id === projectId);
            if (project) {
              const milestone = project.milestones.find(m => m.id === milestoneId);
              if (milestone) {
                milestone.completed = !milestone.completed;
                return newData;
              }
            }
          }
        }

        return prevData;
      });

      // Then update the server
      const project = data.departments
        .flatMap(d => d.teams)
        .flatMap(t => t.projects)
        .find(p => p.id === projectId);
      
      const milestone = project?.milestones.find(m => m.id === milestoneId);
      
      const response = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          completed: !milestone?.completed 
        }),
      });

      if (!response.ok) {
        // If the server update fails, revert the optimistic update
        console.error('Failed to update milestone on server');
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
      // Revert the optimistic update in case of network error
    }
  };

  return {
    data,
    loading,
    toggleMilestoneCompletion
  };
};