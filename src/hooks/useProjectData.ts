'use client';

import { useState, useEffect } from 'react';
import { ProjectData, UserProject } from '@/types/project';
import { 
  fetchProjectData, 
  toggleMilestoneCompletion as toggleMilestone, 
  updateProjectData as updateProjectDataService,
  addProject as addProjectService,
  updateProject as updateProjectService,
  deleteProject as deleteProjectService,
  fetchPageConfig as fetchPageConfigService,
  updatePageConfig as updatePageConfigService,
  updateDepartmentsOnly,
  updateTeamsOnly
} from '@/services/projectService';

export const useProjectData = () => {
  const [data, setData] = useState<ProjectData | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectData, pageConfig] = await Promise.all([
          fetchProjectData(),
          fetchPageConfigService()
        ]);
        
        setData(projectData);
        setConfig(pageConfig);
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

  // More specific update functions for better database handling
  const addProject = async (project: UserProject) => {
    try {
      // Optimistically update the UI
      setData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          userProjects: [...prevData.userProjects, project]
        };
      });

      // Then update in Supabase
      const success = await addProjectService(project);
      
      if (!success) {
        // If the server update fails, revert the optimistic update
        console.error('Failed to add project in database');
        const revertedData = await fetchProjectData();
        setData(revertedData);
      }
    } catch (error) {
      console.error('Error adding project:', error);
      // Revert the optimistic update in case of network error
      const revertedData = await fetchProjectData();
      setData(revertedData);
    }
  };

  const updateSingleProject = async (updatedProject: UserProject) => {
    try {
      // Optimistically update the UI
      setData(prevData => {
        if (!prevData) return prevData;
        
        const updatedProjects = prevData.userProjects.map(proj => 
          proj.id === updatedProject.id ? updatedProject : proj
        );
        
        return {
          ...prevData,
          userProjects: updatedProjects
        };
      });

      // Then update in Supabase
      const success = await updateProjectService(updatedProject);
      
      if (!success) {
        // If the server update fails, revert the optimistic update
        console.error('Failed to update project in database');
        const revertedData = await fetchProjectData();
        setData(revertedData);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      // Revert the optimistic update in case of network error
      const revertedData = await fetchProjectData();
      setData(revertedData);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      // Optimistically update the UI
      setData(prevData => {
        if (!prevData) return prevData;
        
        const updatedProjects = prevData.userProjects.filter(proj => proj.id !== projectId);
        
        return {
          ...prevData,
          userProjects: updatedProjects
        };
      });

      // Then update in Supabase
      const success = await deleteProjectService(projectId);
      
      if (!success) {
        // If the server update fails, revert the optimistic update
        console.error('Failed to delete project in database');
        const revertedData = await fetchProjectData();
        setData(revertedData);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      // Revert the optimistic update in case of network error
      const revertedData = await fetchProjectData();
      setData(revertedData);
    }
  };

  // Keep the original updateProjectData function for bulk operations
  const updateProjectData = async (updatedData: ProjectData) => {
    try {
      // Optimistically update the UI
      setData(updatedData);

      // Then update in Supabase
      const success = await updateProjectDataService(updatedData);
      
      if (!success) {
        // If the server update fails, revert the optimistic update
        console.error('Failed to update project data in database');
        const revertedData = await fetchProjectData();
        setData(revertedData);
      }
    } catch (error) {
      console.error('Error updating project data:', error);
      // Revert the optimistic update in case of network error
      const revertedData = await fetchProjectData();
      setData(revertedData);
    }
  };

  // Configuration management functions
  const updatePageConfig = async (updatedConfig: any) => {
    try {
      // Optimistically update the UI
      setConfig(updatedConfig);

      // Then update in Supabase
      const success = await updatePageConfigService(updatedConfig);
      
      if (!success) {
        // If the server update fails, revert the optimistic update
        console.error('Failed to update page config in database');
        const revertedConfig = await fetchPageConfigService();
        setConfig(revertedConfig);
      }
    } catch (error) {
      console.error('Error updating page config:', error);
      // Revert the optimistic update in case of network error
      const revertedConfig = await fetchPageConfigService();
      setConfig(revertedConfig);
    }
  };

  // Department and team management functions
  const updateDepartments = async (updatedDepartments: any[]) => {
    try {
      setData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          departments: updatedDepartments
        };
      });

      // Then update in Supabase - only update departments, not the whole dataset
      const success = await updateDepartmentsOnly(updatedDepartments);
      
      if (!success) {
        // If the server update fails, revert the optimistic update
        console.error('Failed to update departments in database');
        const revertedData = await fetchProjectData();
        setData(revertedData);
      }
    } catch (error) {
      console.error('Error updating departments:', error);
      // Revert the optimistic update in case of network error
      const revertedData = await fetchProjectData();
      setData(revertedData);
    }
  };

  const updateTeams = async (updatedTeams: any[]) => {
    try {
      setData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          teams: updatedTeams
        };
      });

      // Then update in Supabase - only update teams, not the whole dataset
      const success = await updateTeamsOnly(updatedTeams);
      
      if (!success) {
        // If the server update fails, revert the optimistic update
        console.error('Failed to update teams in database');
        const revertedData = await fetchProjectData();
        setData(revertedData);
      }
    } catch (error) {
      console.error('Error updating teams:', error);
      // Revert the optimistic update in case of network error
      const revertedData = await fetchProjectData();
      setData(revertedData);
    }
  };

  return {
    data,
    config,
    loading,
    toggleMilestoneCompletion,
    updateProjectData,
    addProject,
    updateSingleProject,
    deleteProject,
    updatePageConfig,
    updateDepartments,
    updateTeams
  };
};