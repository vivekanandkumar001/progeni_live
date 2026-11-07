import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom/server';
import { routes, routerFuture } from './routes';

export async function render(url: string) {
  const handler = createStaticHandler(routes, { future: routerFuture });
  const context = await handler.query(
    new Request(new URL(url, 'https://progeni.live'))
  );
  if (context instanceof Response) {
    throw new Error(`Unexpected redirect response while prerendering ${url}.`);
  }
  const router = createStaticRouter(handler.dataRoutes, context, {
    future: routerFuture,
  });
  return renderToString(
    <StaticRouterProvider router={router} context={context} />
  );
}
