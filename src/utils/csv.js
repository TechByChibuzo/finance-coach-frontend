// CSV parsing and column detection for importing a bank's transaction export.

// RFC 4180-style parser: quoted fields, escaped quotes (""), commas and newlines inside quotes, CRLF, BOM
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some((f) => f.trim() !== '')) rows.push(row);
  return rows;
}

const find = (headers, words) => headers.findIndex((h) => words.some((w) => h.toLowerCase().includes(w)));

// Guess which columns hold what, from common bank export headers
export function detectColumns(headers) {
  return {
    date: Math.max(find(headers, ['posted date', 'transaction date']), find(headers, ['date'])),
    description: find(headers, ['description', 'payee', 'merchant', 'name', 'memo', 'details']),
    amount: find(headers, ['amount']),
    debit: find(headers, ['debit', 'withdrawal', 'money out']),
    credit: find(headers, ['credit', 'deposit', 'money in']),
  };
}

export const DATE_FORMATS = [
  { id: 'ymd', label: 'YYYY-MM-DD' },
  { id: 'mdy', label: 'MM/DD/YYYY' },
  { id: 'dmy', label: 'DD/MM/YYYY' },
];

// Returns 'YYYY-MM-DD' or null
export function parseDate(value, format) {
  const parts = (value || '').trim().split(/[^0-9]+/).filter(Boolean).map(Number);
  if (parts.length < 3) return null;
  let [y, m, d] = format === 'ymd' ? parts : format === 'mdy' ? [parts[2], parts[0], parts[1]] : [parts[2], parts[1], parts[0]];
  if (y < 100) y += 2000;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

// Pick the date format that reads the most sample values
export function detectDateFormat(values) {
  let best = DATE_FORMATS[0].id;
  let bestCount = -1;
  for (const { id } of DATE_FORMATS) {
    const count = values.filter((v) => parseDate(v, id)).length;
    if (count > bestCount) { best = id; bestCount = count; }
  }
  return best;
}

// "$1,234.56", "(12.00)", "-12", "−12" -> number, or null
export function parseAmount(value) {
  let s = (value || '').trim();
  if (!s) return null;
  const negative = /^\(.*\)$/.test(s) || /^[-−]/.test(s) || /[-−]$/.test(s);
  s = s.replace(/[^0-9.]/g, '');
  if (!s || isNaN(Number(s))) return null;
  return negative ? -Number(s) : Number(s);
}
