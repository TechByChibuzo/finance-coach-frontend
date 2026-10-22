// src/components/common/CategoryIcon.jsx
import { createElement } from 'react';
import { getCategoryColor, getCategoryIcon } from '../../utils/categoryStyle';

/**
 * CategoryIcon component - Renders icon with background
 * @param {object} props
 * @param {string} props.category - Category name
 * @param {string} props.size - Size: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.className - Additional classes
 */
export default function CategoryIcon({ category, size = 'md', className = '' }) {
  const colorClass = getCategoryColor(category);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClass}
        rounded-full
        flex items-center justify-center
        ${className}
      `}
    >
      {createElement(getCategoryIcon(category), { className: iconSizes[size], strokeWidth: 2 })}
    </div>
  );
}

/**
 * CategoryIconSimple - Just the icon without background (for budget cards)
 */
export function CategoryIconSimple({ category, size = 'md', className = '' }) {
  const colors = getCategoryColor(category).split(' ')[1]; // Get just text color

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8',
  };

  return createElement(getCategoryIcon(category), {
    className: `${iconSizes[size]} ${colors} ${className}`,
    strokeWidth: 2,
  });
}