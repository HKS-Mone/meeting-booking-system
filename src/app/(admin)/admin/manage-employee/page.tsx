'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../../../../../hook/useUser';
import type { User, Department } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/lib/auth-store';
import {
  Pencil, Trash2, Plus, UserCog,
  User as UserIcon, Mail, ShieldCheck, Building2,
  Lock, Eye, EyeOff, AlertTriangle, Users, UserPlus,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToastStore } from '@/components/ui/Toast';

/* ── Types ──────────── */
interface UserForm {
  name: string;
  email: string;
  role: 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN';
  departmentId: string;
  password: string;
}

type UserFormErrors = Partial<Record<keyof UserForm, string>>;

const EMPTY_FORM: UserForm = {
  name: '',
  email: '',
  role: 'EMPLOYEE',
  departmentId: '',
  password: '',
};

/* ── Helpers ───────── */
function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (!pw) return { level: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[0-9]/.test(pw)) score++;
  return { level: score as 0 | 1 | 2 | 3, label: ['Weak', 'Fair', 'Strong'][score - 1] ?? '' };
}

const initials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const selectStyle: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: '36px',
};

const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white hover:border-blue-300 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400';

const STRENGTH_BG   = ['', 'bg-red-400', 'bg-yellow-400', 'bg-emerald-500'];
const STRENGTH_TEXT = ['', 'text-red-500', 'text-yellow-600', 'text-emerald-600'];

/* ── UserFormFields ──────────── */
interface FormFieldsProps {
  form: UserForm;
  onChange: (f: Partial<UserForm>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  isEdit: boolean;
  departments: Department[];
  errors: UserFormErrors;
}

function UserFormFields({ form, onChange, showPassword, onTogglePassword, isEdit, departments, errors }: Readonly<FormFieldsProps>) {
  const pwStrength = getPasswordStrength(form.password);
  const fieldClass = (field: keyof UserForm, extra = '') =>
    `${inputCls} ${extra} relative z-20 ${errors[field] ? 'border-red-300 bg-red-50 hover:border-red-300 focus:ring-red-500' : ''}`;
  const errorText = (field: keyof UserForm) =>
    errors[field] ? <p className="relative z-30 text-xs text-red-500">{errors[field]}</p> : null;

  return (
    <div className="relative z-20 space-y-5">

      {/* ── Identity ───── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Identity</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative z-20 space-y-1.5">
            <label htmlFor="form-user-name" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <UserIcon className="w-3.5 h-3.5 text-gray-400" />
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              id="form-user-name"
              type="text"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="e.g. Jane Smith"
              className={fieldClass('name')}
            />
            {errorText('name')}
          </div>
          <div className="relative z-20 space-y-1.5">
            <label htmlFor="form-user-email" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              id="form-user-email"
              type="email"
              value={form.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="email@company.com"
              autoComplete="off"
              className={fieldClass('email')}
            />
            {errorText('email')}
          </div>
        </div>
      </div>

      {/* ── Access ────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Access</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Role selector — this form only manages employees; admin accounts are created via Add Admin */}
          <div className="relative z-20 space-y-1.5">
            <label htmlFor="form-user-role" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              Role <span className="text-red-400">*</span>
            </label>
            <select
              id="form-user-role"
              value={form.role}
              onChange={(e) => onChange({ role: e.target.value as UserForm['role'] })}
              disabled
              className={fieldClass('role', 'appearance-none disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed')}
              style={selectStyle}
            >
              <option value="EMPLOYEE">Employee</option>
              {form.role !== 'EMPLOYEE' && (
                <option value={form.role}>
                  {form.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </option>
              )}
            </select>
            {errorText('role')}
          </div>

          {/* Department */}
          <div className="relative z-20 space-y-1.5">
            <label htmlFor="form-user-department" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              Department <span className="text-red-400">*</span>
            </label>
            <select
              id="form-user-department"
              value={form.departmentId}
              onChange={(e) => onChange({ departmentId: e.target.value })}
              className={fieldClass('departmentId', 'appearance-none')}
              style={selectStyle}
            >
              {departments.length === 0 ? (
                <option value="" disabled>Loading departments...</option>
              ) : (
                departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))
              )}
            </select>
            {errorText('departmentId')}
          </div>
        </div>
      </div>

      {/* ── Security ──────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Security{isEdit && <span className="normal-case font-normal text-gray-400 ml-1">— leave blank to keep current</span>}
        </p>
        <div className="relative z-20 space-y-1.5">
          <label htmlFor="form-user-password" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            Password {!isEdit && <span className="text-red-400">*</span>}
          </label>
          <div className="relative">
            <input
              id="form-user-password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => onChange({ password: e.target.value })}
              placeholder={isEdit ? 'Leave blank to keep unchanged' : 'Min. 8 characters'}
              autoComplete="new-password"
              className={fieldClass('password', 'pr-11')}
            />
            <button
              type="button"
              id="toggle-user-password"
              tabIndex={-1}
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i <= pwStrength.level ? STRENGTH_BG[pwStrength.level] : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
              {pwStrength.label && (
                <p className={`text-xs font-semibold ${STRENGTH_TEXT[pwStrength.level]}`}>
                  Password strength: {pwStrength.label}
                </p>
              )}
            </div>
          )}
          {errorText('password')}
        </div>
      </div>
    </div>
  );
}

/* ───────────────  */
export default function ManageUsersPage() {
  const {
    users,
    departments,
    loadUsers,
    loadDepartments,
    createUser,
    updateUser,
    deleteUser: apiDeleteUser,
  } = useUser();
  const addToast = useToastStore((state) => state.addToast);
  const { currentUser } = useAuthStore();
  const canManageEmployees = currentUser?.role === 'SUPER_ADMIN';
  const canManageAdminRoles = currentUser?.role === 'SUPER_ADMIN';

  const [addOpen, setAddOpen]     = useState(false);
  const [editUser, setEditUser]   = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [form, setForm]           = useState<UserForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<UserFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, [loadUsers, loadDepartments]);

  const onChange = (f: Partial<UserForm>) => {
    setForm((prev) => ({ ...prev, ...f }));
    setFormErrors((prev) => {
      const next = { ...prev };
      (Object.keys(f) as Array<keyof UserForm>).forEach((field) => {
        delete next[field];
      });
      return next;
    });
  };
  const togglePw = () => setShowPassword((v) => !v);
  const canDeleteUser = (user: User) => canManageEmployees && (canManageAdminRoles || user.role === 'EMPLOYEE');

  /* Tally employee overview figures in a single pass. Time complexity: O(n). */
  const monthKey = new Date().toISOString().slice(0, 7); // yyyy-MM
  const overview = users.reduce(
    (acc, u) => {
      acc.total++;
      if (u.role === 'EMPLOYEE') acc.employees++;
      if (u.createdAt.startsWith(monthKey)) acc.newThisMonth++;
      return acc;
    },
    { total: 0, employees: 0, newThisMonth: 0 },
  );

  const overviewCards = [
    { title: 'Total Users',    value: overview.total,        sub: 'All accounts',    Icon: Users,     iconColor: 'text-indigo-600',  iconBg: 'bg-indigo-50',  subColor: 'text-gray-400' },
    { title: 'Employees',      value: overview.employees,    sub: 'Active staff',    Icon: UserIcon,  iconColor: 'text-blue-600',    iconBg: 'bg-blue-50',    subColor: 'text-gray-400' },
    { title: 'Departments',    value: departments.length,    sub: 'Total teams',     Icon: Building2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', subColor: 'text-gray-400' },
    { title: 'New This Month', value: overview.newThisMonth, sub: 'Recently joined', Icon: UserPlus,  iconColor: 'text-amber-600',   iconBg: 'bg-amber-50',   subColor: 'text-emerald-600' },
  ];
  const addForm = addOpen
    ? { ...form, departmentId: form.departmentId || departments[0]?.id || '' }
    : form;

  const validateForm = (options: { isEdit: boolean; departmentId: string }) => {
    const errors: UserFormErrors = {};
    const email = form.email.trim();

    if (!form.name.trim()) errors.name = 'Full name is required.';
    if (!email) errors.email = 'Email address is required.';
    else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';
    if (!options.departmentId) errors.departmentId = 'Please select a department.';
    if (!options.isEdit && form.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (options.isEdit && form.password && form.password.length < 8) errors.password = 'Password must be at least 8 characters.';

    setFormErrors(errors);
    const firstError = Object.values(errors)[0];
    if (firstError) addToast(firstError, 'error');
    return !firstError;
  };

  /* ── CRUD ────────────────── */
  const handleAdd = async () => {
    if (!canManageEmployees) {
      addToast('Only super admins can add users.', 'error');
      return;
    }

    const departmentId = form.departmentId || departments[0]?.id || '';
    if (!validateForm({ isEdit: false, departmentId })) return;

    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        departmentId,
        password: form.password,
      });
      setForm(EMPTY_FORM);
      setShowPassword(false);
      setAddOpen(false);
      setFormErrors({});
      addToast('Employee created successfully.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create employee.';
      setFormErrors({ email: message });
      addToast(message, 'error');
    }
  };

  const handleEdit = async () => {
    if (!editUser) return;

    if (!validateForm({ isEdit: true, departmentId: form.departmentId })) return;

    try {
      await updateUser(editUser.id, {
        name: form.name.trim() || undefined,
        email: form.email.trim(),
        role: form.role,
        departmentId: form.departmentId || undefined,
        password: form.password || undefined,
      });
      setShowPassword(false);
      setEditUser(null);
      setFormErrors({});
      addToast('Employee updated successfully.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update employee.';
      setFormErrors({ email: message });
      addToast(message, 'error');
    }
  };

  const handleDelete = async (u: User) => {
    if (!canManageEmployees) {
      addToast('Only super admins can delete users.', 'error');
      setDeleteUser(null);
      return;
    }

    if (u.role !== 'EMPLOYEE' && !canManageAdminRoles) {
      addToast('Only super admins can delete admin accounts.', 'error');
      setDeleteUser(null);
      return;
    }

    try {
      await apiDeleteUser(u.id);
      setDeleteUser(null);
      addToast('Employee deleted successfully.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete employee.';
      addToast(message, 'error');
    }
  };

  const openAdd = () => {
    if (!canManageEmployees) {
      addToast('Only super admins can add users.', 'error');
      return;
    }

    setForm({
      ...EMPTY_FORM,
      departmentId: departments[0]?.id ?? '',
    });
    setFormErrors({});
    setShowPassword(false);
    setAddOpen(true);
  };

  const openEdit = (u: User) => {
    setForm({
      name: u.name,
      email: u.email,
      role: u.role,
      departmentId: u.departmentId ?? departments[0]?.id ?? '',
      password: '',
    });
    setFormErrors({});
    setShowPassword(false);
    setEditUser(u);
  };

  const closeAdd  = () => { setForm(EMPTY_FORM); setFormErrors({}); setShowPassword(false); setAddOpen(false); };
  const closeEdit = () => { setForm(EMPTY_FORM); setFormErrors({}); setShowPassword(false); setEditUser(null); };

  /* ── Render ─────────────────────── */
  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Admin Panel › Manage Users</p>
        <button
          id="add-user-btn"
          onClick={openAdd}
          disabled={!canManageEmployees}
          className="flex items-center gap-2 px-5 py-2.5 md:py-3 text-white rounded-xl text-sm font-semibold transition-all duration-150 hover:shadow-lg hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          style={{ background: canManageEmployees ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' : '#94a3b8', boxShadow: canManageEmployees ? '0 4px 12px rgba(37,99,235,0.3)' : 'none' }}
          title={canManageEmployees ? 'Add employee' : 'Only super admins can add users'}
        >
          <Plus className="w-4.5 h-4.5" />
          Add Employee
        </button>
      </div>

      {/* ── Employees overview dashboard ────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Employees</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of all users, staff and departments</p>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mt-5">
          {overviewCards.map(({ title, value, sub, Icon, iconColor, iconBg, subColor }) => (
            <div
              key={title}
              className="flex items-center gap-3 sm:gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">{value}</p>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1 truncate">{title}</p>
                <p className={`text-[11px] mt-0.5 ${subColor}`}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MOBILE: Card list ────────────── */}
      <div className="sm:hidden space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: u.role === 'SUPER_ADMIN' ? 'linear-gradient(135deg,#7f1d1d,#dc2626)' : u.role === 'ADMIN' ? 'linear-gradient(135deg,#6d28d9,#9333ea)' : 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}
              >
                {initials(u.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 text-sm truncate">{u.name}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${u.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : 'Employee'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500">
              <div><span className="block font-medium text-gray-700">Department</span>{u.department?.name ?? '—'}</div>
              <div><span className="block font-medium text-gray-700">Joined</span>{formatDate(u.createdAt)}</div>
            </div>
            <div className="flex gap-2 pt-1 border-t border-gray-50">
              <button id={`edit-user-${u.id}`} onClick={() => openEdit(u)}
                className="flex-1 py-2.5 md:py-3 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                Edit
              </button>
              <button id={`delete-user-${u.id}`} onClick={() => canDeleteUser(u) ? setDeleteUser(u) : addToast('Only super admins can delete users.', 'error')}
                disabled={!canDeleteUser(u)}
                className="flex-1 py-2.5 md:py-3 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={canDeleteUser(u) ? 'Delete user' : 'Only super admins can delete users'}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP: Table ────────────────────────────────────────────────── */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"
          style={{ background: 'linear-gradient(90deg,#f8faff 0%,#f1f5f9 100%)' }}>
          <h2 className="text-base font-semibold text-gray-800">All Users</h2>
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <UserCog className="w-3.5 h-3.5" />
            {users.length} users total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px] lg:min-w-0">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Name', 'Email', 'Role', 'Department', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-3.5 md:py-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: u.role === 'SUPER_ADMIN' ? 'linear-gradient(135deg,#7f1d1d,#dc2626)' : u.role === 'ADMIN' ? 'linear-gradient(135deg,#6d28d9,#9333ea)' : 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}
                      >
                        {initials(u.name)}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 md:py-4 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3.5 md:py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'ADMIN' ? 'Admin' : 'Employee'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 md:py-4 text-gray-600 text-sm">{u.department?.name ?? '—'}</td>
                  <td className="px-4 py-3.5 md:py-4 text-gray-400 whitespace-nowrap text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3.5 md:py-4">
                    <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`edit-user-${u.id}`}
                        onClick={() => openEdit(u)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit user"
                      >
                        <Pencil className="w-4.5 h-4.5" />
                      </button>
                      <button
                        id={`delete-user-${u.id}`}
                        onClick={() => canDeleteUser(u) ? setDeleteUser(u) : addToast('Only super admins can delete users.', 'error')}
                        disabled={!canDeleteUser(u)}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title={canDeleteUser(u) ? 'Delete user' : 'Only super admins can delete users'}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════ Add Modal ════════════════ */}
      <Modal open={addOpen} onClose={closeAdd} title="Add New User" size="xl">
        <div className="space-y-6">
          <UserFormFields
            form={addForm}
            onChange={onChange}
            showPassword={showPassword}
            onTogglePassword={togglePw}
            isEdit={false}
            departments={departments}
            errors={formErrors}
          />
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={closeAdd} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              id="save-new-user-btn"
              onClick={handleAdd}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:shadow-lg hover:-translate-y-px active:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
            >
              <UserIcon className="w-4 h-4" />
              Create User
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════ Edit Modal ═══════════════ */}
      <Modal open={!!editUser} onClose={closeEdit} title="Edit User" size="xl">
        <div className="space-y-6">
          <UserFormFields
            form={form}
            onChange={onChange}
            showPassword={showPassword}
            onTogglePassword={togglePw}
            isEdit={true}
            departments={departments}
            errors={formErrors}
          />
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={closeEdit} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              id="save-edit-user-btn"
              onClick={handleEdit}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:shadow-lg hover:-translate-y-px active:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* ════════ Delete Modal ══════════════════════════════════ */}
      <Modal open={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete User" size="sm">
        {deleteUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700 leading-snug">This action cannot be undone.</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: deleteUser.role === 'SUPER_ADMIN' ? 'linear-gradient(135deg,#7f1d1d,#dc2626)' : deleteUser.role === 'ADMIN' ? 'linear-gradient(135deg,#6d28d9,#9333ea)' : 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}
              >
                {initials(deleteUser.name)}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{deleteUser.name}</p>
                <p className="text-xs text-gray-500">{deleteUser.email}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete <span className="font-semibold text-gray-800">{deleteUser.name}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteUser(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                id={`confirm-delete-user-${deleteUser.id}`}
                onClick={() => handleDelete(deleteUser)}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
