import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';
import { formatCurrency, formatCurrencyCompact } from '../../utils/helpers';

const PERIODS = [
  { label: '7D', value: 7 },
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1Y', value: 365 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-xl ring-1 ring-gray-900/5 p-3 min-w-44">
      <p className="text-xs text-gray-500 mb-2">{format(new Date(label), 'MMMM d, yyyy')}</p>
      <div className="space-y-1 text-xs">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex justify-between gap-4">
            <span className="text-gray-400">{entry.name}</span>
            <span className="font-medium" style={{ color: entry.color }}>
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function NetWorthChart({ history, selectedPeriod, onPeriodChange }) {
  if (!history || history.length === 0) {
    return (
      <div className="card">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Net Worth Trend</h2>
        <div className="h-72 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">No historical data yet</p>
            <p className="text-xs text-gray-400">Check back after the first snapshot</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = history.map(snapshot => ({
    date: snapshot.date,
    assets: parseFloat(snapshot.totalAssets) || 0,
    liabilities: parseFloat(snapshot.totalLiabilities) || 0,
    netWorth: parseFloat(snapshot.netWorth) || 0,
  }));

  const firstNetWorth = chartData[0]?.netWorth || 0;
  const lastNetWorth = chartData[chartData.length - 1]?.netWorth || 0;
  const growth = lastNetWorth - firstNetWorth;
  const growthPercent = firstNetWorth > 0 ? (growth / firstNetWorth) * 100 : 0;
  const isPositive = growth >= 0;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Net Worth Trend</h2>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatCurrency(Math.abs(growth))}
            </span>
            <span className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              ({isPositive ? '+' : ''}{growthPercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        <div className="flex gap-0.5 bg-gray-100 rounded-lg p-1">
          {PERIODS.map((period) => (
            <button
              key={period.value}
              onClick={() => onPeriodChange(period.value)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedPeriod === period.value
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCurrencyCompact(v)}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="#0284c7"
              strokeWidth={2.5}
              name="Net Worth"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: '#0284c7' }}
            />
            <Line
              type="monotone"
              dataKey="assets"
              stroke="#10b981"
              strokeWidth={1.5}
              name="Assets"
              dot={false}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="liabilities"
              stroke="#ef4444"
              strokeWidth={1.5}
              name="Liabilities"
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-primary-600 rounded" />
            <span>Net Worth</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-emerald-500 rounded" style={{ borderTop: '1.5px dashed #10b981', height: 0 }} />
            <span>Assets</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-red-500 rounded" style={{ borderTop: '1.5px dashed #ef4444', height: 0 }} />
            <span>Liabilities</span>
          </div>
        </div>
      </div>
    </div>
  );
}
