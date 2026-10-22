import { differenceInCalendarDays, format, parseISO } from 'date-fns';

const PER_MONTH = { monthly: 1, quarterly: 1 / 3, yearly: 1 / 12 };

// What a charge costs per month on average, so different rhythms can be added up
export const monthlyCost = (r) => Number(r.amount) * (PER_MONTH[r.frequency] ?? 1);

export const frequencyLabel = (f) => ({ monthly: 'Every month', quarterly: 'Every 3 months', yearly: 'Every year' }[f] || f);

export function dueLabel(nextDate, today = new Date()) {
  const days = differenceInCalendarDays(parseISO(nextDate), today);
  if (days < 0) return 'Due now';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 14) return `In ${days} days`;
  return format(parseISO(nextDate), 'MMM d');
}
