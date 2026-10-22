import { useState } from 'react';
import CategoryIcon from './CategoryIcon';

const SIZES = { sm: 'w-8 h-8', md: 'w-10 h-10' };

/**
 * The merchant's logo when Plaid knows it, otherwise the category icon.
 * Falls back too if the image fails to load, so a row never shows a broken picture.
 */
export default function MerchantIcon({ logoUrl, category, size = 'md' }) {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) {
    return <CategoryIcon category={category} size={size} />;
  }

  return (
    <img
      src={logoUrl}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${SIZES[size] || SIZES.md} shrink-0 rounded-full bg-white object-cover ring-1 ring-gray-200`}
    />
  );
}
