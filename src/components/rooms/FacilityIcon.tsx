'use client';

import { Monitor, PenLine, Wifi, Video, Wind } from 'lucide-react';

interface FacilityIconProps {
  name: string;
  size?: 'sm' | 'md';
}

const FACILITY_ICONS: Record<string, React.ElementType> = {
  Projector: Monitor,
  Whiteboard: PenLine,
  WiFi: Wifi,
  'Video Call': Video,
  'Air Condition': Wind,
};

export default function FacilityIcon({ name, size = 'md' }: FacilityIconProps) {
  const Icon = FACILITY_ICONS[name];
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  const containerSz = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${containerSz} rounded-xl bg-blue-50 flex items-center justify-center`}>
        {Icon ? (
          <Icon className={`${sz} text-blue-600`} />
        ) : (
          <span className="text-xs text-blue-600 font-semibold">{name[0]}</span>
        )}
      </div>
      <span className="text-[10px] text-gray-500 text-center leading-tight">{name}</span>
    </div>
  );
}
