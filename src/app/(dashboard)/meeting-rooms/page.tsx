'use client';

import { useState, useMemo } from 'react';
import { rooms as allRooms } from '@/lib/mock-data';
import { RoomStatus } from '@/lib/types';
import RoomCard from '@/components/rooms/RoomCard';
import { Search, LayoutGrid, List } from 'lucide-react';

const STATUS_OPTIONS: { label: string; value: '' | RoomStatus }[] = [
  { label: 'All Status', value: '' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Occupied', value: 'OCCUPIED' },
  { label: 'Maintenance', value: 'MAINTENANCE' },
  { label: 'Out of Service', value: 'OUT_OF_SERVICE' },
];

export default function MeetingRoomsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | RoomStatus>('');
  const [gridView, setGridView] = useState(true);

  const filtered = useMemo(() => {
    return allRooms.filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="rooms-search"
            type="text"
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status filter */}
        <select
          id="rooms-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | RoomStatus)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setGridView(true)}
            className={`flex-1 flex items-center justify-center px-3 py-2.5 transition-colors ${
              gridView ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setGridView(false)}
            className={`flex-1 flex items-center justify-center px-3 py-2.5 transition-colors ${
              !gridView ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Showing <span className="font-semibold text-gray-700">{filtered.length}</span> room
        {filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center text-gray-400 text-sm">
          No rooms match your search.
        </div>
      ) : (
        <div
          className={
            gridView
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'flex flex-col gap-3'
          }
        >
          {filtered.map((room) =>
            gridView ? (
              <RoomCard key={room.id} room={room} />
            ) : (
              <div
                key={room.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-xl shrink-0 bg-gradient-to-br from-blue-400 to-blue-600`}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">{room.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {room.capacity} people · Floor {room.floor} · {room.roomType}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      room.status === 'AVAILABLE'
                        ? 'bg-green-100 text-green-700'
                        : room.status === 'OCCUPIED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {room.status}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
