import React from 'react';
import { Link } from './AppLink';

export const LogoMark: React.FC<{ className?: string }> = ({
  className = 'h-9 w-9',
}) => {
  return (
    <img src="/favicon.svg" className={className} alt="" aria-hidden="true" />
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
