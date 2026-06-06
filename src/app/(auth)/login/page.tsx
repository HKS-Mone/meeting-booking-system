'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Eye, EyeOff, Mail, Lock, Calendar } from 'lucide-react';
import type { Metadata } from 'next';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) { setError('Email is required.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return; }
    if (!password) { setError('Password is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); 

    const result = login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Login failed.');
      return;
    }

    const user = useAuthStore.getState().currentUser;
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/calendar');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f1f5f9' }}>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex min-h-0">
        {/* Left panel — illustration */}
        <div
          className="hidden md:flex flex-col items-center justify-center flex-1 p-10 relative"
          style={{ background: 'linear-gradient(135deg, #1e2a4a 0%, #2563eb 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute top-8 left-8 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute bottom-12 right-8 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-0 w-20 h-20 rounded-full bg-blue-400/20" />

          {/* SVG illustration */}
          <svg viewBox="0 0 400 300" className="w-72 h-auto relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Table */}
            <rect x="60" y="160" width="280" height="10" rx="5" fill="#60a5fa" opacity="0.8"/>
            <rect x="100" y="170" width="12" height="80" rx="4" fill="#3b82f6" opacity="0.6"/>
            <rect x="288" y="170" width="12" height="80" rx="4" fill="#3b82f6" opacity="0.6"/>
            {/* Chairs */}
            <rect x="50" y="145" width="50" height="30" rx="8" fill="#93c5fd" opacity="0.7"/>
            <rect x="155" y="145" width="50" height="30" rx="8" fill="#93c5fd" opacity="0.7"/>
            <rect x="260" y="145" width="50" height="30" rx="8" fill="#93c5fd" opacity="0.7"/>
            {/* Person 1 */}
            <circle cx="75" cy="120" r="20" fill="#bfdbfe"/>
            <rect x="58" y="138" width="34" height="40" rx="10" fill="#bfdbfe" opacity="0.9"/>
            {/* Person 2 */}
            <circle cx="180" cy="118" r="20" fill="#eff6ff"/>
            <rect x="163" y="136" width="34" height="40" rx="10" fill="#eff6ff" opacity="0.9"/>
            {/* Person 3 */}
            <circle cx="285" cy="120" r="20" fill="#bfdbfe"/>
            <rect x="268" y="138" width="34" height="40" rx="10" fill="#bfdbfe" opacity="0.9"/>
            {/* Presentation board */}
            <rect x="140" y="30" width="120" height="80" rx="8" fill="white" opacity="0.15"/>
            <rect x="148" y="40" width="104" height="60" rx="4" fill="white" opacity="0.1"/>
            <rect x="155" y="50" width="60" height="6" rx="3" fill="white" opacity="0.5"/>
            <rect x="155" y="62" width="90" height="4" rx="2" fill="white" opacity="0.3"/>
            <rect x="155" y="72" width="75" height="4" rx="2" fill="white" opacity="0.3"/>
            <rect x="155" y="82" width="45" height="4" rx="2" fill="white" opacity="0.3"/>
            {/* Chart bar on board */}
            <rect x="248" y="70" width="10" height="22" rx="2" fill="#60a5fa" opacity="0.7"/>
            <rect x="234" y="60" width="10" height="32" rx="2" fill="#34d399" opacity="0.7"/>
          </svg>

          <div className="mt-8 text-center relative z-10">
            <h2 className="text-2xl font-bold text-white">Meeting Room Booking</h2>
            <p className="text-blue-200 text-sm mt-2">
              Streamline your workspace scheduling with ease
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="w-full md:flex-1 flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 md:px-10" style={{ maxWidth: '460px' }}>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-gray-900 font-bold text-lg leading-none block">Mone Meeting</span>
              <span className="text-gray-400 text-[10px]">Mone Booking System</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-500 text-sm mt-1 mb-8">Please login to your account</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-btn"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          {/* <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-blue-600">
              <p><span className="font-medium">Admin:</span> admin@meetinghub.com / admin123</p>
              <p><span className="font-medium">User:</span> dilshan@meetinghub.com / user123</p>
            </div>
          </div> */}

          <p className="text-center text-xs text-gray-400 mt-6">
            Don&apos;t have an account?{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
              Contact Admin
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
