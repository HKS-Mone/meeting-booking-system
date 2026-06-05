'use client';

import { useState } from 'react';
import { departments } from '@/lib/mock-data';
import {
    UserPlus,
    User,
    ShieldCheck,
    Building2,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    ChevronRight,
} from 'lucide-react';

interface AdminForm {
    name: string;
    role: 'ADMIN';
    departmentId: string;
    email: string;
    password: string;
}

const EMPTY_FORM: AdminForm = {
    name: '',
    role: 'ADMIN',
    departmentId: departments[0]?.id ?? '',
    email: '',
    password: '',
};

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
    if (!pw) return { level: 0, label: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    const labels = ['Weak', 'Fair', 'Strong'];
    return { level: score as 0 | 1 | 2 | 3, label: labels[score - 1] ?? '' };
}

export default function AddAdminPage() {
    const [form, setForm] = useState<AdminForm>(EMPTY_FORM);
    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof AdminForm, string>>>({});

    const set = (f: Partial<AdminForm>) => setForm((prev) => ({ ...prev, ...f }));

    const validate = () => {
        const e: Partial<Record<keyof AdminForm, string>> = {};
        if (!form.name.trim()) e.name = 'Full name is required';
        if (!form.departmentId) e.departmentId = 'Please select a department';
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 8) e.password = 'Must be at least 8 characters';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        // TODO: integrate with backend / auth
        setSubmitted(true);
    };

    const handleReset = () => {
        setForm(EMPTY_FORM);
        setErrors({});
        setSubmitted(false);
    };

    const pwStrength = getPasswordStrength(form.password);
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
                <p className="text-xs text-gray-500">Admin Panel › Add Admin</p>
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
                            <h2 className="text-xl font-bold text-gray-800">Admin Created!</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                <span className="font-semibold text-gray-700">{form.name}</span> has been added as an admin successfully.
                            </p>
                        </div>
                        {/* Summary card */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left space-y-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
                                >
                                    {form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{form.name}</p>
                                    <p className="text-xs text-gray-500">{form.email}</p>
                                </div>
                                <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                    Admin
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1.5 border-t border-gray-50 pt-3">
                                <Building2 className="w-3.5 h-3.5" />
                                {departments.find((d) => d.id === form.departmentId)?.name ?? '—'}
                            </div>
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={handleReset}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Add Another
                            </button>
                            <a
                                href="/admin/manage-users"
                                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium text-center transition-colors flex items-center justify-center gap-1.5"
                                style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
                            >
                                Manage Users <ChevronRight className="w-3.5 h-3.5" />
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
            <p className="text-xs text-gray-500">Admin Panel › Add Admin</p>

            {/* Page header */}
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
                >
                    <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800">Add New Admin</h1>
                    <p className="text-xs text-gray-400">Create an administrator account with elevated privileges</p>
                </div>
            </div>

            {/* Form card */}
            <form
                onSubmit={handleSubmit}
                id="add-admin-form"
                noValidate
                autoComplete="off"
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >

                <div className="p-6 space-y-6">
                    {/* Row 1: Name + Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label htmlFor="admin-name" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                Full Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="admin-name"
                                type="text"
                                value={form.name}
                                onChange={(e) => set({ name: e.target.value })}
                                placeholder="Kasun Sameera"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        {/* Role (read-only) */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                                Role
                            </label>
                            <div className="relative">
                                <input
                                    id="admin-role"
                                    type="text"
                                    value="ADMIN"
                                    readOnly
                                    tabIndex={-1}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed select-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                    locked
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Department + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Department */}
                        <div className="space-y-1.5">
                            <label htmlFor="admin-department" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                Department <span className="text-red-400">*</span>
                            </label>
                            <select
                                id="admin-department"
                                value={form.departmentId}
                                onChange={(e) => set({ departmentId: e.target.value })}
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-no-repeat ${errors.departmentId ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                    backgroundPosition: 'right 14px center',
                                    paddingRight: '36px',
                                }}
                            >
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                            {errors.departmentId && <p className="text-xs text-red-500">{errors.departmentId}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label htmlFor="admin-email" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                <Mail className="w-3.5 h-3.5 text-gray-400" />
                                Email Address <span className="text-red-400">*</span>
                            </label>
                            <input
                                id="admin-email"
                                type="email"
                                value={form.email}
                                onChange={(e) => set({ email: e.target.value })}
                                placeholder="admin@company.com"
                                autoComplete="off"
                                className={`w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Row 3: Password (full width) */}
                    <div className="space-y-1.5">
                        <label htmlFor="admin-password" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                            Password <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={(e) => set({ password: e.target.value })}
                                placeholder="Min. 8 characters"
                                autoComplete="new-password"
                                className={`w-full px-4 py-2.5 pr-11 border rounded-xl text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            />
                            <button
                                type="button"
                                id="toggle-password-visibility"
                                tabIndex={-1}
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Strength bar */}
                        {form.password.length > 0 && (
                            <div className="space-y-1.5 pt-0.5">
                                <div className="flex gap-1">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength.level ? strengthColors[pwStrength.level] : 'bg-gray-100'
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
                        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                    </div>

                    {/* Info notice */}
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
                        <ShieldCheck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            This account will be granted <span className="font-semibold">full admin privileges</span> — including user management, booking oversight, and system settings. Share credentials securely.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1 border-t border-gray-50">
                        <button
                            type="button"
                            id="cancel-add-admin-btn"
                            onClick={handleReset}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            id="submit-add-admin-btn"
                            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:shadow-lg hover:-translate-y-px active:translate-y-0"
                            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
                        >
                            <UserPlus className="w-4 h-4" />
                            Create Admin Account
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
