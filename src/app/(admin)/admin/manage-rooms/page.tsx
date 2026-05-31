'use client';

import { useState } from 'react';
import { rooms as initialRooms } from '@/lib/mock-data';
import { Room } from '@/lib/types';
import RoomCard from '@/components/rooms/RoomCard';
import Modal from '@/components/ui/Modal';
import { Plus, Trash2 } from 'lucide-react';

export default function ManageRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteRoom, setDeleteRoom] = useState<Room | null>(null);
  const [newRoomName, setNewRoomName] = useState('');

  const handleDelete = (room: Room) => {
    setRooms((prev) => prev.filter((r) => r.id !== room.id));
    setDeleteRoom(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Admin Panel › Manage Rooms</p>
        <button
          id="add-room-btn"
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {/* Room grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            showAdmin
            onEdit={(r) => setEditRoom(r)}
            onDelete={(r) => setDeleteRoom(r)}
          />
        ))}
      </div>

      {/* Add Room Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Room"
        size="md"
      >
        <div className="space-y-4">
          {[
            { id: 'new-room-name', label: 'Room Name', type: 'text', placeholder: 'e.g. Conference Room G' },
            { id: 'new-room-capacity', label: 'Capacity', type: 'number', placeholder: '10' },
            { id: 'new-room-floor', label: 'Floor', type: 'number', placeholder: '1' },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                id={id}
                type={type}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Type</label>
            <select
              id="new-room-type"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['Conference Room', 'Meeting Room', 'Board Room', 'Training Room'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select
              id="new-room-status"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
            <div className="grid grid-cols-2 gap-2">
              {['Projector', 'Whiteboard', 'WiFi', 'Video Call', 'Air Condition'].map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setAddModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              id="save-new-room-btn"
              onClick={() => setAddModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              Add Room
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        open={!!editRoom}
        onClose={() => setEditRoom(null)}
        title={`Edit — ${editRoom?.name}`}
        size="md"
      >
        {editRoom && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Room Name</label>
              <input
                defaultValue={editRoom.name}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                defaultValue={editRoom.status}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_SERVICE'].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditRoom(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => setEditRoom(null)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteRoom}
        onClose={() => setDeleteRoom(null)}
        title="Delete Room"
        size="sm"
      >
        {deleteRoom && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-800">{deleteRoom.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteRoom(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button
                id={`confirm-delete-${deleteRoom.id}`}
                onClick={() => handleDelete(deleteRoom)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
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
