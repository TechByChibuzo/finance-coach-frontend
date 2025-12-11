// src/components/budget/BudgetModal.jsx 
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function BudgetModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editBudget = null, 
  recommendationData = null, // NEW PROP
  currentMonth 
}) {
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    notes: '',
    alertThreshold: 80,
    month: currentMonth ? format(currentMonth, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing OR using recommendation
  useEffect(() => {
    if (editBudget) {
      // EDITING existing budget
      setFormData({
        category: editBudget.category,
        amount: editBudget.amount.toString(),
        notes: editBudget.notes || '',
        alertThreshold: editBudget.alertThreshold,
        month: editBudget.month,
      });
    } else if (recommendationData) {
      // USING recommendation
      setFormData({
        category: recommendationData.category,
        amount: recommendationData.amount.toString(),
        notes: '',
        alertThreshold: 80,
        month: currentMonth ? format(currentMonth, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      });
    } else if (currentMonth) {
      // NEW budget
      setFormData(prev => ({
        ...prev,
        month: format(currentMonth, 'yyyy-MM-dd'),
      }));
    }
  }, [editBudget, recommendationData, currentMonth]); // ADDED recommendationData dependency

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

  // Determine modal title
  const getModalTitle = () => {
    if (editBudget) return 'Edit Budget';
    if (recommendationData) return 'Create Budget from Recommendation';
    return 'Create Budget';
  };

  return (
    <>
      {/* Backdrop with fade-in */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in"
        onClick={onClose}
      >
        {/* Modal with slide-in-up animation */}
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto slide-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-2xl font-bold text-gray-900">
              {getModalTitle()}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors icon-hover"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Show recommendation info if present */}
          {recommendationData && (
            <div className="px-6 pt-4 pb-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>AI Recommendation:</strong> Based on your spending history, 
                  we suggest <strong>${recommendationData.amount.toFixed(2)}</strong> for{' '}
                  <strong>{recommendationData.category}</strong>
                </p>
              </div>
            </div>
          )}

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
                className={`
                  w-full px-4 py-2 border rounded-lg 
                  focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  transition-all duration-200
                  ${errors.category ? 'border-red-500' : 'border-gray-300'}
                `}
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
                <p className="mt-1 text-sm text-red-600 fade-in">{errors.category}</p>
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
                  className={`
                    w-full pl-8 pr-4 py-2 border rounded-lg 
                    focus:ring-2 focus:ring-primary-500 focus:border-transparent
                    transition-all duration-200
                    ${errors.amount ? 'border-red-500' : 'border-gray-300'}
                  `}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600 fade-in">{errors.amount}</p>
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
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                {editBudget ? 'Update Budget' : 'Create Budget'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}