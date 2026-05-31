'use client';

interface CalendarEventChipProps {
  title: string;
  colorClass: string;
  onClick?: () => void;
}

export default function CalendarEventChip({ title, colorClass, onClick }: CalendarEventChipProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left text-[10px] text-white font-medium px-1.5 py-0.5 rounded truncate ${colorClass} hover:opacity-90 transition-opacity mt-0.5`}
    >
      {title}
    </button>
  );
}
