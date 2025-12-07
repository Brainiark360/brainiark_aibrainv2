// /lib/backend/auth.ts
import { NextRequest } from 'next/server';
import { verifySession as verifyAppSession } from '@/lib/auth/session';

export async function verifySession() {
  const session = await verifyAppSession();
  if (!session) return null;
  
  // In a real app, you'd fetch user details from database
  return {
    userId: session.userId,
    email: '',
    firstName: '',
    lastName: ''
  };
}

export async function validateWorkspaceAccess(
  slug: string, 
  userId: string
): Promise<{ success: boolean; workspace?: any; error?: string }> {
  try {
    const { BrandWorkspace } = await import('@/models/Workspace');
    const { connectToDatabase } = await import('@/db/db');
    
    await connectToDatabase();
    
    const workspace = await BrandWorkspace.findOne({ 
      slug,
      ownerUserId: userId 
    }).lean();
    
    if (!workspace) {
      return { 
        success: false, 
        error: 'Workspace not found or access denied' 
      };
    }
    
    return { success: true, workspace };
  } catch (error) {
    console.error('Workspace validation error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function requireAuth(
  request: NextRequest,
  params: { slug: string } // Now accepting resolved params
): Promise<{ 
  session: any; 
  workspace: any; 
  errorResponse?: Response 
}> {
  const session = await verifySession();
  
  if (!session) {
    return { 
      session: null, 
      workspace: null,
      errorResponse: new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }
  
  const { success, workspace, error } = await validateWorkspaceAccess(
    params.slug,
    session.userId
  );
  
  if (!success) {
    return { 
      session: null, 
      workspace: null,
      errorResponse: new Response(
        JSON.stringify({ success: false, error: error || 'Access denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }
  
  return { session, workspace, errorResponse: undefined };
}