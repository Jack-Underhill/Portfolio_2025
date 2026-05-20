import assert from 'node:assert/strict';

import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const HOST = '127.0.0.1';
const PORT = 4175;

function formatViolations(violations) {
  return violations
    .map((violation) => {
      const targets = violation.nodes
        .flatMap((node) => node.target)
        .slice(0, 5)
        .join(', ');

      return `${violation.id}: ${violation.help}${targets ? ` (${targets})` : ''}`;
    })
    .join('\n');
}

async function expectNoAxeViolations(page) {
  const results = await new AxeBuilder({ page }).analyze();

  assert.equal(
    results.violations.length,
    0,
    `Expected no axe violations, found:\n${formatViolations(results.violations)}`,
  );
}

async function expectVisible(locator, message) {
  assert.equal(await locator.isVisible(), true, message);
}

async function runHomeSmoke(page, baseUrl) {
  await page.goto(new URL('/', baseUrl).href);

  await expectVisible(page.getByRole('main'), 'Home page should expose a main landmark.');
  await expectVisible(
    page.getByRole('navigation', { name: 'Primary sections' }),
    'Home page should expose the primary section navigation.',
  );
  await expectVisible(
    page.getByRole('heading', { level: 1, name: 'Jack Underhill' }),
    'Home page should expose the owner name as the h1.',
  );

  const menuButton = page.getByRole('button', { name: 'Open section navigation' });
  await expectVisible(menuButton, 'Closed menu button should have an accessible name.');
  assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');

  await expectNoAxeViolations(page);
}

async function runArchitectureFallbackSmoke(page, baseUrl) {
  const viewerUrl = new URL('/architecture-viewer', baseUrl);
  viewerUrl.searchParams.set('src', 'https://example.com/bad.svg');
  viewerUrl.searchParams.set('title', 'Invalid Diagram');
  viewerUrl.searchParams.set('returnTo', '/p/sample');

  await page.goto(viewerUrl.href);

  await expectVisible(
    page.getByRole('heading', { level: 1, name: 'Invalid Diagram' }),
    'Architecture viewer should expose the requested title as the h1.',
  );
  await expectVisible(
    page.getByText('No trusted architecture diagram was provided.'),
    'Invalid architecture source fallback should be visible.',
  );

  assert.equal(
    await page.getByRole('button', { name: 'Zoom out architecture diagram' }).isDisabled(),
    true,
  );
  assert.equal(
    await page.getByRole('button', { name: 'Reset architecture diagram zoom to 100 percent' }).isDisabled(),
    true,
  );
  assert.equal(
    await page.getByRole('button', { name: 'Zoom in architecture diagram' }).isDisabled(),
    true,
  );
  assert.equal(
    await page.getByRole('link', { name: 'Back to project case study' }).getAttribute('href'),
    '/p/sample',
  );

  await expectNoAxeViolations(page);
}

let server;
let browser;
let context;

try {
  server = await createServer({
    logLevel: 'error',
    server: {
      host: HOST,
      port: PORT,
      strictPort: true,
    },
  });

  await server.listen();

  const baseUrl = `http://${HOST}:${PORT}`;
  browser = await chromium.launch();
  context = await browser.newContext();
  const page = await context.newPage();

  await runHomeSmoke(page, baseUrl);
  await runArchitectureFallbackSmoke(page, baseUrl);

  console.log('Accessibility smoke checks passed.');
} finally {
  await context?.close();
  await browser?.close();
  await server?.close();
}
