type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <svg className={`brand-mark ${className}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect className="brand-mark-bg" x="3" y="3" width="58" height="58" rx="16" />
      <path
        className="brand-mark-shield"
        d="M32 10.5 47.5 17v13.2c0 11.2-5.9 19.1-15.5 23.3-9.6-4.2-15.5-12.1-15.5-23.3V17L32 10.5Z"
      />
      <rect className="brand-mark-cell accent" x="23" y="22" width="7" height="7" rx="2" />
      <rect className="brand-mark-cell progress" x="34" y="22" width="8" height="7" rx="2" />
      <rect className="brand-mark-cell done" x="23" y="33" width="7" height="7" rx="2" />
      <path className="brand-mark-check" d="m33.5 41 4 4 8.5-10" />
    </svg>
  );
}
