import { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, isSameMonth, startOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';

export default function MonthSelector({ currentMonth, onMonthChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const monthOptions = Array.from({ length: 12 }, (_, i) =>
    startOfMonth(subMonths(new Date(), i))
  );

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isNextDisabled = isSameMonth(currentMonth, new Date());

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onMonthChange(subMonths(currentMonth, 1))}
        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-4 h-4 text-gray-500" />
      </button>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 hover:bg-gray-100 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <span className="text-sm font-semibold text-gray-900 min-w-[120px] text-left">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl ring-1 ring-gray-900/5 py-2 z-50">
            <button
              onClick={() => { onMonthChange(new Date()); setIsOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm font-medium text-primary-600 hover:bg-gray-50 transition-colors"
            >
              This month
            </button>
            <div className="border-t border-gray-100 my-1" />
            <div className="max-h-56 overflow-y-auto">
              {monthOptions.map((month) => {
                const selected = isSameMonth(month, currentMonth);
                return (
                  <button
                    key={month.toISOString()}
                    onClick={() => { onMonthChange(month); setIsOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors hover:bg-gray-50 ${
                      selected ? 'text-primary-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span>{format(month, 'MMMM yyyy')}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-primary-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => onMonthChange(addMonths(currentMonth, 1))}
        disabled={isNextDisabled}
        className={`p-1.5 rounded-lg transition-colors ${
          isNextDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'
        }`}
        aria-label="Next month"
      >
        <ChevronRight className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}
