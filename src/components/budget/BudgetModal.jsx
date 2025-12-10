// src/components/budget/BudgetModal.jsx
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const BudgetModal = ({ isOpen, onClose, onSubmit, editBudget = null, currentMonth }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    notes: '',
    alertThreshold: 80,
    month: currentMonth ? format(currentMonth, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (editBudget) {
      setFormData({
        category: editBudget.category,
        amount: editBudget.amount.toString(),
        notes: editBudget.notes || '',
        alertThreshold: editBudget.alertThreshold,
        month: editBudget.month,
      });
    } else if (currentMonth) {
      setFormData(prev => ({
        ...prev,
        month: format(currentMonth, 'yyyy-MM-dd'),
      }));
    }
  }, [editBudget, currentMonth]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        category: '',
        amount: '',
        notes: '',
        alertThreshold: 80,
        month: currentMonth ? format(currentMonth, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      });
      setErrors({});
    }
  }, [isOpen, currentMonth]);

  const categories = [
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const budgetData = {
      category: formData.category,
      amount: parseFloat(formData.amount),
      notes: formData.notes || null,
      alertThreshold: formData.alertThreshold,
      month: formData.month,
    };

    onSubmit(budgetData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editBudget ? 'Edit Budget' : 'Create Budget'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!!editBudget} // Can't change category when editing
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="500.00"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Alert Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert at {formData.alertThreshold}% of budget
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={formData.alertThreshold}
              onChange={(e) => handleChange('alertThreshold', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Groceries, dining out, etc."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {editBudget ? 'Update Budget' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
