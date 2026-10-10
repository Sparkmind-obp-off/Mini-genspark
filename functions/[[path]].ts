import { handlePages, type PagesContext } from '../src/pages';

// Replaced only in the server bundle by scripts/build-pages.mjs, never in source.
// Build identity is distinct from a Cloudflare deployment ID; remote tests verify both.
export const onRequest = (context: PagesContext): Promise<Response> => handlePages(context, {
  commit: '__VESTREN_RELEASE_SHA__',
  dirty: String('__VESTREN_RELEASE_DIRTY__') === 'true'
});
