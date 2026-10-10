import { describe, expect, it, vi } from 'vitest';
import { handlePages } from './pages';

const release = { commit: 'fixture-commit', dirty: false };
describe('Pages Functions adapter boundaries', () => {
  it('forwards root, static assets and SPA paths through next with security headers', async () => {
    for (const path of ['/', '/assets/app.js', '/workspace/saved-project']) {
      const next = vi.fn(async () => new Response('asset or SPA fixture'));
      const response = await handlePages({ request: new Request('https://fixture.pages.dev' + path), env: {}, next }, release);
      expect(next).toHaveBeenCalledOnce();
      expect(await response.text()).toBe('asset or SPA fixture');
      expect(response.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
      expect(response.headers.get('strict-transport-security')).toBe('max-age=31536000');
    }
  });
  it('never sends API failures or public policy routes into SPA fallback', async () => {
    const next = vi.fn(async () => new Response('must not mask API errors'));
    for (const path of ['/api/projects', '/api/unknown', '/api/credentials/generate']) {
      const response = await handlePages({ request: new Request('https://fixture.pages.dev' + path), env: {}, next }, release);
      expect(response.status).toBe(503);
      expect(response.headers.get('content-type')).toContain('application/json');
    }
    for (const path of ['/privacy', '/terms', '/status', '/support', '/pricing']) {
      expect((await handlePages({ request: new Request('https://fixture.pages.dev' + path), env: {}, next }, release)).status).toBe(200);
    }
    expect(next).not.toHaveBeenCalled();
  });
  it('labels build provenance separately from an independently verified deployment', async () => {
    const response = await handlePages({ request: new Request('https://fixture.pages.dev/api/health'), env: {}, next: vi.fn() }, release);
    expect(await response.json()).toMatchObject({ version: null, deployment: { platform: 'cloudflare-pages', commit: release.commit, dirty: false } });
  });
});
