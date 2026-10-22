import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType, NavigationType } from 'react-router-dom';

/**
 * Keeps scrolling behaving the way it does in a native app rather than the
 * way it does on a stack of separate documents.
 *
 * - Moving to a different page starts at the top, instantly.
 * - Coming back with the browser's Back button lands you exactly where you
 *   left, instead of dumping you at the top of the page.
 * - Changing a query string on the page you are already on (a filter, a
 *   search) leaves you exactly where you are — the content updates under
 *   your eyes instead of jumping away.
 * - A `#hash` link lands on its target, clearing the sticky header, even
 *   though the browser cannot do that part on its own.
 */

/**
 * Jump to a position with no animation.
 *
 * `behavior: 'instant'` is the obvious way to do this, but it is not
 * implemented everywhere and an unsupported enum value throws. Suspending
 * the CSS `scroll-behavior` for the call works in every browser.
 */
function scrollToInstant(top: number) {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo({ top, behavior: 'auto' });
  root.style.scrollBehavior = previous;
}

/** `#some%20thing` -> `some thing`, tolerating a malformed escape. */
function decodeFragment(hash: string): string | null {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return null;
  }
}

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ScrollManager: React.FC = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  /** Scroll offset for each history entry we have visited, keyed by its key. */
  const positions = useRef(new Map<string, number>());
  /** The key of the entry currently on screen. */
  const currentKey = useRef<string>('');
  /** The pathname currently on screen. */
  const lastPathname = useRef<string>('');

  // Take over scroll restoration. The browser's own version restores the
  // wrong entry often enough to be more annoying than helpful, and it
  // fights with the view transition.
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  // Remember the offset continuously, so a Back press has something to
  // restore even if the page never fired a scroll event before leaving.
  useEffect(() => {
    let frame = 0;

    const record = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        positions.current.set(currentKey.current, window.scrollY);
      });
    };

    window.addEventListener('scroll', record, { passive: true });
    return () => {
      window.removeEventListener('scroll', record);
      if (frame) window.cancelAnimationFrame(frame);
      positions.current.set(currentKey.current, window.scrollY);
    };
  }, []);

  useLayoutEffect(() => {
    const key = location.key;
    const isFirstRender = lastPathname.current === '';
    const pathnameChanged = lastPathname.current !== location.pathname;
    currentKey.current = key;

    // A fragment. The browser cannot resolve these on its own here: on a cold
    // load the target has not been rendered yet, and a pushState-style
    // navigation never triggers the browser's own fragment scroll.
    if (location.hash.length > 1) {
      const targetId = decodeFragment(location.hash);
      const element = targetId ? document.getElementById(targetId) : null;
      if (element) {
        const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
        const top = element.getBoundingClientRect().top + window.scrollY - margin;
        if (isFirstRender || prefersReducedMotion()) {
          // A cold deep link should already look like it landed there.
          scrollToInstant(top);
        } else {
          window.scrollTo({ top, behavior: 'smooth' });
        }
        lastPathname.current = location.pathname;
        return;
      }
      // The target is not on this page — fall through and start at the top.
    }

    if (navigationType === NavigationType.Pop) {
      // Back / forward: put the visitor back exactly where they were.
      const saved = positions.current.get(key);
      scrollToInstant(saved ?? 0);
      lastPathname.current = location.pathname;
      return;
    }

    if (!pathnameChanged) {
      // Same page, different query string — a filter or a search. Stay put.
      lastPathname.current = location.pathname;
      return;
    }

    // A different page: start at the top.
    scrollToInstant(0);
    lastPathname.current = location.pathname;
  }, [location.key, location.pathname, location.hash, navigationType]);

  return null;
};

export default ScrollManager;
