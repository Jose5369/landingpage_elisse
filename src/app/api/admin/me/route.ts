import { NextRequest } from 'next/server';
import { getCurrentUser, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = getCurrentUser(request);
  if (!user) return unauthorizedResponse();

  return Response.json({ user });
}
