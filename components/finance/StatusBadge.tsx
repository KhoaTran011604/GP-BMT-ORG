'use client';

import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
  variant?: 'default' | 'sm';
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const config = {
    pending: {
      label: 'Chờ duyệt',
      color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      icon: Clock
    },
    approved: {
      label: 'Đã duyệt',
      color: 'bg-green-100 text-green-800 hover:bg-green-100',
      icon: CheckCircle
    },
    rejected: {
      label: 'Từ chối',
      color: 'bg-red-100 text-red-800 hover:bg-red-100',
      icon: XCircle
    }
  };

  const { label, color, icon: Icon } = config[status];
  const iconSize = variant === 'sm' ? 12 : 14;

  return (
    <Badge
      className={`${color} ${variant === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}
      variant="outline"
    >
      <Icon size={iconSize} className="mr-1" />
      {label}
    </Badge>
  );
}
