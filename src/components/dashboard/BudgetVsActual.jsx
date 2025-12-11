// src/components/dashboard/BudgetVsActual.jsx - FIXED LAYOUT
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useCurrentBudgets } from '../../hooks/useBudgets';
import Skeleton from '../common/Skeleton';

export default function BudgetVsActual() {
  const { data: budgetData, isLoading, error } = useCurrentBudgets();

  if (isLoading) {
    return (
      <div className="card">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !budgetData?.budgets || budgetData.budgets.length === 0) {
    return null;
  }

  // Prepare chart data
  const chartData = budgetData.budgets
    .map(budget => {
      // Shorten long category names for better display
      let shortName = budget.category;
      if (shortName === 'Food & Dining') shortName = 'Food';
      if (shortName === 'Bills & Utilities') shortName = 'Bills';
      if (shortName === 'Personal Care') shortName = 'Personal';
      
      return {
        category: shortName,
        fullCategory: budget.category, // Keep full name for tooltip
        budgeted: budget.amount,
        actual: budget.spent,
        percentage: budget.percentageSpent,
        exceeded: budget.isExceeded,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const difference = data.actual - data.budgeted;
    const isOver = difference > 0;

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900 mb-2">{data.fullCategory}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Budgeted:</span>
            <span className="font-medium text-blue-600">${data.budgeted.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Actual:</span>
            <span className={`font-medium ${isOver ? 'text-red-600' : 'text-gray-900'}`}>
              ${data.actual.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
            <span className="text-gray-600">Difference:</span>
            <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
              {isOver ? '+' : ''}${Math.abs(difference).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Usage:</span>
            <span className="font-medium">{data.percentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
  };

  // Format Y-axis values with $ and commas
  const formatYAxis = (value) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value}`;
  };

  // Calculate summary stats
  const exceededCount = chartData.filter(d => d.exceeded).length;
  const warningCount = chartData.filter(d => d.percentage >= 80 && !d.exceeded).length;
  const onTrackCount = chartData.filter(d => d.percentage < 80).length;

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Budget vs Actual
          </h2>
          <p className="text-sm text-gray-500 mt-1">Current month spending comparison</p>
        </div>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {exceededCount > 0 && (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>{exceededCount} over budget</span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>{warningCount} near limit</span>
          </div>
        )}
        {onTrackCount > 0 && (
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
            <span>✓</span>
            <span>{onTrackCount} on track</span>
          </div>
        )}
      </div>

      {/* Chart - FIXED MARGINS */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 60, bottom: 80 }} // INCREASED left and bottom margins
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            
            {/* X-axis - FIXED ANGLE */}
            <XAxis
              dataKey="category"
              angle={-35} // CHANGED from -45 for better readability
              textAnchor="end"
              height={100} // INCREASED height
              interval={0} // Show all labels
              tick={{ fontSize: 11, fill: '#666' }}
              stroke="#999"
            />
            
            {/* Y-axis - FIXED FORMATTING */}
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: '#666' }}
              stroke="#999"
              width={50} // FIXED width to accommodate label
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="rect"
              iconSize={12}
            />
            
            {/* Budgeted amounts - always blue */}
            <Bar
              dataKey="budgeted"
              name="Budgeted"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
            
            {/* Actual amounts - color coded by status */}
            <Bar
              dataKey="actual"
              name="Actual"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            >
              {chartData.map((entry, index) => {
                let color;
                if (entry.exceeded) {
                  color = '#ef4444'; // red-500
                } else if (entry.percentage >= 80) {
                  color = '#f59e0b'; // amber-500
                } else {
                  color = '#10b981'; // emerald-500
                }
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend explanation */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Budgeted amount</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span>On track (&lt;80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span>Near limit (80-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Over budget (&gt;100%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}