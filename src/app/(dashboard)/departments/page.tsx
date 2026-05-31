import type { Metadata } from 'next';
import { departments, users, bookings } from '@/lib/mock-data';
import { Users, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Departments | Mone Meeting',
  description: 'View all departments and their booking statistics.',
};

export default function DepartmentsPage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {departments.map((dept) => {
          const deptUsers = users.filter((u) => u.departmentId === dept.id);
          const deptBookings = bookings.filter((b) => b.departmentId === dept.id);
          const colors = [
            { bg: 'bg-blue-50', text: 'text-blue-700', accent: 'bg-blue-600' },
            { bg: 'bg-purple-50', text: 'text-purple-700', accent: 'bg-purple-600' },
            { bg: 'bg-green-50', text: 'text-green-700', accent: 'bg-green-600' },
            { bg: 'bg-orange-50', text: 'text-orange-700', accent: 'bg-orange-600' },
          ];
          const c = colors[departments.indexOf(dept) % colors.length];

          return (
            <div
              key={dept.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className={`h-2 ${c.accent}`} />
              <div className="p-5">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                  <span className={`text-lg font-bold ${c.text}`}>
                    {dept.name[0]}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 text-base">{dept.name}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{deptUsers.length} Members</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{deptBookings.length} Bookings</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
