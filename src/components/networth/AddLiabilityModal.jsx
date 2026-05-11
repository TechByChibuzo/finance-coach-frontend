import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { networthAPI } from '../../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const LIABILITY_TYPES = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto_loan', label: 'Auto Loan' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'other', label: 'Other' },
];

const inputClass = 'w-full px-4 py-2 border border-gray-200 rounded-lg text-sm transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent';

export default function AddLiabilityModal({ liability, onClose }) {
  const queryClient = useQueryClient();
  const isEditing = !!liability;

  const [formData, setFormData] = useState({
    name: '',
    type: 'mortgage',
    balance: '',
    interestRate: '',
    monthlyPayment: '',
    notes: '',
  });

  useEffect(() => {
    if (liability) {
      setFormData({
        name: liability.name,
        type: liability.type,
        balance: liability.balance.toString(),
        interestRate: liability.interestRate ? liability.interestRate.toString() : '',
        monthlyPayment: liability.monthlyPayment ? liability.monthlyPayment.toString() : '',
        notes: liability.notes || '',
      });
    }
  }, [liability]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEditing ? networthAPI.updateLiability(liability.id, data) : networthAPI.addLiability(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['liabilities']);
      queryClient.invalidateQueries(['networth-current']);
      toast.success(isEditing ? 'Liability updated!' : 'Liability added!');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save liability');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Please enter liability name');
    if (!formData.balance || parseFloat(formData.balance) <= 0) return toast.error('Please enter a valid balance');
    mutation.mutate({
      name: formData.name.trim(),
      type: formData.type,
      balance: parseFloat(formData.balance),
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : 0,
      monthlyPayment: formData.monthlyPayment ? parseFloat(formData.monthlyPayment) : 0,
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
            {isEditing ? 'Edit Liability' : 'Add Liability'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Liability Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Home Mortgage"
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
              {LIABILITY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Current Balance *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                placeholder="0.00"
                className={`${inputClass} pl-7`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Interest Rate (optional)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="0.00"
                className={`${inputClass} pr-8`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Monthly Payment (optional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.monthlyPayment}
                onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
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
              {mutation.isPending ? 'Saving...' : isEditing ? 'Update Liability' : 'Add Liability'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
