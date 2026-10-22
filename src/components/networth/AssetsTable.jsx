import { Plus, Pencil, Trash2, Home } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const ASSET_TYPES = {
  real_estate: 'Real estate',
  vehicle: 'Vehicle',
  jewelry: 'Jewelry',
  other: 'Other',
};

export default function AssetsTable({ assets, onAdd, onEdit, onDelete }) {
  const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.value || 0), 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Property and other assets</h2>
          <p className="text-xs text-gray-400 mt-0.5">Total: {formatCurrency(totalValue)}</p>
        </div>
        <button onClick={onAdd} className="btn-secondary flex items-center gap-1.5 text-sm">
          <Plus className="w-4 h-4" />
          <span>Add asset</span>
        </button>
      </div>

      {assets.length === 0 ? (
        <p className="text-sm text-gray-500 py-2">Add things your linked accounts don't cover, like a home or a car, to include them in your net worth.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="pb-3 text-left text-xs font-medium text-gray-500">Type</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500">Value</th>
                <th className="pb-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 pr-4">
                    <p className="text-sm font-medium text-gray-900">{asset.name}</p>
                    {asset.notes && (
                      <p className="text-xs text-gray-400 mt-0.5">{asset.notes}</p>
                    )}
                  </td>
                  <td className="py-3.5 pr-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-gray-100 text-gray-600">
                      {ASSET_TYPES[asset.type] || asset.type}
                    </span>
                  </td>
                  <td className="py-3.5 text-right text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(parseFloat(asset.value))}
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(asset)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        aria-label="Edit asset"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this asset?')) {
                            onDelete(asset.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete asset"
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
