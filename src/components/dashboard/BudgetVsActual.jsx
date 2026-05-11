import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCurrentBudgets } from '../../hooks/useBudgets';
import { formatCurrency, formatCurrencyCompact } from '../../utils/helpers';
import Skeleton from '../common/Skeleton';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const difference = data.actual - data.budgeted;
  const isOver = difference > 0;

  return (
    <div className="bg-white rounded-lg shadow-xl ring-1 ring-gray-900/5 p-3 min-w-40">
      <p className="text-xs font-semibold text-gray-900 mb-2">{data.fullCategory}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Budgeted</span>
          <span className="font-medium text-primary-600">{formatCurrency(data.budgeted)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Actual</span>
          <span className={`font-medium ${isOver ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(data.actual)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-gray-100">
          <span className="text-gray-400">Difference</span>
          <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-green-600'}`}>
            {isOver ? '+' : ''}{formatCurrency(Math.abs(difference))}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">Usage</span>
          <span className="font-medium text-gray-900">{data.percentage.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

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

export default function BudgetVsActual() {
  const { data: budgetData, isLoading, error } = useCurrentBudgets();

  if (isLoading) {
    return (
      <div className="card">
        <div className="space-y-2 mb-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !budgetData?.budgets || budgetData.budgets.length === 0) {
    return null;
  }

  const chartData = budgetData.budgets
    .map(budget => {
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

  const exceededCount = chartData.filter(d => d.exceeded).length;
  const warningCount = chartData.filter(d => d.isWarning).length;
  const onTrackCount = chartData.filter(d => !d.exceeded && !d.isWarning).length;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Budget vs Actual</h2>
          <p className="text-xs text-gray-400 mt-0.5">Current month spending comparison</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {exceededCount > 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
              <AlertCircle className="w-3 h-3" />
              <span>{exceededCount} over budget</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>{warningCount} near limit</span>
            </div>
          )}
          {onTrackCount > 0 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>{onTrackCount} on track</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 8, left: 50, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="category"
              angle={-35}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tickFormatter={(v) => formatCurrencyCompact(v)}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />

            <Bar dataKey="budgeted" name="Budgeted" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={52}>
              <LabelList content={renderCustomLabel} />
            </Bar>

            <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]} maxBarSize={52} minPointSize={4}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.exceeded ? '#ef4444' : entry.isWarning ? '#f59e0b' : '#10b981'}
                />
              ))}
              <LabelList content={renderCustomLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary-600" />
            <span>Budgeted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>On track (&lt;80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span>Near limit (80–100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>Over budget</span>
          </div>
        </div>
      </div>
    </div>
  );
}
