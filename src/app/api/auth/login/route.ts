import { NextRequest, NextResponse } from 'next/server';
import { authCookie, serverAuthService } from '@/services/auth-server.service';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(authCookie.name)?.value;
  const result = await serverAuthService.authenticateToken(token);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error ?? 'Invalid session.' }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: result.user });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
  }

  const result = await serverAuthService.login({
    email: body.email,
    password: body.password,
  });

  if (!result.success || !result.token) {
    return NextResponse.json({ success: false, error: result.error ?? 'Invalid email or password.' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true, user: result.user });
  response.cookies.set(authCookie.name, result.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: authCookie.maxAge,
    path: '/',
  });

  return response;
}
