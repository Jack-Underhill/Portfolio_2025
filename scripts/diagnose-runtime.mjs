import { chromium } from 'playwright';

const baseUrl = process.env.RUNTIME_BASE_URL ?? 'http://127.0.0.1:5173';
const paths = process.argv.slice(2);
const targets = paths.length > 0 ? paths : ['/', '/admin/'];

const interestingResourceTypes = new Set(['document', 'fetch', 'xhr', 'script']);
const htmlStartPattern = /^\s*(<!doctype|<html|<!DOCTYPE|<HTML)/;

function toUrl(target) {
  return new URL(target, baseUrl).toString();
}

function preview(text) {
  return text.replace(/\s+/g, ' ').trim().slice(0, 180);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const consoleMessages = [];
const pageErrors = [];
const failedRequests = [];
const network = [];
const unexpectedHtml = [];
const pendingResponseReads = [];

page.on('console', (message) => {
  consoleMessages.push({
    type: message.type(),
    location: message.location(),
    text: message.text(),
  });
});

page.on('pageerror', (error) => {
  pageErrors.push({
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
});

page.on('requestfailed', (request) => {
  failedRequests.push({
    method: request.method(),
    resourceType: request.resourceType(),
    url: request.url(),
    failure: request.failure()?.errorText ?? 'unknown',
  });
});

page.on('response', (response) => {
  const read = (async () => {
    const request = response.request();
    const resourceType = request.resourceType();

    if (!interestingResourceTypes.has(resourceType)) {
      return;
    }

    const headers = response.headers();
    const contentType = headers['content-type'] ?? '';
    const entry = {
      status: response.status(),
      resourceType,
      method: request.method(),
      url: response.url(),
      contentType,
    };
    network.push(entry);

    if (resourceType !== 'fetch' && resourceType !== 'xhr') {
      return;
    }

    if (!contentType.includes('html') && response.status() < 400) {
      return;
    }

    try {
      const body = await response.text();
      if (htmlStartPattern.test(body)) {
        unexpectedHtml.push({
          ...entry,
          bodyPreview: preview(body),
        });
      }
    } catch (error) {
      unexpectedHtml.push({
        ...entry,
        bodyPreview: `Could not read body: ${error.message}`,
      });
    }
  })();

  pendingResponseReads.push(read);
});

for (const target of targets.map(toUrl)) {
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForTimeout(3_000);
}

await Promise.allSettled(pendingResponseReads);
await browser.close();

const result = {
  checked: targets.map(toUrl),
  consoleMessages,
  pageErrors,
  failedRequests,
  unexpectedHtml,
  fetchAndXhr: network.filter((entry) => entry.resourceType === 'fetch' || entry.resourceType === 'xhr'),
};

console.log(JSON.stringify(result, null, 2));
