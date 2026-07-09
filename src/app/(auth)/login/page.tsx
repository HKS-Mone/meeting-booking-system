'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hook/useAuth';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import type { User } from '@/lib/types';

function getPostLoginPath(user?: User) {
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
    ? '/admin/dashboard'
    : '/calendar';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, login, isLoading, isCheckingSession } = useAuth({
    checkSessionOnMount: false,
  });
  const router = useRouter();
  const isLoginPending = isLoading || isSubmitting;

  useEffect(() => {
    if (!isCheckingSession && currentUser) {
      router.replace(getPostLoginPath(currentUser));
    }
  }, [currentUser, isCheckingSession, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoginPending) {
      return;
    }

    setError('');

    if (!email) { setError('Email is required.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return; }
    if (!password) { setError('Password is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setIsSubmitting(true);
    const result = await login({ email, password });

    if (!result.success) {
      setError(result.error ?? 'Login failed.');
      setIsSubmitting(false);
      return;
    }

    window.location.replace(getPostLoginPath(result.user));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full-screen background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-bg.png')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Login card */}
      <div
        className="relative z-10 w-full max-w-[420px] mx-4 rounded-2xl p-7 sm:p-9"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.1)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
            style={{
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
            }}
          >
            <Image
              src="/mone_logo.png"
              alt="Mone Meeting logo"
              width={48}
              height={48}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div>
            <span className="text-gray-900 font-bold text-xl leading-none block tracking-tight">
              M ONE MEETING
            </span>
          </div>
        </div>

        {/* Welcome heading */}
        <h1 className="text-2xl sm:text-[26px] font-extrabold text-gray-900 text-center tracking-tight">
          WELCOME
        </h1>
        <p className="text-blue-500 text-sm mt-1.5 mb-7 text-center font-medium">
          Please Login to Your Account
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg transition-colors active:scale-95"
              >
                {showPass ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="login-btn"
            disabled={isLoginPending}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #4f8ffa 0%, #3b6ef6 50%, #2563eb 100%)',
              boxShadow: '0 4px 14px rgba(59, 110, 246, 0.35)',
            }}
          >
            {isLoginPending ? (
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

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <span className="text-blue-600 font-semibold cursor-pointer hover:underline transition-colors">
            Contact Admin
          </span>
        </p>
      </div>

      {/* Bottom-left brand watermark */}
      <div className="absolute bottom-4 left-5 z-10 flex items-center gap-1.5 opacity-60">
        <div className="w-5 h-5 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
          <Image
            src="/mone_logo.png"
            alt="Mone Meeting logo"
            width={20}
            height={20}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="text-white text-xs font-medium tracking-wide">Mone Meeting</span>
      </div>
    </div>
  );
}
