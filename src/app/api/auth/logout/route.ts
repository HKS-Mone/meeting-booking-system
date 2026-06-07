import { NextResponse } from 'next/server';
import { authCookie } from '@/services/auth-server.service';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(authCookie.name);

  return response;
}
