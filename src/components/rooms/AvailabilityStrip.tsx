'use client';

interface SlotItem {
  hour: number;
  booked: boolean;
}

interface AvailabilityStripProps {
  slots: SlotItem[];
}

export default function AvailabilityStrip({ slots }: AvailabilityStripProps) {
  return (
    <div>
      <div className="flex gap-1 flex-wrap">
        {slots.map(({ hour, booked }) => {
          const label = `${String(hour).padStart(2, '0')}:00`;
          return (
            <div key={hour} className="flex flex-col items-center">
              <div
                className={`
                  w-14 h-8 rounded-md flex items-center justify-center text-[10px] font-semibold
                  ${booked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
                `}
                title={booked ? `${label} – Booked` : `${label} – Available`}
              >
                {label}
              </div>
              <span className={`text-[9px] mt-0.5 ${booked ? 'text-red-500' : 'text-green-600'}`}>
                {booked ? 'Booked' : 'Free'}
              </span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-300" />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
          Booked
        </div>
      </div>
    </div>
  );
}
