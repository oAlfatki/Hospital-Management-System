import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? files(join(dir, entry.name)) : /\.tsx?$/.test(entry.name) ? [join(dir, entry.name)] : []);
}

test('frontend preserves pages/components → hooks/services → API transport boundaries', () => {
  const root = fileURLToPath(new URL('../../src/', import.meta.url));
  for (const file of files(root)) {
    if (file.includes('/api/') || file.includes('/core/config/axios.ts')) continue;
    const code = readFileSync(file, 'utf8');
    expect(code, `${file} must delegate HTTP transport to its feature API client`).not.toMatch(/(?:import\s.*(?:from\s*)?['"][^'"]*(?:config\/axios|^axios)['"]|\bfetch\s*\(|\baxios\.(?:get|post|put|patch|delete)\s*\()/m);
    if (/\/(?:pages|components|hooks|providers)\//.test(file))
      expect(code, `${file} must call its service/hook instead of importing an API client`).not.toMatch(/^import\s.*from\s*['"][^'"]*\/api\//m);
  }
});
