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
      // Check if default milestones have changed to handle cascading updates
      const oldDefaultMilestones = config?.defaultMilestones || [];
      const newDefaultMilestones = updatedConfig.defaultMilestones || [];
      
      // Find differences between old and new default milestones
      const oldMilestoneNames = oldDefaultMilestones.map((m: any) => m.name);
      const newMilestoneNames = newDefaultMilestones.map((m: any) => m.name);
      
      // Find added milestones
      const addedMilestones = newDefaultMilestones.filter((newMilestone: any) => 
        !oldMilestoneNames.includes(newMilestone.name)
      );
      
      // Find removed milestones
      const removedMilestones = oldDefaultMilestones.filter((oldMilestone: any) => 
        !newMilestoneNames.includes(oldMilestone.name)
      );
      
      // Find modified milestones (same name, different properties or position)
      const modifiedMilestones: { oldName: string, newName: string }[] = [];
      oldDefaultMilestones.forEach((oldMilestone: any) => {
        const newMilestone = newDefaultMilestones.find((m: any) => m.name === oldMilestone.name);
        if (newMilestone && newMilestone.id !== oldMilestone.id) {
          // If IDs are different but names match, it indicates a modification
          modifiedMilestones.push({ oldName: oldMilestone.name, newName: newMilestone.name });
        }
      });

      // Optimistically update the UI
      setConfig(updatedConfig);

      // Then update in Supabase
      const success = await updatePageConfigService(updatedConfig);
      
      if (!success) {
        // If the server update fails, revert the optimistic update
        console.error('Failed to update page config in database');
        const revertedConfig = await fetchPageConfigService();
        setConfig(revertedConfig);
      } else {
        // Apply cascading updates to user projects after successful config update
        if (addedMilestones.length > 0 || removedMilestones.length > 0 || modifiedMilestones.length > 0) {
          setData(prevData => {
            if (!prevData) return prevData;
            
            // Create a copy of user projects
            const updatedUserProjects = [...prevData.userProjects];
            
            // Process each user project
            updatedUserProjects.forEach(project => {
              const updatedMilestones = [...project.milestones];
              
              // Add new default milestones to each project (with completed=false)
              addedMilestones.forEach((addedMilestone: any) => {
                // Check if this milestone already exists in the project to avoid duplicates
                const exists = updatedMilestones.some(m => m.name === addedMilestone.name);
                if (!exists) {
                  updatedMilestones.push({
                    id: `proj-${project.id}-ms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    name: addedMilestone.name,
                    completed: false
                  });
                }
              });
              
              // Remove deleted default milestones from each project
              removedMilestones.forEach((removedMilestone: any) => {
                const index = updatedMilestones.findIndex(m => m.name === removedMilestone.name);
                if (index !== -1) {
                  updatedMilestones.splice(index, 1);
                }
              });
              
              // Update modified milestone names
              modifiedMilestones.forEach(mod => {
                const index = updatedMilestones.findIndex(m => m.name === mod.oldName);
                if (index !== -1) {
                  updatedMilestones[index] = {
                    ...updatedMilestones[index],
                    name: mod.newName
                  };
                }
              });
              
              // Update the project's milestones
              project.milestones = updatedMilestones;
            });
            
            return {
              ...prevData,
              userProjects: updatedUserProjects
            };
          });
          
          // After updating the local state, save the updated projects to the database
          setTimeout(async () => {
            try {
              const finalData = await fetchProjectData(); // Get latest data after state update
              if (finalData) {
                await updateProjectData({
                  departments: finalData.departments || [],
                  teams: finalData.teams || [],
                  userProjects: finalData.userProjects || []
                }).catch(error => {
                  console.error('Failed to update user projects after default milestones change:', error);
                  // Optionally reload data to revert changes if database update failed
                  fetchProjectData().then(revertedData => {
                    if (revertedData) {
                      setData(revertedData);
                    }
                  }).catch(fetchError => {
                    console.error('Failed to reload data after update failure:', fetchError);
                  });
                });
              }
            } catch (error) {
              console.error('Error updating user projects after default milestones change:', error);
            }
          }, 0);
        }
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