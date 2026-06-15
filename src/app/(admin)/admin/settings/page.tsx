'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import {
    Settings,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    ShieldCheck,
    ChevronRight,
} from 'lucide-react';
import { useToastStore } from '@/components/ui/Toast';
import { updatePassword } from '@/services/user.service';

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
    if (!pw) return { level: 0, label: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    const labels = ['Weak', 'Fair', 'Strong'];
    return { level: score as 0 | 1 | 2 | 3, label: labels[score - 1] ?? '' };
}

export default function AdminSettingsPage() {
    const { currentUser } = useAuthStore();
    const email = currentUser?.email ?? 'admin@meetinghub.com';
    const name = currentUser?.name ?? 'Admin User';

    const addToast = useToastStore((state) => state.addToast);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

    const set = (f: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...f }));

    const validate = () => {
        const e: Partial<Record<keyof typeof form, string>> = {};
        if (!form.currentPassword) e.currentPassword = 'Current password is required';
        if (!form.newPassword) e.newPassword = 'New password is required';
        else if (form.newPassword.length < 8) e.newPassword = 'Must be at least 8 characters';
        if (!form.confirmPassword) e.confirmPassword = 'Confirm password is required';
        else if (form.confirmPassword !== form.newPassword) e.confirmPassword = 'Passwords do not match';
        setErrors(e);
        const firstError = Object.values(e)[0];
        if (firstError) addToast(firstError, 'error');
        return !firstError;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const result = await updatePassword(form.currentPassword, form.newPassword);
            if (result.success) {
                addToast('Password updated successfully!', 'success');
                setSubmitted(true);
            } else {
                addToast(result.error ?? 'Failed to update password.', 'error');
                if (result.error?.toLowerCase().includes('current password')) {
                    setErrors({ currentPassword: result.error });
                }
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'An error occurred while updating the password.';
            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setErrors({});
        setSubmitted(false);
    };

    const pwStrength = getPasswordStrength(form.newPassword);
    const strengthColors: Record<number, string> = {
        0: '',
        1: 'bg-red-400',
        2: 'bg-yellow-400',
        3: 'bg-emerald-400',
    };
    const strengthTextColors: Record<number, string> = {
        0: '',
        1: 'text-red-500',
        2: 'text-yellow-500',
        3: 'text-emerald-500',
    };

    /* ── Success Screen ─────────────────────────────────────────────────────── */
    if (submitted) {
        return (
            <div className="space-y-5">
                <p className="text-xs text-gray-500">Admin Panel › Settings</p>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center space-y-5 max-w-sm mx-auto">
                        {/* Animated checkmark */}
                        <div
                            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', boxShadow: '0 8px 32px rgba(37,99,235,0.35)' }}
                        >
                            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={1.8} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Password Updated!</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Your account credentials have been updated successfully.
                            </p>
                        </div>
                        {/* Summary card */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left space-y-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
                                >
                                    {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{name}</p>
                                    <p className="text-xs text-gray-500">{email}</p>
                                </div>
                                <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                    Admin
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1.5 border-t border-gray-50 pt-3">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                Credentials secured
                            </div>
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={handleReset}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Back to Settings
                            </button>
                            <a
                                href="/admin/dashboard"
                                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium text-center transition-colors flex items-center justify-center gap-1.5"
                                style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
                            >
                                Dashboard <ChevronRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Form ───────────────────────────────────────────────────────────────── */
    return (
        <div className="space-y-5">
            {/* Breadcrumb */}
            <p className="text-xs text-gray-500">Admin Panel › Settings</p>

            {/* Page header */}
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                >
                    <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800">Admin Settings</h1>
                </div>
            </div>

            {/* Form card */}
            <form
                onSubmit={handleSubmit}
                id="settings-form"
                noValidate
                autoComplete="off"
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >

                <div className="p-6 space-y-6">
                    {/* Row 1: Email + Current Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Email (read-only) */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="settings-email"
                                    type="email"
                                    value={email}
                                    readOnly
                                    tabIndex={-1}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed select-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                    locked
                                </span>
                            </div>
                        </div>

                        {/* Current Password */}
                        <div className="space-y-1.5">
                            <label htmlFor="current-password" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                                Current Password <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="current-password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={form.currentPassword}
                                    autoComplete="new-password"
                                    onChange={(e) => set({ currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                    className={`w-full px-4 py-2.5 pr-11 border rounded-xl text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowCurrentPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword}</p>}
                        </div>
                    </div>

                    {/* Row 2: New Password + Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label htmlFor="new-password" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                                New Password <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="new-password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={form.newPassword}
                                    onChange={(e) => set({ newPassword: e.target.value })}
                                    placeholder="Min. 8 characters"
                                    className={`w-full px-4 py-2.5 pr-11 border rounded-xl text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowNewPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {form.newPassword.length > 0 && (
                                <div className="space-y-1.5 pt-0.5">
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                    i <= pwStrength.level ? strengthColors[pwStrength.level] : 'bg-gray-100'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    {pwStrength.label && (
                                        <p className={`text-xs font-medium ${strengthTextColors[pwStrength.level]}`}>
                                            Password strength: {pwStrength.label}
                                        </p>
                                    )}
                                </div>
                            )}
                            {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label htmlFor="confirm-password" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                                Confirm Password <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={form.confirmPassword}
                                    onChange={(e) => set({ confirmPassword: e.target.value })}
                                    placeholder="Re-enter new password"
                                    className={`w-full px-4 py-2.5 pr-11 border rounded-xl text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1 border-t border-gray-50">
                        <button
                            type="button"
                            id="cancel-settings-btn"
                            onClick={handleReset}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            id="submit-settings-btn"
                            disabled={loading}
                            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:shadow-lg hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
