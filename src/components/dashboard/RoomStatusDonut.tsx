'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DonutData {
  name: string;
  value: number;
  color: string;
}

interface RoomStatusDonutProps {
  available: number;
  occupied: number;
  maintenance: number;
  outOfService: number;
  total: number;
}

export default function RoomStatusDonut({
  available,
  occupied,
  maintenance,
  outOfService,
  total,
}: RoomStatusDonutProps) {
  const data: DonutData[] = [
    { name: 'Available', value: available, color: '#16a34a' },
    { name: 'Occupied', value: occupied, color: '#d97706' },
    { name: 'Maintenance', value: maintenance, color: '#ca8a04' },
    { name: 'Out of Service', value: outOfService, color: '#dc2626' },
  ].filter((d) => d.value > 0);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (active && payload && payload.length) {
      const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(0) : 0;
      return (
        <div className="bg-white shadow-lg rounded-lg px-3 py-2 text-sm border border-gray-100">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-gray-600">
            {payload[0].value} rooms ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = () => (
    <div className="mt-4 space-y-2">
      {data.map((entry) => {
        const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
        return (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}</span>
            </div>
            <span className="font-medium text-gray-800 tabular-nums">
              {entry.value} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Room Status Overview</h3>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Centre label */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-900"
              style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
            >
              {total}
            </text>
            <text
              x="50%"
              y="50%"
              dy={22}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: 11, fill: '#6b7280', fontFamily: 'Inter, sans-serif' }}
            >
              Total Rooms
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {renderLegend()}
    </div>
  );
}
