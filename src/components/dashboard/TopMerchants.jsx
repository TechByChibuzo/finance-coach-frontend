export default function TopMerchants({ merchants }) {
  const merchantsList = Object.entries(merchants || {})
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Top Merchants</h2>
      
      {merchantsList.length > 0 ? (
        <div className="space-y-4">
          {merchantsList.map((merchant, index) => (
            <div key={merchant.name}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center h-8 w-8 bg-primary-100 rounded-full text-primary-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{merchant.name}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  ${merchant.amount.toFixed(2)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(merchant.amount / merchantsList[0].amount) * 100}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No merchant data yet</p>
      )}
    </div>
  );
}