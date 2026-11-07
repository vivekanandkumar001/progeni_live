import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const config = JSON.parse(
  readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf-8')
) as { cleanUrls?: boolean; trailingSlash?: boolean; rewrites?: unknown[] };

describe('Vercel static route configuration', () => {
  it('serves generated clean-URL pages without an SPA fallback', () => {
    expect(config.cleanUrls).toBe(true);
    expect(config.trailingSlash).toBe(false);
    expect(config.rewrites).toBeUndefined();
  });
});
