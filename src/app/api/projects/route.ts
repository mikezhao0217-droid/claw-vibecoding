import { NextRequest } from 'next/server';
import { fetchProjectData, updateProjectData } from '@/services/projectService';
import { ProjectData } from '@/types/project';

export async function GET(request: NextRequest) {
  try {
    const data = await fetchProjectData();
    if (data) {
      return Response.json(data);
    } else {
      // Return empty structure if no data exists
      return Response.json({ departments: [] });
    }
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return Response.json({ 
      error: 'Failed to fetch project data',
      departments: []
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: ProjectData = await request.json();
    
    const success = await updateProjectData(body);
    
    if (success) {
      return Response.json({ 
        success: true, 
        message: 'Project data updated successfully' 
      });
    } else {
      return Response.json({ 
        success: false, 
        error: 'Failed to update project data in database' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in PUT /api/projects:', error);
    return Response.json({ 
      success: false, 
      error: 'Invalid data provided' 
    }, { status: 400 });
  }
}