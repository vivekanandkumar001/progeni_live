import React from 'react';
import { ProductStatus } from '../registry/schemas';

interface StatusBadgeProps {
  status: ProductStatus;
  size?: 'sm' | 'md';
}

/**
 * Status shown to visitors. The wording is deliberately user-facing:
 * "Coming soon", "New", "Temporarily unavailable" — not internal states.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const styles: Record<ProductStatus, { classes: string; label: string }> = {
    active: {
      classes: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      label: 'Available',
    },
    beta: {
      classes: 'bg-amber-50 border-amber-200 text-amber-700',
      label: 'New',
    },
    development: {
      classes: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      label: 'Coming soon',
    },
    maintenance: {
      classes: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      label: 'Temporarily unavailable',
    },
    deprecated: {
      classes: 'bg-slate-100 border-slate-200 text-slate-600',
      label: 'Retired',
    },
  };

  const current = styles[status] ?? styles.active;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${current.classes} ${sizeClasses}`}
    >
      {current.label}
    </span>
  );
};
