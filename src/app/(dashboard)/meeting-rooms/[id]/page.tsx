import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { rooms, getRoomAvailability } from '@/lib/mock-data';
import { RoomStatusBadge } from '@/components/ui/StatusBadge';
import FacilityIcon from '@/components/rooms/FacilityIcon';
import AvailabilityStrip from '@/components/rooms/AvailabilityStrip';
import { Users, MapPin, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Room Details | MeetingHub',
  description: 'View meeting room details and availability.',
};

// In Next.js 16 params is a Promise
export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = rooms.find((r) => r.id === id);
  if (!room) notFound();

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), 'MMMM dd, yyyy');
  const slots = getRoomAvailability(room.id, today);

  const GRADIENT_MAP: Record<string, string> = {
    'Conference Room': 'from-blue-400 to-blue-600',
    'Meeting Room': 'from-purple-400 to-purple-600',
    'Board Room': 'from-slate-500 to-slate-700',
    'Training Room': 'from-teal-400 to-teal-600',
  };
  const gradient = GRADIENT_MAP[room.roomType] ?? 'from-gray-400 to-gray-600';

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/meeting-rooms" className="hover:text-blue-600">Meeting Rooms</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800 font-medium">Room Details</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Room image */}
          <div
            className={`w-full h-56 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
              </div>
              <p className="text-white font-semibold mt-2">{room.roomType}</p>
            </div>
          </div>

          {/* Availability strip */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Availability — {todayLabel}
            </h3>
            <AvailabilityStrip slots={slots} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Room name + status */}
            <div className="flex items-start justify-between mb-5">
              <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
              <RoomStatusBadge status={room.status} />
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              {[
                {
                  label: 'Capacity',
                  icon: <Users className="w-4 h-4 text-gray-400" />,
                  value: `${room.capacity} People`,
                },
                {
                  label: 'Location',
                  icon: <MapPin className="w-4 h-4 text-gray-400" />,
                  value: `Floor ${room.floor}`,
                },
                {
                  label: 'Room Type',
                  icon: null,
                  value: room.roomType,
                },
              ].map(({ label, icon, value }) => (
                <div key={label} className="flex items-center gap-3 py-2 border-b border-gray-50">
                  <div className="flex items-center gap-2 w-28 shrink-0 text-sm text-gray-500">
                    {icon}
                    {label}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>

            {/* Facilities */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Facilities</h3>
              <div className="flex flex-wrap gap-4">
                {room.facilities.map((f) => (
                  <FacilityIcon key={f} name={f} />
                ))}
              </div>
            </div>

            {/* Book Now */}
            <Link
              href={room.status === 'AVAILABLE' ? `/book-room?roomId=${room.id}` : '#'}
              className={`
                block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors
                ${
                  room.status === 'AVAILABLE'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                }
              `}
            >
              {room.status === 'AVAILABLE' ? 'Book Now' : 'Not Available'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
