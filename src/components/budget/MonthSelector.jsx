// src/components/budget/MonthSelector.jsx
import { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, isSameMonth, startOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const MonthSelector = ({ currentMonth, onMonthChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Generate last 12 months
  const generateMonthOptions = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const month = subMonths(today, i);
      months.push(startOfMonth(month));
    }
    
    return months;
  };

  const monthOptions = generateMonthOptions();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToPreviousMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    onMonthChange(new Date());
    setIsDropdownOpen(false);
  };

  const selectMonth = (month) => {
    onMonthChange(month);
    setIsDropdownOpen(false);
  };

  // Can't go into future
  const isNextDisabled = isSameMonth(currentMonth, new Date());

  return (
    <div className="flex items-center gap-2">
      {/* Previous Month Button */}
      <button
        onClick={goToPreviousMonth}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>

      {/* Current Month (Dropdown Trigger) */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="text-lg font-semibold text-gray-900 min-w-[140px] text-left">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {/* Today Quick Action */}
            <button
              onClick={goToToday}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm font-medium text-blue-600"
            >
              Today
            </button>
            
            <div className="border-t border-gray-200 my-2" />

            {/* Month Options */}
            <div className="max-h-64 overflow-y-auto">
              {monthOptions.map((month) => {
                const isSelected = isSameMonth(month, currentMonth);
                
                return (
                  <button
                    key={month.toISOString()}
                    onClick={() => selectMonth(month)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span>{format(month, 'MMMM yyyy')}</span>
                    {isSelected && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Next Month Button */}
      <button
        onClick={goToNextMonth}
        disabled={isNextDisabled}
        className={`p-2 rounded-lg transition-colors ${
          isNextDisabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:bg-gray-100'
        }`}
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

export default MonthSelector;