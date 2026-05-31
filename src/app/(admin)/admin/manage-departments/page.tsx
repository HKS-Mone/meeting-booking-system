'use client';

import { useState } from 'react';
import { departments as initialDepts, users, bookings } from '@/lib/mock-data';
import { Department } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function ManageDepartmentsPage() {
  const [depts, setDepts] = useState<Department[]>(initialDepts);
  const [addOpen, setAddOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [deleteDept, setDeleteDept] = useState<Department | null>(null);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    const d: Department = { id: `dept-${Date.now()}`, name: newName.trim() };
    setDepts((prev) => [...prev, d]);
    setNewName('');
    setAddOpen(false);
  };

  const handleDelete = (d: Department) => {
    setDepts((prev) => prev.filter((x) => x.id !== d.id));
    setDeleteDept(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Admin Panel › Manage Departments</p>
        <button
          id="add-department-btn"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Department Name', 'Members', 'Bookings', 'Actions'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {depts.map((d) => {
              const memberCount = users.filter((u) => u.departmentId === d.id).length;
              const bookingCount = bookings.filter((b) => b.departmentId === d.id).length;
              return (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{d.name}</td>
                  <td className="px-6 py-4 text-gray-600">{memberCount}</td>
                  <td className="px-6 py-4 text-gray-600">{bookingCount}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        id={`edit-dept-${d.id}`}
                        onClick={() => setEditDept(d)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-dept-${d.id}`}
                        onClick={() => setDeleteDept(d)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Department" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department Name</label>
            <input
              id="new-department-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Engineering"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAddOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Add</button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editDept} onClose={() => setEditDept(null)} title="Edit Department" size="sm">
        {editDept && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department Name</label>
              <input
                defaultValue={editDept.name}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditDept(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => setEditDept(null)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteDept} onClose={() => setDeleteDept(null)} title="Delete Department" size="sm">
        {deleteDept && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Delete <span className="font-semibold">{deleteDept.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteDept(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteDept)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
