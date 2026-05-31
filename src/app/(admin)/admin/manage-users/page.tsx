'use client';

import { useState } from 'react';
import { users as initialUsers, departments } from '@/lib/mock-data';
import { User, Role } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import { Pencil, Trash2, Plus, UserCog } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UserForm {
  name: string;
  email: string;
  role: Role;
  departmentId: string;
}

const EMPTY_FORM: UserForm = {
  name: '',
  email: '',
  role: 'USER',
  departmentId: departments[0]?.id ?? '',
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);

  const fieldVal = (f: Partial<UserForm>) => setForm((prev) => ({ ...prev, ...f }));

  const handleAdd = () => {
    if (!form.name.trim() || !form.email.trim()) return;
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
    setEditUser(null);
  };

  const handleDelete = (u: User) => {
    setUsers((prev) => prev.filter((x) => x.id !== u.id));
    setDeleteUser(null);
  };

  const openEdit = (u: User) => {
    setForm({
      name: u.name,
      email: u.email,
      role: u.role,
      departmentId: u.departmentId ?? departments[0]?.id ?? '',
    });
    setEditUser(u);
  };

  const UserFormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            id="form-user-name"
            type="text"
            value={form.name}
            onChange={(e) => fieldVal({ name: e.target.value })}
            placeholder="e.g. John Smith"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            id="form-user-email"
            type="email"
            value={form.email}
            onChange={(e) => fieldVal({ email: e.target.value })}
            placeholder="email@company.com"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
          <select
            id="form-user-role"
            value={form.role}
            onChange={(e) => fieldVal({ role: e.target.value as Role })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
          <select
            id="form-user-department"
            value={form.departmentId}
            onChange={(e) => fieldVal({ departmentId: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Admin Panel › Manage Users</p>
        <button
          id="add-user-btn"
          onClick={() => { setForm(EMPTY_FORM); setAddOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* ── MOBILE: Card list ──────────────────────────────────────── */}
      <div className="sm:hidden space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 ${u.role === 'ADMIN' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 text-sm truncate">{u.name}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                {u.role === 'ADMIN' ? 'Admin' : 'User'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500">
              <div><span className="block font-medium text-gray-700">Department</span>{u.department?.name ?? '—'}</div>
              <div><span className="block font-medium text-gray-700">Joined</span>{formatDate(u.createdAt)}</div>
            </div>
            <div className="flex gap-2 pt-1 border-t border-gray-50">
              <button id={`edit-user-${u.id}`} onClick={() => openEdit(u)}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                Edit
              </button>
              <button id={`delete-user-${u.id}`} onClick={() => setDeleteUser(u)}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── DESKTOP: Table ─────────────────────────────────────────── */}
      <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
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
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${u.role === 'ADMIN' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                        {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.department?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        id={`edit-user-${u.id}`}
                        onClick={() => openEdit(u)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-user-${u.id}`}
                        onClick={() => setDeleteUser(u)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
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

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User" size="md">
        <div className="space-y-5">
          <UserFormFields />
          <div className="flex gap-3 pt-1">
            <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
            <button id="save-new-user-btn" onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Add User</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User" size="md">
        <div className="space-y-5">
          <UserFormFields />
          <div className="flex gap-3 pt-1">
            <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
            <button id="save-edit-user-btn" onClick={handleEdit} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete User" size="sm">
        {deleteUser && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Delete user <span className="font-semibold">{deleteUser.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteUser(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
              <button
                id={`confirm-delete-user-${deleteUser.id}`}
                onClick={() => handleDelete(deleteUser)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
