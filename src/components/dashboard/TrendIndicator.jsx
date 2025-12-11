// src/components/dashboard/TrendIndicator.jsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function TrendIndicator({ current, previous, type = 'spending' }) {
  // Handle null/undefined values
  if (current == null || previous == null || previous === 0) {
    return null;
  }

  const change = current - previous;
  const percentChange = ((change / previous) * 100).toFixed(1);
  const isPositive = change > 0;
  const isNeutral = Math.abs(percentChange) < 1;

  // Determine color based on type and direction
  let colorClass, bgClass, Icon;
  
  if (isNeutral) {
    colorClass = 'text-gray-600';
    bgClass = 'bg-gray-100';
    Icon = Minus;
  } else if (type === 'spending') {
    // For spending: up is bad (red), down is good (green)
    colorClass = isPositive ? 'text-red-600' : 'text-green-600';
    bgClass = isPositive ? 'bg-red-50' : 'bg-green-50';
    Icon = isPositive ? TrendingUp : TrendingDown;
  } else if (type === 'income') {
    // For income: up is good (green), down is bad (red)
    colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    bgClass = isPositive ? 'bg-green-50' : 'bg-red-50';
    Icon = isPositive ? TrendingUp : TrendingDown;
  } else {
    // For neutral metrics (like net cash flow)
    colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    bgClass = isPositive ? 'bg-green-50' : 'bg-red-50';
    Icon = isPositive ? TrendingUp : TrendingDown;
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${bgClass} ${colorClass} text-xs font-medium`}>
      <Icon className="w-3 h-3" />
      <span>{isNeutral ? '~0' : Math.abs(percentChange)}%</span>
      <span className="text-gray-600 font-normal">vs last month</span>
    </div>
  );
}