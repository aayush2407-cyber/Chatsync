export type DeadlineCategory = 'overdue' | 'under-24h' | '1-to-3d' | 'later' | 'done' | 'none';

export interface DeadlineBadgeInfo {
  category: DeadlineCategory;
  label: string;
  badgeClass: string;
  iconColor: string;
}

/**
 * Calculates human readable deadline text & badge styling:
 * - Overdue: red, "Overdue by 2 days"
 * - Due in under 24 hours: orange, "Due in 5 hours"
 * - Due in 1 to 3 days: yellow, "Due in 2 days"
 * - Later: green, "Due Mar 20"
 * - Done items: grey
 */
export function getDeadlineBadgeInfo(
  deadline: string | null | undefined,
  done: boolean = false
): DeadlineBadgeInfo {
  if (done) {
    return {
      category: 'done',
      label: 'Done',
      badgeClass:
        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
      iconColor: 'text-slate-400',
    };
  }

  if (!deadline) {
    return {
      category: 'none',
      label: 'No deadline',
      badgeClass:
        'bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800',
      iconColor: 'text-slate-400',
    };
  }

  const deadlineDate = new Date(deadline);
  if (isNaN(deadlineDate.getTime())) {
    return {
      category: 'none',
      label: 'Invalid date',
      badgeClass:
        'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200',
      iconColor: 'text-slate-400',
    };
  }

  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Overdue: past due
  if (diffMs < 0) {
    const overdueHours = Math.abs(diffHours);
    const overdueDays = Math.floor(overdueHours / 24);
    let label = 'Overdue';

    if (overdueDays >= 1) {
      label = `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`;
    } else {
      const hours = Math.max(1, Math.floor(overdueHours));
      label = `Overdue by ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }

    return {
      category: 'overdue',
      label,
      badgeClass:
        'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-semibold',
      iconColor: 'text-rose-600 dark:text-rose-400',
    };
  }

  // Due in under 24 hours: orange
  if (diffHours < 24) {
    const hours = Math.floor(diffHours);
    let label = 'Due in 1 hour';
    if (hours < 1) {
      const minutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      label = `Due in ${minutes} mins`;
    } else {
      label = `Due in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }

    return {
      category: 'under-24h',
      label,
      badgeClass:
        'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-semibold',
      iconColor: 'text-amber-600 dark:text-amber-400',
    };
  }

  // Due in 1 to 3 days: yellow
  if (diffHours <= 72) {
    const days = Math.round(diffHours / 24);
    const label = `Due in ${days} ${days === 1 ? 'day' : 'days'}`;

    return {
      category: '1-to-3d',
      label,
      badgeClass:
        'bg-yellow-50 dark:bg-yellow-950/70 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700/60 font-medium',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    };
  }

  // Later: green, "Due Mar 20"
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = monthNames[deadlineDate.getMonth()];
  const day = deadlineDate.getDate();
  const label = `Due ${month} ${day}`;

  return {
    category: 'later',
    label,
    badgeClass:
      'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  };
}

/**
 * Checks if an item is overdue (and not done)
 */
export function isItemOverdue(deadline: string | null | undefined, done: boolean): boolean {
  if (done || !deadline) return false;
  const d = new Date(deadline);
  return !isNaN(d.getTime()) && d.getTime() < Date.now();
}

/**
 * Checks if an item is due within 24 hours (and not yet overdue and not done)
 */
export function isItemDueUnder24h(deadline: string | null | undefined, done: boolean): boolean {
  if (done || !deadline) return false;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return false;
  const diff = d.getTime() - Date.now();
  return diff >= 0 && diff < 24 * 60 * 60 * 1000;
}

/**
 * Checks if an item needs attention today (overdue or due within 24h, not done)
 */
export function needsAttentionToday(deadline: string | null | undefined, done: boolean): boolean {
  return isItemOverdue(deadline, done) || isItemDueUnder24h(deadline, done);
}

/**
 * Checks if an item deadline is this week (next 7 days, including overdue)
 */
export function isDueThisWeek(deadline: string | null | undefined, done: boolean): boolean {
  if (done || !deadline) return false;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return false;
  const diff = d.getTime() - Date.now();
  // Within next 7 days or recently overdue (< 2 days)
  return diff > -2 * 86400000 && diff <= 7 * 86400000;
}

/**
 * Calculates reminder trigger timestamp given an ISO deadline and offset
 */
export function getReminderTriggerTime(
  deadline: string | null | undefined,
  offset: '1d' | '3h' | '1h' | 'none'
): Date | null {
  if (!deadline || offset === 'none') return null;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;

  let offsetMs = 0;
  if (offset === '1d') offsetMs = 24 * 60 * 60 * 1000;
  else if (offset === '3h') offsetMs = 3 * 60 * 60 * 1000;
  else if (offset === '1h') offsetMs = 60 * 60 * 1000;

  return new Date(d.getTime() - offsetMs);
}

/**
 * Formats deadline / start time for in-chat detected item tags:
 * e.g. "due Fri, Oct 16", "due today", "at 4:00 PM"
 */
export function formatItemTagDeadline(deadlineOrStartTime: string | null | undefined, isMeeting = false): string {
  if (!deadlineOrStartTime) return '';
  const d = new Date(deadlineOrStartTime);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();

  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (isMeeting) {
    if (isToday) return `today ${timeStr}`;
    if (isTomorrow) return `tomorrow ${timeStr}`;
    return `${weekday}, ${timeStr}`;
  }

  if (isToday) return 'due today';
  if (isTomorrow) return 'due tomorrow';
  return `due ${weekday}, ${monthDay}`;
}
