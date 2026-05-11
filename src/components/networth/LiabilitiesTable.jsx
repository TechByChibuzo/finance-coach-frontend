import { Plus, Pencil, Trash2, CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const LIABILITY_TYPES = {
  mortgage: 'Mortgage',
  auto_loan: 'Auto Loan',
  student_loan: 'Student Loan',
  personal_loan: 'Personal Loan',
  other: 'Other',
};

export default function LiabilitiesTable({ liabilities, onAdd, onEdit, onDelete }) {
  const totalBalance = liabilities.reduce((sum, l) => sum + parseFloat(l.balance || 0), 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Liabilities</h2>
          <p className="text-xs text-gray-400 mt-0.5">Total: {formatCurrency(totalBalance)}</p>
        </div>
        <button onClick={onAdd} className="btn-secondary flex items-center gap-1.5 text-sm">
          <Plus className="w-4 h-4" />
          <span>Add Liability</span>
        </button>
      </div>

      {liabilities.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">No liabilities tracked</p>
          <p className="text-xs text-gray-400">Add loans, mortgages, or other debts</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Name</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Type</th>
                <th className="pb-3 pr-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Balance</th>
                <th className="pb-3 pr-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Rate</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Monthly</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wide">Actions</th>
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
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-red-50 text-red-700">
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
