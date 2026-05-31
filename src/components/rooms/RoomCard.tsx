'use client';

import { Room } from '@/lib/types';
import { RoomStatusBadge } from '@/components/ui/StatusBadge';
import { Users, MapPin } from 'lucide-react';
import Link from 'next/link';

interface RoomCardProps {
  room: Room;
  showAdmin?: boolean;
  onEdit?: (room: Room) => void;
  onDelete?: (room: Room) => void;
}

// Gradient placeholder images by room type
const GRADIENT_MAP: Record<string, string> = {
  'Conference Room': 'from-blue-400 to-blue-600',
  'Meeting Room': 'from-purple-400 to-purple-600',
  'Board Room': 'from-slate-500 to-slate-700',
  'Training Room': 'from-teal-400 to-teal-600',
};

export default function RoomCard({ room, showAdmin, onEdit, onDelete }: RoomCardProps) {
  const gradient = GRADIENT_MAP[room.roomType] ?? 'from-gray-400 to-gray-600';
  const isBookable = room.status === 'AVAILABLE';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* Room image / placeholder */}
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-end p-3`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
        <RoomStatusBadge status={room.status} />
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">{room.name}</h3>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{room.capacity} People</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Floor {room.floor}</span>
          </div>
        </div>

        {showAdmin ? (
          <div className="flex gap-2 mt-3">
            <Link
              href={`/meeting-rooms/${room.id}`}
              className="flex-1 text-center text-xs font-medium py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              View
            </Link>
            <button
              onClick={() => onEdit?.(room)}
              className="flex-1 text-xs font-medium py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(room)}
              className="flex-1 text-xs font-medium py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mt-3">
            <Link
              href={`/meeting-rooms/${room.id}`}
              className="flex-1 text-center text-xs font-medium py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              View Details
            </Link>
            <Link
              href={isBookable ? `/book-room?roomId=${room.id}` : '#'}
              className={`
                flex-1 text-center text-xs font-semibold py-2 rounded-lg transition-colors
                ${
                  isBookable
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                }
              `}
            >
              Book Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
