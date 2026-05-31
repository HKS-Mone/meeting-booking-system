'use client';

import {
  Building2, CheckCircle, Video, LayoutGrid,
  DoorOpen, Calendar, Users, BarChart2,
  LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

export type IconName =
  | 'Building2' | 'CheckCircle' | 'Video' | 'LayoutGrid'
  | 'DoorOpen' | 'Calendar' | 'Users' | 'BarChart2';

const ICON_MAP: Record<IconName, LucideIcon> = {
  Building2,
  CheckCircle,
  Video,
  LayoutGrid,
  DoorOpen,
  Calendar,
  Users,
  BarChart2,
};

interface StatsCardProps {
  title: string;
  value: number | string;
  iconName: IconName;
  iconColor: string;
  iconBg: string;
  linkText?: string;
  linkHref?: string;
  trend?: string;
}

export default function StatsCard({
  title,
  value,
  iconName,
  iconColor,
  iconBg,
  linkText = 'View all',
  linkHref = '#',
  trend,
}: StatsCardProps) {
  const Icon = ICON_MAP[iconName];
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1 leading-none">{value}</p>
        {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
        {linkHref && linkText && (
          <Link
            href={linkHref}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 mt-2 inline-block"
          >
            {linkText} →
          </Link>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
    </div>
  );
}
