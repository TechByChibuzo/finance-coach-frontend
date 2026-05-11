import { PiggyBank, Plus, Sparkles, BarChart3, Target, Lightbulb } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Track Spending',
    description: 'See exactly where your money goes',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Target,
    title: 'Stay On Track',
    description: 'Get alerts before you overspend',
    bgColor: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  {
    icon: Lightbulb,
    title: 'AI Insights',
    description: 'Get personalized recommendations',
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
];

export default function EmptyState({ onCreateBudget, onGetRecommendations }) {
  return (
    <div className="card text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-5">
          <PiggyBank className="w-8 h-8 text-primary-600" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">No budgets yet</h2>
        <p className="text-sm text-gray-500 mb-7 leading-relaxed">
          Create your first budget to track spending and reach your financial goals.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <button
            onClick={onCreateBudget}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Budget
          </button>
          <button
            onClick={onGetRecommendations}
            className="btn-secondary inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Get Recommendations
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="p-4 border border-gray-100 rounded-xl">
                <div className={`w-9 h-9 ${feature.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${feature.iconColor}`} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
