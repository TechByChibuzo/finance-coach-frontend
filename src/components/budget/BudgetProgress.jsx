// src/components/budget/BudgetProgress.jsx

const BudgetProgress = ({ percentage, size = 'md', showLabel = false }) => {
  // Clamp percentage between 0 and 100 for display (can be > 100 in data)
  const displayPercentage = Math.min(percentage, 100);
  
  // Determine color based on percentage
  const getColorClasses = () => {
    if (percentage < 80) {
      return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
    } else if (percentage < 100) {
      return 'bg-gradient-to-r from-amber-400 to-amber-500';
    } else {
      return 'bg-gradient-to-r from-red-400 to-red-500';
    }
  };

  // Size variants
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getColorClasses()}`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
      
      {showLabel && (
        <div className="mt-1 flex justify-between items-center text-xs text-gray-600">
          <span>{percentage.toFixed(1)}% spent</span>
          {percentage > 100 && (
            <span className="text-red-600 font-medium">
              {(percentage - 100).toFixed(1)}% over
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;