// /lib/backend/optimized-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession as verifyAppSession } from '@/lib/auth/session';
import { connectToDatabase, findOneOptimized } from '@/db/db-optimized';
import { BrandWorkspace } from '@/models/Workspace';

/**
 * Optimized authentication middleware with caching
 */
const workspaceCache = new Map<string, { workspace: any; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds cache

export async function optimizedRequireAuth(
  request: NextRequest,
  params: { slug: string }
): Promise<{ 
  session: any; 
  workspace: any; 
  errorResponse?: Response 
}> {
  const startTime = Date.now();
  const cacheKey = `${params.slug}`;
  
  try {
    // Check session
    const session = await verifyAppSession();
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
    
    // Check cache first
    const cached = workspaceCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      // Verify workspace belongs to user
      if (cached.workspace.ownerUserId.toString() === session.userId) {
        const duration = Date.now() - startTime;
        console.log(`✅ Auth cache hit for ${params.slug}: ${duration}ms`);
        return { session, workspace: cached.workspace, errorResponse: undefined };
      }
    }
    
    await connectToDatabase();
    
    // Use optimized query
    const workspace = await findOneOptimized(BrandWorkspace, {
      slug: params.slug,
      ownerUserId: session.userId
    });
    
    if (!workspace) {
      return { 
        session: null, 
        workspace: null,
        errorResponse: new Response(
          JSON.stringify({ success: false, error: 'Workspace not found or access denied' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      };
    }
    
    // Cache the result
    workspaceCache.set(cacheKey, { workspace, timestamp: Date.now() });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Auth for ${params.slug}: ${duration}ms`);
    
    return { session, workspace, errorResponse: undefined };
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { 
      session: null, 
      workspace: null,
      errorResponse: new Response(
        JSON.stringify({ success: false, error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    };
  }
}

/**
 * Clear workspace cache (call when workspace is updated)
 */
export function clearWorkspaceCache(slug: string) {
  workspaceCache.delete(slug);
}