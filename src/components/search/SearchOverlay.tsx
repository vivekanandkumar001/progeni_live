import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
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

    // Take the page behind the panel out of the tab order and the
    // accessibility tree, so it does not offer a second, unopenable copy of
    // the search field while the panel is up. `aria-modal` alone is only a
    // hint; `inert` is the enforcement.
    const appRoot = document.getElementById('root');
    appRoot?.setAttribute('inert', '');

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
      // Give the page back before handing focus to it — an inert element
      // cannot take focus.
      appRoot?.removeAttribute('inert');
      const target = returnFocusRef?.current ?? previouslyFocused;
      target?.focus?.();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;

  // The header uses `backdrop-blur`, which creates a containing block for
  // fixed-position descendants. Rendering through a portal keeps the panel
  // anchored to the viewport instead of to the header.
  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        className="relative mx-auto mt-6 sm:mt-12 w-[calc(100%-1.5rem)] max-w-3xl"
      >
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5">
          {/* Header bar with title & close button */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-[#2874f0]">
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Search Progeni Tools
              </span>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2874f0]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Search box container */}
          <div className="p-4 sm:p-5">
            <SearchBox large submitPath="/tools" autoFocus onNavigate={onClose} />
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
            <span className="shrink-0 flex items-center gap-1.5">
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-sans text-[11px] font-semibold text-slate-500 shadow-sm">
                Esc
              </kbd>
              <span>to close</span>
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/tools');
              }}
              className="truncate font-semibold text-[#2874f0] transition-colors hover:text-[#1a62d6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2874f0]"
            >
              Browse all tools &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SearchOverlay;
