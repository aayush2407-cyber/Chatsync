import React from 'react';
import { Clock, AlertTriangle, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { getDeadlineBadgeInfo, DeadlineCategory } from '../utils/deadlines';

interface DeadlineBadgeProps {
  deadline: string | null | undefined;
  done?: boolean;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({
  deadline,
  done = false,
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const { category, label, badgeClass, iconColor } = getDeadlineBadgeInfo(deadline, done);

  const getIcon = (cat: DeadlineCategory) => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';
    switch (cat) {
      case 'overdue':
        return <AlertTriangle className={`${iconSize} ${iconColor} shrink-0 animate-pulse`} />;
      case 'under-24h':
        return <AlertCircle className={`${iconSize} ${iconColor} shrink-0`} />;
      case 'done':
        return <CheckCircle2 className={`${iconSize} ${iconColor} shrink-0`} />;
      case '1-to-3d':
        return <Clock className={`${iconSize} ${iconColor} shrink-0`} />;
      case 'later':
      default:
        return <Calendar className={`${iconSize} ${iconColor} shrink-0`} />;
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] gap-1.5'
      : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-lg ${sizeClasses} ${badgeClass} ${className} transition-colors tracking-tight`}
      title={deadline ? new Date(deadline).toLocaleString() : 'No deadline set'}
    >
      {showIcon && getIcon(category)}
      <span>{label}</span>
    </span>
  );
};
