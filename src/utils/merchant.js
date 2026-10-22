// Banks and CSV exports often give a raw descriptor like "COSTCO WHSE #1234" or "NETFLIX.COM".
// This turns that into a name people recognise ("Costco", "Netflix"). Names that already have
// mixed case (Plaid's merchant names) are left exactly as they are.

const PAYMENT_PREFIX = /^(SQ|TST|SP|PY|PP|PAYPAL|GOOGLE|APL|IC)\s*\*\s*/i;
const TRAILING_WORDS = /\s+(USA|US|INC|LLC|LTD|CORP|CO|WHSE|STORE|STORES|MKTPLACE|MKTP|ONLINE)\.?$/i;
const SMALL_WORDS = new Set(['and', 'of', 'the', 'at', 'for', 'a', 'an', 'in', 'on', 'to']);

const titleWord = (word, index) => {
  const lower = word.toLowerCase();
  if (index > 0 && SMALL_WORDS.has(lower)) return lower;
  // Short words without vowels are initials: CVS, TJX, BP
  if (word.length <= 4 && !/[AEIOUY]/i.test(word)) return word.toUpperCase();
  const cased = lower.charAt(0).toUpperCase() + lower.slice(1);
  return cased.replace(/^Mc(\w)/, (_, c) => `Mc${c.toUpperCase()}`).replace(/'S\b/, "'s");
};

const titleCase = (text) => text.split(/\s+/).filter(Boolean).map(titleWord).join(' ');

export function cleanMerchant(raw) {
  const text = (raw || '').trim();
  if (!text) return '';
  const shouting = text === text.toUpperCase() && /[A-Z]/.test(text);
  if (!shouting) return text;

  let name = text
    .replace(PAYMENT_PREFIX, '')
    .replace(/\/.*$/, '')               // APPLE.COM/BILL
    .replace(/#\s*\d.*$/, '')           // #1234 and anything after
    .replace(/\.(COM|NET|ORG|IO|CO)\b/gi, '')
    .replace(/\s+\d{3,}.*$/, '')        // trailing store or reference numbers
    .replace(/\s{2,}/g, ' ')
    .trim();
  for (let i = 0; i < 2; i++) name = name.replace(TRAILING_WORDS, '').trim();

  return titleCase(name || text);
}

// The name to show for a transaction
export const merchantOf = (t) => cleanMerchant(t.merchantName || t.name);
