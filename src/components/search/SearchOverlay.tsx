import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import SearchBox from './SearchBox';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  /**
   * The control that opened the panel. Focus is handed back to it on close.
   * It has to be explicit: the search field takes focus as soon as the panel
   * mounts, so by the time the effect runs, document.activeElement is the
   * field — not whatever the visitor was using a moment ago.
   */
  returnFocusRef?: React.RefObject<HTMLElement>;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A full-screen search panel opened from the header.
 *
 * The header used to link to /tools with a magnifier, which looked like a
 * search field but did nothing but navigate. This panel makes the magnifier
 * do what it promises: search from any page, without losing your place.
 */
const SearchOverlay: React.FC<SearchOverlayProps> = ({
  open,
  onClose,
  returnFocusRef,
}) => {
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus into the panel, trap Tab inside it, and give focus back to
  // whatever was focused before the panel opened.
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // The input mounts with the panel, so it can take focus directly.
    const input = panelRef.current?.querySelector<HTMLInputElement>('input');
    input?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
      const target = returnFocusRef?.current ?? previouslyFocused;
      target?.focus?.();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;

  // The header uses `backdrop-blur`, which creates a containing block for
  // fixed-position descendants. Rendering through a portal keeps the panel
  // anchored to the viewport instead of to the header.
  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        className="relative mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-2xl"
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl sm:p-4">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <SearchBox large submitPath="/tools" autoFocus onNavigate={onClose} />
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 px-1 pt-3 text-xs text-slate-500">
            <span className="shrink-0">
              <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans">
                Esc
              </kbd>{' '}
              to close
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/tools');
              }}
              className="truncate font-medium text-indigo-600 transition-colors hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Browse all tools
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SearchOverlay;
