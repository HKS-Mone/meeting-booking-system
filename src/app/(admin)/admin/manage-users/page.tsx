'use client';

import { useState } from 'react';
import { users as initialUsers, departments, roles } from '@/lib/mock-data';
import { User, Role } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import {
  Pencil, Trash2, Plus, UserCog,
  User as UserIcon, Mail, ShieldCheck, Building2,
  Lock, Eye, EyeOff, AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

/* ── Types ──────────────────────────────────────────────────────────────────── */
interface UserForm {
  name: string;
  email: string;
  role: Role;
  departmentId: string;
  password: string;
}

const EMPTY_FORM: UserForm = {
  name: '',
  email: '',
  role: 'USER',
  departmentId: departments[0]?.id ?? '',
  password: '',
};

/* ── Password strength ───────────────────────────────────────────────────────── */
function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (!pw) return { level: 0, label: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return { level: score as 0 | 1 | 2 | 3, label: ['Weak', 'Fair', 'Strong'][score - 1] ?? '' };
}

/* ── Helpers ──────────────────────────────────────────────────────────────────── */
const initials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: '36px',
};

const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white hover:border-blue-300 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400';

/* ══════════════════════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════════════════════ */
export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);

  const fieldVal = (f: Partial<UserForm>) => setForm((prev) => ({ ...prev, ...f }));
  const pwStrength = getPasswordStrength(form.password);
  const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-emerald-500'];
  const strengthTextColors = ['', 'text-red-500', 'text-yellow-600', 'text-emerald-600'];

  /* ── CRUD ─────────────────────────────────────────────────────────────────── */
  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 8) return;
    const dept = departments.find((d) => d.id === form.departmentId);
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      departmentId: form.departmentId,
      department: dept,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setAddOpen(false);
  };

  const handleEdit = () => {
    if (!editUser) return;
    const dept = departments.find((d) => d.id === form.departmentId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editUser.id
          ? { ...u, name: form.name, email: form.email, role: form.role, departmentId: form.departmentId, department: dept }
          : u
      )
    );
    setShowPassword(false);
    setEditUser(null);
  };

  const handleDelete = (u: User) => {
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    setDeleteUser(null);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setAddOpen(true);
  };

  const openEdit = (u: User) => {
    setForm({
      name: '',
      email: '',
      role: u.role,
      departmentId: u.departmentId ?? departments[0]?.id ?? '',
      password: '',
    });
    setShowPassword(false);
    setEditUser(u);
  };

  const closeAdd = () => { setForm(EMPTY_FORM); setShowPassword(false); setAddOpen(false); };
  const closeEdit = () => { setForm(EMPTY_FORM); setShowPassword(false); setEditUser(null); };

  /* ── Shared form ──────────────────────────────────────────────────────────── */
  const UserFormFields = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-5">

      {/* ── Section: Identity ─────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Identity</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="form-user-name" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <UserIcon className="w-3.5 h-3.5 text-gray-400" />
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              id="form-user-name"
              type="text"
              value={form.name}
              onChange={(e) => fieldVal({ name: e.target.value })}
              placeholder="e.g. Jane Smith"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="form-user-email" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              id="form-user-email"
              type="email"
              value={form.email}
              onChange={(e) => fieldVal({ email: e.target.value })}
              placeholder="email@company.com"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── Section: Access ───────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Access</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Role — pill toggle */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              Role
            </label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  id={`role-toggle-${r.value.toLowerCase()}`}
                  onClick={() => fieldVal({ role: r.value })}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    form.role === r.value
                      ? r.value === 'ADMIN'
                        ? 'bg-white text-purple-700 shadow-sm'
                        : 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label htmlFor="form-user-department" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              Department <span className="text-red-400">*</span>
            </label>
            <select
              id="form-user-department"
              value={form.departmentId}
              onChange={(e) => fieldVal({ departmentId: e.target.value })}
              className={`${inputCls} appearance-none`}
              style={selectStyle}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Section: Security ─────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Security {isEdit && <span className="normal-case font-normal text-gray-400 ml-1">— leave blank to keep current password</span>}
        </p>
        <div className="space-y-1.5">
          <label htmlFor="form-user-password" className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            Password {!isEdit && <span className="text-red-400">*</span>}
          </label>
          <div className="relative">
            <input
              id="form-user-password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => fieldVal({ password: e.target.value })}
              placeholder={isEdit ? 'Leave blank to keep unchanged' : 'Min. 8 characters'}
              className={`${inputCls} pr-11`}
            />
            <button
              type="button"
              id="toggle-user-password"
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
            <div className="space-y-1.5 pt-1">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i <= pwStrength.level ? strengthColors[pwStrength.level] : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
              {pwStrength.label && (
                <p className={`text-xs font-semibold ${strengthTextColors[pwStrength.level]}`}>
                  Password strength: {pwStrength.label}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* ── Render ───────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Admin Panel › Manage Users</p>
        <button
          id="add-user-btn"
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-semibold transition-all duration-150 hover:shadow-lg hover:-translate-y-px active:translate-y-0"
          style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* ── MOBILE: Card list ─────────────────────────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: u.role === 'ADMIN' ? 'linear-gradient(135deg,#6d28d9,#9333ea)' : 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}
              >
                {initials(u.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 text-sm truncate">{u.name}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {u.role === 'ADMIN' ? 'Admin' : 'User'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500">
              <div><span className="block font-medium text-gray-700">Department</span>{u.department?.name ?? '—'}</div>
              <div><span className="block font-medium text-gray-700">Joined</span>{formatDate(u.createdAt)}</div>
            </div>
            <div className="flex gap-2 pt-1 border-t border-gray-50">
              <button id={`edit-user-${u.id}`} onClick={() => openEdit(u)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                Edit
              </button>
              <button id={`delete-user-${u.id}`} onClick={() => setDeleteUser(u)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: u.role === 'ADMIN' ? 'linear-gradient(135deg,#6d28d9,#9333ea)' : 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}
                      >
                        {initials(u.name)}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{u.department?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`edit-user-${u.id}`}
                        onClick={() => openEdit(u)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit user"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-user-${u.id}`}
                        onClick={() => setDeleteUser(u)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ════════════════════ Add Modal ════════════════════════════════════ */}
      <Modal open={addOpen} onClose={closeAdd} title="Add New User" size="xl">
        <div className="space-y-6">
          <UserFormFields isEdit={false} />
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={closeAdd}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
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

      {/* ════════════════════ Edit Modal ═══════════════════════════════════ */}
      <Modal open={!!editUser} onClose={closeEdit} title="Edit User" size="xl">
        <div className="space-y-6">
          <UserFormFields isEdit={true} />
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={closeEdit}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
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

      {/* ════════════════════ Delete Modal ═════════════════════════════════ */}
      <Modal open={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete User" size="sm">
        {deleteUser && (
          <div className="space-y-5">
            {/* Warning banner */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-700 leading-snug">This action cannot be undone.</p>
            </div>
            {/* User preview */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: deleteUser.role === 'ADMIN' ? 'linear-gradient(135deg,#6d28d9,#9333ea)' : 'linear-gradient(135deg,#1e3a8a,#2563eb)' }}
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
              <button
                onClick={() => setDeleteUser(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                id={`confirm-delete-user-${deleteUser.id}`}
                onClick={() => handleDelete(deleteUser)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
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
