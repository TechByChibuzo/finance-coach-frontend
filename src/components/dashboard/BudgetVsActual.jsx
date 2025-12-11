// src/components/dashboard/BudgetVsActual.jsx - FIXED VERSION
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useCurrentBudgets } from '../../hooks/useBudgets';
import { formatCurrency, formatCurrencyCompact } from '../../utils/helpers';
import Skeleton from '../common/Skeleton';

export default function BudgetVsActual() {
  const { data: budgetData, isLoading, error } = useCurrentBudgets();

  if (isLoading) {
    return (
      <div className="card">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !budgetData?.budgets || budgetData.budgets.length === 0) {
    return null;
  }

  // Prepare chart data
  const chartData = budgetData.budgets
    .map(budget => {
      // Shorten long category names for chart
      let shortName = budget.category;
      if (shortName === 'Food & Dining') shortName = 'Food';
      if (shortName === 'Bills & Utilities') shortName = 'Bills';
      if (shortName === 'Personal Care') shortName = 'Personal';
      
      return {
        category: shortName,
        fullCategory: budget.category,
        budgeted: budget.amount,
        actual: budget.spent,
        percentage: budget.percentageSpent,
        exceeded: budget.isExceeded,
        isWarning: budget.percentageSpent >= 80 && !budget.isExceeded,
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
            <span className="font-medium text-blue-600">{formatCurrency(data.budgeted)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Actual:</span>
            <span className={`font-medium ${isOver ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(data.actual)}
            </span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-gray-200">
            <span className="text-gray-600">Difference:</span>
            <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
              {isOver ? '+' : ''}{formatCurrency(Math.abs(difference))}
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

  // Format Y-axis
  const formatYAxis = (value) => {
    return formatCurrencyCompact(value).replace('k', 'K').replace('m', 'M');
  };

  // Custom label for bars
  const renderCustomLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (height < 30) return null;
    
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fontWeight="600"
      >
        {formatCurrencyCompact(value).replace('k', 'K')}
      </text>
    );
  };

  // Calculate summary stats
  const exceededCount = chartData.filter(d => d.exceeded).length;
  const warningCount = chartData.filter(d => d.isWarning).length;
  const onTrackCount = chartData.filter(d => !d.exceeded && !d.isWarning).length;

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
      <div className="flex flex-wrap gap-2 mb-6">
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

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 60, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            
            <XAxis
              dataKey="category"
              angle={-35}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 11, fill: '#666' }}
              stroke="#999"
            />
            
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 11, fill: '#666' }}
              stroke="#999"
              width={60}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="rect"
              iconSize={12}
            />
            
            {/* Budgeted */}
            <Bar
              dataKey="budgeted"
              name="Budgeted"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            >
              <LabelList content={renderCustomLabel} />
            </Bar>
            
            {/* Actual */}
            <Bar
              dataKey="actual"
              name="Actual"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
              minPointSize={5}
            >
              {chartData.map((entry, index) => {
                let color = entry.exceeded ? '#ef4444' : entry.isWarning ? '#f59e0b' : '#10b981';
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
              <LabelList content={renderCustomLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
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