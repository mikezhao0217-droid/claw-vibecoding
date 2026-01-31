import fs from 'fs';
import path from 'path';
import { ProjectData } from '@/types/project';

const dataDirectory = path.join(process.cwd(), 'src', 'data');
const filePath = path.join(dataDirectory, 'projects.json');

export const readProjectsData = (): ProjectData => {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading projects data:', error);
    // Return empty structure if file doesn't exist
    return { departments: [] };
  }
};

export const writeProjectsData = (data: ProjectData): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing projects data:', error);
    throw error;
  }
};

// Helper functions to find specific items
export const findProject = (data: ProjectData, projectId: string) => {
  for (const dept of data.departments) {
    for (const team of dept.teams) {
      const project = team.projects.find(p => p.id === projectId);
      if (project) return project;
    }
  }
  return null;
};

export const findMilestone = (data: ProjectData, projectId: string, milestoneId: string) => {
  const project = findProject(data, projectId);
  if (project) {
    return project.milestones.find(m => m.id === milestoneId);
  }
  return null;
};