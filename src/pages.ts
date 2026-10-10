import backend, { type Env } from './worker';

// Structural subset of Pages EventContext; no Node APIs or alternate auth layer.
export interface PagesContext {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}
export interface PagesRelease { commit: string; dirty: boolean }
export function handlePages(context: PagesContext, release: PagesRelease): Promise<Response> {
  return backend.fetch(context.request, {
    ...context.env,
    DEPLOYMENT_PLATFORM: 'cloudflare-pages',
    RELEASE_COMMIT: release.commit,
    RELEASE_DIRTY: release.dirty ? 'true' : 'false',
    // next() reaches Pages' asset/SPA service, not the API router again.
    // The shared router handles /api/* and policies before this fallback.
    ASSETS: { fetch: () => context.next() }
  });
}
