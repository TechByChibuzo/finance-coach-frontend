
// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Get category color
export const getCategoryColor = (category) => {
  const colors = {
    'FOOD_AND_DRINK': 'bg-orange-100 text-orange-800',
    'TRANSPORTATION': 'bg-blue-100 text-blue-800',
    'ENTERTAINMENT': 'bg-purple-100 text-purple-800',
    'SHOPPING': 'bg-pink-100 text-pink-800',
    'TRAVEL': 'bg-green-100 text-green-800',
    'GENERAL_MERCHANDISE': 'bg-red-100 text-red-800',
    'RENT_AND_UTILITIES': 'bg-cyan-100 text-cyan-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};