// Plaid Personal Finance Category (primary) -> the name users see
const CATEGORY_LABELS = {
  FOOD_AND_DRINK: 'Food & dining',
  LOAN_PAYMENTS: 'Loan payments',
  TRANSPORTATION: 'Transportation',
  GENERAL_MERCHANDISE: 'Shopping',
  GENERAL_SERVICES: 'Services',
  ENTERTAINMENT: 'Entertainment',
  TRAVEL: 'Travel',
  PERSONAL_CARE: 'Personal care',
  RENT_AND_UTILITIES: 'Bills & utilities',
  MEDICAL: 'Healthcare',
  HOME_IMPROVEMENT: 'Home',
  GOVERNMENT_AND_NON_PROFIT: 'Taxes & giving',
  BANK_FEES: 'Bank fees',
  TRANSFER_IN: 'Transfer in',
  TRANSFER_OUT: 'Transfer out',
  INCOME: 'Income',
};

export const categoryLabel = (category) => {
  if (!category) return 'Uncategorized';
  if (CATEGORY_LABELS[category]) return CATEGORY_LABELS[category];
  // Budget categories and unknown codes: "SOME_CODE" -> "Some code"
  const words = category.replace(/_/g, ' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
