import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const LIABILITY_TYPES = {
  mortgage: 'Mortgage',
  auto_loan: 'Auto loan',
  student_loan: 'Student loan',
  personal_loan: 'Personal loan',
  other: 'Other',
};

export default function LiabilitiesTable({ liabilities, onAdd, onEdit, onDelete }) {
  const totalBalance = liabilities.reduce((sum, l) => sum + parseFloat(l.balance || 0), 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Other debts</h2>
          <p className="text-xs text-gray-400 mt-0.5">Total: {formatCurrency(totalBalance)}</p>
        </div>
        <button onClick={onAdd} className="btn-secondary flex items-center gap-1.5 text-sm">
          <Plus className="w-4 h-4" />
          <span>Add debt</span>
        </button>
      </div>

      {liabilities.length === 0 ? (
        <p className="text-sm text-gray-500 py-2">Linked loans and cards are counted automatically. Add any other debts, like a personal loan from family.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-500">Type</th>
                <th className="pb-3 pr-4 text-right text-xs font-medium text-gray-500">Balance</th>
                <th className="pb-3 pr-4 text-right text-xs font-medium text-gray-500">Rate</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500">Monthly</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {liabilities.map((liability) => (
                <tr key={liability.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 pr-4">
                    <p className="text-sm font-medium text-gray-900">{liability.name}</p>
                    {liability.notes && (
                      <p className="text-xs text-gray-400 mt-0.5">{liability.notes}</p>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 text-gray-600">
                      {LIABILITY_TYPES[liability.type] || liability.type}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(parseFloat(liability.balance))}
                  </td>
                  <td className="py-3.5 pr-4 text-right text-sm text-gray-600 whitespace-nowrap">
                    {liability.interestRate ? `${parseFloat(liability.interestRate).toFixed(2)}%` : '—'}
                  </td>
                  <td className="py-3.5 text-right text-sm text-gray-600 whitespace-nowrap">
                    {liability.monthlyPayment ? formatCurrency(parseFloat(liability.monthlyPayment)) : '—'}
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(liability)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        aria-label="Edit liability"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this liability?')) {
                            onDelete(liability.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete liability"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
