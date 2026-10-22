import { formatPercentage } from '../../utils/helpers';

const sizeClasses = { sm: 'h-1.5', md: 'h-2', lg: 'h-2.5' };

function getBarColor(percentage) {
  if (percentage < 80) return 'bg-primary-600';
  if (percentage <= 100) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function BudgetProgress({ percentage, size = 'md', showLabel = false }) {
  const displayPercentage = Math.min(percentage, 100);

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(percentage)}`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>

      {showLabel && (
        <div className="mt-1 flex justify-between items-center text-xs text-gray-400">
          <span>{formatPercentage(percentage)} spent</span>
          {percentage > 100 && (
            <span className="text-red-600 font-medium">
              {formatPercentage(percentage - 100)} over
            </span>
          )}
        </div>
      )}
    </div>
  );
}
