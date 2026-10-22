import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes, routerFuture, renderFuture } from '../routes';

/**
 * Render the site at a given URL.
 *
 * The app runs on a data router, so the tests have to as well — a plain
 * `<MemoryRouter>` + `<Routes>` would exercise a different navigation code
 * path from the one the browser actually uses, and would quietly stop
 * covering the scroll and view-transition behaviour.
 */
export function renderAt(initialRoute: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialRoute],
    future: routerFuture,
  });
  return render(<RouterProvider router={router} future={renderFuture} />);
}
