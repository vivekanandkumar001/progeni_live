import React, { useId } from 'react';
import { Link } from './AppLink';

/**
 * The Progeni logo mark: a rounded indigo→violet badge with a white "P"
 * monogram. Used everywhere the brand appears (header, footer, hero) so the
 * identity is consistent across the whole site.
 */
export const LogoMark: React.FC<{ className?: string }> = ({
  className = 'h-9 w-9',
}) => {
  // The gradient needs an id to be referenced by fill="url(#id)". A fixed id
  // would be duplicated on every page (the mark appears in both the header
  // and the footer), and duplicate ids are invalid HTML — the second
  // reference would silently resolve to the first element.
  const gradientId = `progeni-logo-gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <path
        d="M11.5 24V8.5h5.75a4.75 4.75 0 0 1 0 9.5H11.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Full lockup: logo mark + "Progeni" wordmark, linked to home.
 */
export const Logo: React.FC<{ markClassName?: string }> = ({
  markClassName = 'h-9 w-9',
}) => (
  <Link
    to="/"
    className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
    aria-label="Progeni home"
  >
    <LogoMark className={markClassName} />
    <span className="text-lg font-extrabold tracking-tight text-slate-900">
      Progeni
    </span>
  </Link>
);

export default Logo;
