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

// Categories a user can pick for a transaction (Plaid primaries, plus credit card payments)
export const CATEGORY_OPTIONS = [
  'FOOD_AND_DRINK', 'GENERAL_MERCHANDISE', 'TRANSPORTATION', 'TRAVEL', 'ENTERTAINMENT',
  'RENT_AND_UTILITIES', 'PERSONAL_CARE', 'MEDICAL', 'HOME_IMPROVEMENT', 'GENERAL_SERVICES',
  'GOVERNMENT_AND_NON_PROFIT', 'BANK_FEES', 'LOAN_PAYMENTS', 'INCOME', 'TRANSFER_IN', 'TRANSFER_OUT',
  'CREDIT_CARD_PAYMENT',
].map((code) => ({ code, label: code === 'CREDIT_CARD_PAYMENT' ? 'Credit card payment' : categoryLabel(code) }));

// The category code to preselect when editing a transaction
export const editableCategory = (t) =>
  t.subcategory === 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT' ? 'CREDIT_CARD_PAYMENT' : t.category;
