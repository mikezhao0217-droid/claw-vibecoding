import { NextRequest } from 'next/server';
import { toggleMilestoneCompletion } from '@/services/projectService';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  try {
    const awaitedParams = await params;
    const { id: projectId, milestoneId } = awaitedParams;
    const requestData = await request.json();
    const { completed, userId } = requestData;

    // Use the service function to update milestone in database
    // Note: In a real implementation, userId should come from authentication
    // For now, we'll use a default value or the one provided in request
    const actualUserId = userId || 'default-user';
    const success = await toggleMilestoneCompletion(projectId, milestoneId, actualUserId);
    
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