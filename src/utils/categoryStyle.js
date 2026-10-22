// Icon and colour for each category, shared by the category icon components
import {
  Utensils,        // Food & Dining
  Car,             // Transportation
  ShoppingBag,     // Shopping
  Ticket,          // Entertainment
  Plane,           // Travel
  Sparkles,        // Personal Care
  Receipt,         // Bills & Utilities
  Heart,           // Healthcare
  Home,            // Home
  Wallet,          // Other
  DollarSign,      // Income
  TrendingUp,      // Transfer In
  TrendingDown,    // Transfer Out
  Building2,       // General Merchandise
} from 'lucide-react';

/**
 * Get icon component for a category
 * @param {string} category - Category name
 * @returns {Component} Lucide icon component
 */
export const getCategoryIcon = (category) => {
  const iconMap = {
    // Budget categories (user-friendly names)
    'Food & Dining': Utensils,
    'Transportation': Car,
    'Shopping': ShoppingBag,
    'Entertainment': Ticket,
    'Travel': Plane,
    'Personal Care': Sparkles,
    'Bills & Utilities': Receipt,
    'Healthcare': Heart,
    'Home': Home,
    'Other': Wallet,
    
    // Plaid categories (backend names)
    'FOOD_AND_DRINK': Utensils,
    'TRANSPORTATION': Car,
    'GENERAL_MERCHANDISE': ShoppingBag,
    'ENTERTAINMENT': Ticket,
    'TRAVEL': Plane,
    'PERSONAL_CARE': Sparkles,
    'RENT_AND_UTILITIES': Receipt,
    'HEALTHCARE': Heart,
    'HOME_IMPROVEMENT': Home,
    'TRANSFER_IN': TrendingUp,
    'TRANSFER_OUT': TrendingDown,
    'INCOME': DollarSign,
  };

  return iconMap[category] || Wallet;
};

/**
 * Get color class for category icon
 * @param {string} category - Category name
 * @returns {string} Tailwind color classes
 */
export const getCategoryColor = (category) => {
  const colorMap = {
    'Food & Dining': 'bg-orange-100 text-orange-600',
    'Transportation': 'bg-blue-100 text-blue-600',
    'Shopping': 'bg-purple-100 text-purple-600',
    'Entertainment': 'bg-pink-100 text-pink-600',
    'Travel': 'bg-sky-100 text-sky-600',
    'Personal Care': 'bg-indigo-100 text-indigo-600',
    'Bills & Utilities': 'bg-yellow-100 text-yellow-600',
    'Healthcare': 'bg-red-100 text-red-600',
    'Home': 'bg-emerald-100 text-emerald-600',
    'Other': 'bg-gray-100 text-gray-600',
    
    // Plaid categories
    'FOOD_AND_DRINK': 'bg-orange-100 text-orange-600',
    'TRANSPORTATION': 'bg-blue-100 text-blue-600',
    'GENERAL_MERCHANDISE': 'bg-purple-100 text-purple-600',
    'ENTERTAINMENT': 'bg-pink-100 text-pink-600',
    'TRAVEL': 'bg-sky-100 text-sky-600',
    'PERSONAL_CARE': 'bg-indigo-100 text-indigo-600',
    'RENT_AND_UTILITIES': 'bg-yellow-100 text-yellow-600',
    'HEALTHCARE': 'bg-red-100 text-red-600',
    'HOME_IMPROVEMENT': 'bg-emerald-100 text-emerald-600',
    'TRANSFER_IN': 'bg-green-100 text-green-600',
    'TRANSFER_OUT': 'bg-red-100 text-red-600',
    'INCOME': 'bg-green-100 text-green-600',
  };

  return colorMap[category] || 'bg-gray-100 text-gray-600';
};
