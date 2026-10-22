import { useEffect, useMemo, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Loader, Upload, X } from 'lucide-react';
import { transactionsAPI } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { DATE_FORMATS, detectColumns, detectDateFormat, parseAmount, parseCsv, parseDate } from '../../utils/csv';

const CHUNK_SIZE = 300;
const MAX_ROWS = 5000;

const selectClass =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20';

// Identical rows must land in the same request, so the server numbers them consistently
// and importing the same file again is recognised as duplicates
function chunkRows(rows) {
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.date}|${r.amount}|${r.description.trim().toLowerCase()}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const chunks = [];
  let current = [];
  for (const group of groups.values()) {
    if (current.length + group.length > CHUNK_SIZE && current.length) {
      chunks.push(current);
      current = [];
    }
    current.push(...group);
  }
  if (current.length) chunks.push(current);
  return chunks;
}

function ColumnSelect({ label, value, onChange, headers, optional }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</span>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className={selectClass}>
        {optional && <option value={-1}>None</option>}
        {headers.map((h, i) => <option key={i} value={i}>{h || `Column ${i + 1}`}</option>)}
      </select>
    </label>
  );
}

export default function ImportCsvModal({ onClose, onImported }) {
  const fileRef = useRef(null);
  const [step, setStep] = useState('file'); // file | map | importing | done
  const [fileName, setFileName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [table, setTable] = useState(null); // { headers, rows }
  const [columns, setColumns] = useState(null);
  const [mode, setMode] = useState('single'); // single | split
  const [purchasesNegative, setPurchasesNegative] = useState(true);
  const [dateFormat, setDateFormat] = useState('mdy');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [undoing, setUndoing] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && step !== 'importing' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, step]);

  const readFile = (file) => {
    setError(null);
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('That file is over 10 MB. Export a shorter date range and try again.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCsv(String(reader.result));
      if (parsed.length < 2) {
        setError("That file doesn't have any transaction rows. Check it's the CSV export from your bank.");
        return;
      }
      const [headers, ...rows] = parsed;
      const detected = detectColumns(headers);
      setTable({ headers, rows });
      setColumns({
        date: detected.date >= 0 ? detected.date : 0,
        description: detected.description >= 0 ? detected.description : 1,
        amount: detected.amount >= 0 ? detected.amount : 2,
        debit: detected.debit,
        credit: detected.credit,
      });
      const split = detected.amount < 0 && detected.debit >= 0 && detected.credit >= 0;
      setMode(split ? 'split' : 'single');
      const sampleDates = rows.slice(0, 50).map((r) => r[detected.date >= 0 ? detected.date : 0]);
      setDateFormat(detectDateFormat(sampleDates));
      if (!split && detected.amount >= 0) {
        const amounts = rows.map((r) => parseAmount(r[detected.amount])).filter((a) => a != null && a !== 0);
        setPurchasesNegative(amounts.filter((a) => a < 0).length >= amounts.length / 2);
      }
      setFileName(file.name);
      setAccountName((current) => current || file.name.replace(/\.csv$/i, '').slice(0, 60));
      setStep('map');
    };
    reader.onerror = () => setError("Couldn't read that file. Try exporting it again.");
    reader.readAsText(file);
  };

  // Rows converted to the app's convention (positive = money out); unreadable rows are counted
  const converted = useMemo(() => {
    if (!table || !columns) return { rows: [], skipped: 0 };
    const today = new Date().toISOString().slice(0, 10);
    const rows = [];
    let skipped = 0;
    for (const r of table.rows) {
      const date = parseDate(r[columns.date], dateFormat);
      const description = (r[columns.description] || '').trim().slice(0, 300);
      let amount = null;
      if (mode === 'single') {
        const value = parseAmount(r[columns.amount]);
        if (value != null) amount = purchasesNegative ? -value : value;
      } else {
        const out = columns.debit >= 0 ? parseAmount(r[columns.debit]) : null;
        const inn = columns.credit >= 0 ? parseAmount(r[columns.credit]) : null;
        if (out != null || inn != null) amount = Math.abs(out || 0) - Math.abs(inn || 0);
      }
      if (!date || date > today || !description || amount == null || amount === 0) {
        skipped++;
        continue;
      }
      rows.push({ date, description, amount: Math.round(amount * 100) / 100 });
    }
    return { rows, skipped };
  }, [table, columns, mode, purchasesNegative, dateFormat]);

  const runImport = async () => {
    setError(null);
    const chunks = chunkRows(converted.rows);
    setProgress({ done: 0, total: converted.rows.length });
    setStep('importing');
    const totals = { imported: 0, duplicates: 0, batchIds: [] };
    try {
      for (const chunk of chunks) {
        const { data } = await transactionsAPI.importCsv(accountName.trim(), chunk);
        totals.imported += data.imported;
        totals.duplicates += data.duplicates;
        if (data.imported > 0) totals.batchIds.push(data.batchId);
        setProgress((p) => ({ ...p, done: p.done + chunk.length }));
      }
      setResult(totals);
      setStep('done');
      onImported();
    } catch (err) {
      console.error('Import failed:', err);
      setResult(totals);
      setError(totals.imported
        ? `The import stopped partway: ${totals.imported} transactions were added. You can undo them, or try again to add the rest.`
        : (err.response?.data?.message || "Couldn't import the file. Check your connection and try again."));
      setStep(totals.imported ? 'done' : 'map');
      if (totals.imported) onImported();
    }
  };

  const undo = async () => {
    setUndoing(true);
    try {
      for (const id of result.batchIds) await transactionsAPI.undoImport(id);
      onImported();
      onClose();
    } catch (err) {
      console.error('Undo failed:', err);
      setError("Couldn't undo the import. Try again.");
      setUndoing(false);
    }
  };

  const preview = converted.rows.slice(0, 5);
  const tooMany = converted.rows.length > MAX_ROWS;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/50 p-0 sm:p-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="import-title"
        className="w-full sm:max-w-2xl max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="import-title" className="text-lg font-bold text-gray-900">Import transactions</h2>
          {step !== 'importing' && (
            <button onClick={onClose} className="p-2 -mr-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-5">
          {step === 'file' && (
            <>
              <p className="text-sm text-gray-600 leading-relaxed">
                Download your transactions as a CSV file from your bank's website (usually under
                Statements or Download activity), then choose it here.
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-gray-200 px-6 py-10 text-center hover:border-primary-300 hover:bg-primary-50/30 focus-visible:outline-2 focus-visible:outline-primary-600"
              >
                <Upload className="w-6 h-6 mx-auto text-gray-400" aria-hidden />
                <span className="mt-2 block text-sm font-semibold text-gray-900">Choose a CSV file</span>
                <span className="mt-1 block text-xs text-gray-500">Up to {MAX_ROWS.toLocaleString()} transactions per file</span>
              </button>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => readFile(e.target.files?.[0])} />
            </>
          )}

          {step === 'map' && table && (
            <>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{fileName}</span>: {table.rows.length.toLocaleString()} rows.
                Check the columns below, then confirm with the preview.
              </p>

              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 mb-1.5">Account name</span>
                <input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.slice(0, 60))}
                  placeholder="e.g. Chase Checking"
                  className={selectClass}
                />
                <span className="mt-1 block text-xs text-gray-500">Use the same name when you import this account again.</span>
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <ColumnSelect label="Date" value={columns.date} headers={table.headers} onChange={(v) => setColumns({ ...columns, date: v })} />
                <label className="block">
                  <span className="block text-sm font-semibold text-gray-700 mb-1.5">Date format</span>
                  <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} className={selectClass}>
                    {DATE_FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </label>
                <div className="sm:col-span-2">
                  <ColumnSelect label="Description" value={columns.description} headers={table.headers} onChange={(v) => setColumns({ ...columns, description: v })} />
                </div>
              </div>

              <fieldset>
                <legend className="text-sm font-semibold text-gray-700 mb-2">Amounts</legend>
                <div className="flex flex-wrap gap-2">
                  {[['single', 'One amount column'], ['split', 'Separate money out and money in columns']].map(([id, label]) => (
                    <label key={id} className={`cursor-pointer rounded-xl border px-3 py-2 text-sm ${mode === id ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-gray-200 text-gray-700'}`}>
                      <input type="radio" name="mode" value={id} checked={mode === id} onChange={() => setMode(id)} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {mode === 'single' ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <ColumnSelect label="Amount" value={columns.amount} headers={table.headers} onChange={(v) => setColumns({ ...columns, amount: v })} />
                  <label className="block">
                    <span className="block text-sm font-semibold text-gray-700 mb-1.5">Purchases in this file are</span>
                    <select value={purchasesNegative ? 'neg' : 'pos'} onChange={(e) => setPurchasesNegative(e.target.value === 'neg')} className={selectClass}>
                      <option value="neg">Negative, like -12.50</option>
                      <option value="pos">Positive, like 12.50</option>
                    </select>
                  </label>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <ColumnSelect label="Money out (debit)" value={columns.debit} headers={table.headers} optional onChange={(v) => setColumns({ ...columns, debit: v })} />
                  <ColumnSelect label="Money in (credit)" value={columns.credit} headers={table.headers} optional onChange={(v) => setColumns({ ...columns, credit: v })} />
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Preview</p>
                {preview.length === 0 ? (
                  <p className="text-sm text-red-700">No rows could be read with these settings. Check the columns and date format.</p>
                ) : (
                  <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 px-4">
                    {preview.map((r, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{r.description}</p>
                          <p className="text-xs text-gray-500">{format(parseISO(r.date), 'MMM d, yyyy')}</p>
                        </div>
                        <p className={`shrink-0 font-semibold ${r.amount < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {r.amount < 0 ? `+${formatCurrency(-r.amount)} in` : `${formatCurrency(r.amount)} out`}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Purchases should show as money out. {converted.rows.length.toLocaleString()} transactions ready
                  {converted.skipped > 0 && `; ${converted.skipped.toLocaleString()} rows skipped (no valid date, description or amount, or dated in the future)`}.
                </p>
                {tooMany && (
                  <p className="mt-2 text-sm text-red-700">That's more than {MAX_ROWS.toLocaleString()} transactions. Export a shorter date range and import it in parts.</p>
                )}
              </div>
            </>
          )}

          {step === 'importing' && (
            <div className="py-6" role="status">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Loader className="w-4 h-4 animate-spin text-primary-600" aria-hidden />
                Importing and categorizing…
              </div>
              <div className="mt-4 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {progress.done.toLocaleString()} of {progress.total.toLocaleString()}. Keep this window open.
              </p>
            </div>
          )}

          {step === 'done' && result && (
            <div className="py-2 space-y-2">
              <p className="text-base font-bold text-gray-900">
                {result.imported.toLocaleString()} transactions added to {accountName.trim()}
              </p>
              {result.duplicates > 0 && (
                <p className="text-sm text-gray-600">{result.duplicates.toLocaleString()} were already imported, so they were skipped.</p>
              )}
              <p className="text-sm text-gray-600">Categories were assigned automatically. They show up in your dashboard, budgets and coach.</p>
            </div>
          )}

          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        </div>

        {(step === 'map' || step === 'done') && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-4 border-t border-gray-100">
            {step === 'map' ? (
              <>
                <button onClick={() => { setStep('file'); setTable(null); }} className="btn-secondary text-sm">Choose another file</button>
                <button
                  onClick={runImport}
                  disabled={!converted.rows.length || tooMany || !accountName.trim()}
                  className="btn-primary text-sm"
                >
                  Import {converted.rows.length.toLocaleString()} transactions
                </button>
              </>
            ) : (
              <>
                {result.batchIds.length > 0 && (
                  <button onClick={undo} disabled={undoing} className="btn-secondary text-sm">
                    {undoing ? 'Undoing…' : 'Undo import'}
                  </button>
                )}
                <button onClick={onClose} className="btn-primary text-sm">Done</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
