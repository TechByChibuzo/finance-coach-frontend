import { X, Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/helpers';

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Travel',
  'Personal Care',
  'Bills & Utilities',
  'Healthcare',
  'Home',
  'Other',
];

const inputClass = (hasError) =>
  `w-full px-4 py-2 border rounded-lg text-sm transition-all duration-200 ${
    hasError ? 'border-red-400' : 'border-gray-200'
  }`;

export default function BudgetModal({
  isOpen,
  onClose,
  onSubmit,
  editBudget = null,
  recommendationData = null,
  currentMonth,
}) {
  const defaultMonth = currentMonth
    ? format(currentMonth, 'yyyy-MM-dd')
    : format(new Date(), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    notes: '',
    alertThreshold: 80,
    month: defaultMonth,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editBudget) {
      setFormData({
        category: editBudget.category,
        amount: editBudget.amount.toString(),
        notes: editBudget.notes || '',
        alertThreshold: editBudget.alertThreshold,
        month: editBudget.month,
      });
    } else if (recommendationData) {
      setFormData({
        category: recommendationData.category,
        amount: recommendationData.amount.toString(),
        notes: '',
        alertThreshold: 80,
        month: defaultMonth,
      });
    } else if (currentMonth) {
      setFormData(prev => ({ ...prev, month: defaultMonth }));
    }
  }, [editBudget, recommendationData, currentMonth]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ category: '', amount: '', notes: '', alertThreshold: 80, month: defaultMonth });
      setErrors({});
    }
  }, [isOpen, currentMonth]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Amount must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      category: formData.category,
      amount: parseFloat(formData.amount),
      notes: formData.notes || null,
      alertThreshold: formData.alertThreshold,
      month: formData.month,
    });
  };

  if (!isOpen) return null;

  const title = editBudget ? 'Edit Budget' : recommendationData ? 'Create from Recommendation' : 'Create Budget';

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
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {recommendationData && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-start gap-2.5 bg-primary-50 border border-primary-100 rounded-lg p-3">
              <Lightbulb className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
              <p className="text-xs text-primary-800">
                <strong>AI Recommendation:</strong> Based on your spending history, we suggest{' '}
                <strong>{formatCurrency(recommendationData.amount)}</strong> for{' '}
                <strong>{recommendationData.category}</strong>
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={inputClass(errors.category)}
              disabled={!!editBudget}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="500.00"
                className={`${inputClass(errors.amount)} pl-7`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Alert at {formData.alertThreshold}% of budget
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={formData.alertThreshold}
              onChange={(e) => handleChange('alertThreshold', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Groceries, dining out, etc."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              {editBudget ? 'Update Budget' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
