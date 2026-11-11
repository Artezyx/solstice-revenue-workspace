import { test, expect, type Page } from '@playwright/test';

type Stage = 'lead' | 'qualified' | 'proposal' | 'won' | 'lost';
type Deal = { id: string; company: string; valueCents: number; probability: number;
  stage: Stage; version: number; createdAt: string };

async function mockBackend(page: Page, rejectCreate = false) {
  const deals: Deal[] = [];
  const calls: Array<{ method: string; path: string }> = [];
  await page.route('http://localhost:8093/**', async route => {
    const request = route.request();
    const method = request.method();
    const path = new URL(request.url()).pathname;
    const headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PATCH, OPTIONS',
      'access-control-allow-headers': 'content-type, x-api-key',
      'content-type': 'application/json',
    };
    if (method === 'OPTIONS') {
      return route.fulfill({ status: 204, headers, body: '' });
    }
    calls.push({ method, path });
    const respond = (status: number, value: unknown) =>
      route.fulfill({ status, headers, body: JSON.stringify(value) });
    if (method === 'GET' && path === '/v1/opportunities') {
      return respond(200, { items: [...deals], total: deals.length, page: 1, size: 20 });
    }
    if (method === 'GET' && path === '/v1/opportunities/metrics') {
      const open = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
      return respond(200, {
        total: deals.length, openCount: open.length,
        openPipelineCents: open.reduce((n, d) => n + d.valueCents, 0),
        weightedForecastCents: open.reduce((n, d) => n + Math.round(d.valueCents * d.probability / 100), 0),
        wonCents: deals.filter(d => d.stage === 'won').reduce((n, d) => n + d.valueCents, 0),
      });
    }
    if (method === 'POST' && path === '/v1/opportunities') {
      if (rejectCreate) return respond(503, { message: 'Service unavailable' });
      const dto = request.postDataJSON() as {company:string; valueCents:number; probability:number};
      if (!dto.company || dto.valueCents <= 0 || dto.probability < 0 || dto.probability > 100)
        return respond(400, {message:'Validation failed'});
      const deal: Deal = {...dto, id: String(deals.length + 1), stage: 'lead',
        version: 1, createdAt: '2026-01-01T00:00:00Z'};
      deals.unshift(deal);
      return respond(201, deal);
    }
    const matched = path.match(/^\/v1\/opportunities\/([^/]+)\/stage$/);
    if (method === 'PATCH' && matched) {
      const deal = deals.find(d => d.id === matched[1]);
      if (!deal) return respond(404, {message:'Not found'});
      const dto = request.postDataJSON() as {stage:Stage;version:number};
      const next: Record<Stage, Stage|null> =
        {lead:'qualified',qualified:'proposal',proposal:'won',won:null,lost:null};
      if (dto.version !== deal.version || next[deal.stage] !== dto.stage)
        return respond(409, {message:'Conflict'});
      deal.stage = dto.stage;
      deal.version += 1;
      return respond(200, deal);
    }
    return respond(404, {message:'Unhandled route'});
  });
  return { deals, calls };
}

test('creates a deal, computes forecast and advances the stage', async ({page}) => {
  const { calls } = await mockBackend(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Revenue Workspace' })).toBeVisible();
  await page.getByLabel('Company').fill('Northstar Cloud');
  await page.getByLabel('Value (USD)').fill('12500');
  await page.getByLabel('Probability (%)').fill('40');
  await page.getByRole('button', {name:'Create'}).click();
  const row = page.getByRole('row', {name: /Northstar Cloud/});
  await expect(row).toContainText('$12,500.00');
  await expect(page.locator('.kpis')).toContainText('$5,000.00');
  await row.getByRole('button', {name:'Move to Qualified'}).click();
  await expect(row).toContainText('Qualified');
  expect(calls.some(c => c.method === 'POST')).toBe(true);
  expect(calls.some(c => c.method === 'PATCH')).toBe(true);
});

test('blocks invalid form values before sending a request', async ({page}) => {
  const {calls} = await mockBackend(page);
  await page.goto('/');
  await page.getByLabel('Company').fill('Sentinel');
  await page.getByLabel('Probability (%)').fill('101');
  // requestSubmit runs native constraint validation: an invalid form must not emit submit.
  await expect(page.getByLabel('Probability (%)')).toBeInvalid();
  await page.locator('form').evaluate(form => (form as HTMLFormElement).requestSubmit());
  expect(calls.filter(c => c.method === 'POST')).toHaveLength(0);
});

test('displays an API error without freezing the submit form', async ({page}) => {
  const {calls} = await mockBackend(page, true);
  await page.goto('/');
  await page.getByLabel('Company').fill('Nimbus Systems');
  // Submit via the form API to avoid a race with React's temporary disabled button.
  // The happy-path test above still exercises an actual user click.
  await page.locator('form').evaluate(form => (form as HTMLFormElement).requestSubmit());
  await expect(page.getByRole('alert')).toContainText('503');
  await expect(page.getByRole('button', {name:'Create'})).toBeEnabled();
  expect(calls.filter(c => c.method === 'POST')).toHaveLength(1);
});
