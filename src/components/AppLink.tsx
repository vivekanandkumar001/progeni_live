import React from 'react';
import {
  Link as RouterLink,
  NavLink as RouterNavLink,
  type LinkProps,
  type NavLinkProps,
} from 'react-router-dom';

/**
 * Every internal link goes through these wrappers instead of importing
 * `Link` / `NavLink` straight from react-router-dom.
 *
 * They exist for one reason: `viewTransition`. React Router 6.30 can wrap a
 * client-side navigation in the browser's View Transitions API, which turns
 * the swap between two pages into a short cross-fade. Without it the content
 * is torn down and rebuilt in a single frame, which reads like the page
 * reloaded — the opposite of the one continuous surface we want.
 *
 * Browsers without the API (Firefox, Safari) fall back to an instant swap,
 * which is exactly what happens today, so nothing is lost.
 */

/**
 * Should the navigation be wrapped in a view transition?
 *
 * `false` opts a link out — useful for links that change a query string on
 * the page you are already on, where a cross-fade would be noise.
 */
const shouldTransition = (viewTransition: boolean | undefined) =>
  viewTransition !== false;

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ viewTransition, ...rest }, ref) => (
    <RouterLink
      ref={ref}
      viewTransition={shouldTransition(viewTransition)}
      {...rest}
    />
  )
);
Link.displayName = 'Link';

export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ viewTransition, ...rest }, ref) => (
    <RouterNavLink
      ref={ref}
      viewTransition={shouldTransition(viewTransition)}
      {...rest}
    />
  )
);
NavLink.displayName = 'NavLink';
