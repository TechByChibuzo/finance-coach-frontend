import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

export default function CategoryBreakdown({ data }) {
  // Transform data for pie chart
  const chartData = Object.entries(data || {}).map(([category, amount]) => ({
    name: category.replace(/_/g, ' '),
    value: amount,
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Spending by Category</h2>
      
      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}  // Turn off labels
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Legend />  // Add this line
            </PieChart>
          </ResponsiveContainer>

          {/* Category List */}
          <div className="mt-6 space-y-2">
            {chartData.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ${category.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center py-8">No spending data yet</p>
      )}
    </div>
  );
}