import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { authCookie, serverAuthService } from '@/services/auth-server.service';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookie.name)?.value;
  const session = await serverAuthService.authenticateToken(token);

  if (session.success && session.user) {
    if (session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') {
      redirect('/admin/dashboard');
    }

    redirect('/dashboard');
  }

  redirect('/login');
}
