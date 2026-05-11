import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { networthAPI } from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const ASSET_TYPES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'other', label: 'Other' },
];

const inputClass = 'w-full px-4 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent';

export default function AddAssetModal({ asset, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!asset;

  const [formData, setFormData] = useState({
    name: '',
    type: 'real_estate',
    value: '',
    notes: '',
  });

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name,
        type: asset.type,
        value: asset.value.toString(),
        notes: asset.notes || '',
      });
    }
  }, [asset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEditing ? networthAPI.updateAsset(asset.id, data) : networthAPI.addAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      queryClient.invalidateQueries(['networth-current']);
      toast.success(isEditing ? 'Asset updated!' : 'Asset added!');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save asset');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Please enter asset name');
    if (!formData.value || parseFloat(formData.value) <= 0) return toast.error('Please enter a valid value');
    mutation.mutate({
      name: formData.name.trim(),
      type: formData.type,
      value: parseFloat(formData.value),
      notes: formData.notes.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-gray-900">
            {isEditing ? 'Edit Asset' : 'Add Asset'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Asset Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Primary Residence"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={inputClass}
            >
              {ASSET_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Current Value *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="0.00"
                className={`${inputClass} pl-7`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional details..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              {mutation.isPending ? 'Saving...' : isEditing ? 'Update Asset' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
