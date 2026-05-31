import { redirect } from 'next/navigation';

// Booking approval has been replaced by Manage Bookings (admin-created bookings with no approval flow).
export default function BookingApprovalRedirect() {
  redirect('/admin/manage-bookings');
}
