import type { RouteObject } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AboutPage from './pages/AboutPage';
import CategoryPage from './pages/CategoryPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import NewPage from './pages/NewPage';
import NotFoundPage from './pages/NotFoundPage';
import PrivacyPage from './pages/PrivacyPage';
import ProductDetailPage from './pages/ProductDetailPage';
import TermsPage from './pages/TermsPage';
import ToolsPage from './pages/ToolsPage';

/**
 * The site map, as data.
 *
 * This is deliberately a data router (`createBrowserRouter`) rather than the
 * older `<BrowserRouter>` + `<Routes>` pair. Only the data router wires the
 * browser's View Transitions API into navigation: with `<Routes>` the
 * `viewTransition` flag on a link is accepted and then quietly thrown away,
 * so every page change is a hard cut with no animation between the two.
 *
 * The URLs are unchanged — the paths below are the same ones the sitemap
 * and the canonical tags point at.
 */
/**
 * React Router 6 nudges you towards its v7 behaviour flags, and warns on
 * every load if you have not made a choice. These are the choices, split the
 * way the library reads them: `routerFuture` configures the router itself,
 * `renderFuture` configures `<RouterProvider>`.
 *
 * `v7_startTransition` is deliberately off: it renders navigations as a
 * concurrent React transition, which can delay the new page by a frame or
 * two. The pages here are tiny and already bundled, so a synchronous swap is
 * both faster and leaves the scroll position predictable.
 *
 * The rest only affect features this site does not use (fetchers, form
 * actions, SSR hydration), so they are switched on to match v7.
 */
export const routerFuture = {
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_partialHydration: true,
  v7_skipActionErrorRevalidation: true,
} as const;

export const renderFuture = {
  v7_startTransition: false,
} as const;

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'tools', element: <ToolsPage /> },
      { path: 'tools/:slug', element: <ProductDetailPage /> },
      { path: 'categories/:slug', element: <CategoryPage /> },
      { path: 'new', element: <NewPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export default routes;
