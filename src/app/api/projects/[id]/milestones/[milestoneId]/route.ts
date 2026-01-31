import { NextRequest } from 'next/server';
import { toggleMilestoneCompletion } from '@/services/projectService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { id: projectId, milestoneId } = awaitedParams;
    const { completed } = await request.json();

    // Use the service function to update milestone in database
    const success = await toggleMilestoneCompletion(projectId, milestoneId);
    
    if (!success) {
      return Response.json(
        { error: 'Failed to update milestone in database' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Milestone updated successfully',
      projectId,
      milestoneId,
      completed
    });
  } catch (error) {
    console.error('Error in PATCH /api/projects/[id]/milestones/[milestoneId]:', error);
    return Response.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}