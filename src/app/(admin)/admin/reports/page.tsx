import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Reports | Mone Meeting' };

export default function AdminReportsPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800">Admin Reports</h2>
      <p className="text-gray-500 text-sm mt-2">Analytics and reporting features coming soon.</p>
    </div>
  );
}
