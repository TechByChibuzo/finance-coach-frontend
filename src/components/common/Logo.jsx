// The growth-leaf mark: a rising line that grows into a leaf. public/favicon.svg and the
// PNG app icons use the same paths, so change them together.
export const LogoIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 30 30" fill="none" aria-hidden>
    <path d="M3.5 23.5 L10.5 16.5 L14.5 20 L21 13.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20.4 14.2 C18.6 8.4 21.8 3.6 27.8 3.4 C28.6 9.6 26 14.2 20.4 14.2 Z" fill="white" />
    <path d="M21.6 12.8 L25.6 7.2" stroke="var(--color-primary-600)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// The mark on its evergreen tile. Size the tile with className; the mark fills about 60% of it.
export const LogoMark = ({ className = 'w-9 h-9 rounded-xl', size = 22 }) => (
  <div className={`${className} bg-primary-600 flex items-center justify-center shrink-0`}>
    <LogoIcon size={size} />
  </div>
);
