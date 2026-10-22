// Same rules as the backend's totals.

// Moving money between your own accounts (transfers, paying off a credit card) is neither
// spending nor income
export const isTransfer = (t) =>
  t.category === 'TRANSFER_IN' ||
  t.category === 'TRANSFER_OUT' ||
  t.subcategory === 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT';

// Counted in spending and income totals: not a transfer, not hidden, not a split original
// (its parts are counted instead)
export const countsInTotals = (t) => !isTransfer(t) && !t.hidden && !t.split;

// A split original is listed through its parts
export const withoutSplitOriginals = (list) => list.filter((t) => !t.split);
