import { redirect } from 'next/navigation';

// Users no longer have a dashboard — redirect to Calendar.
export default function DashboardPage() {
  redirect('/calendar');
}
