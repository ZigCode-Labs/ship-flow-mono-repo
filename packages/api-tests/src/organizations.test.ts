import { describe, it, expect, beforeAll } from 'vitest';
import { get, post, patch, del } from './client';
import {
  TEST_USER,
  SAMPLE_ORG,
  SAMPLE_ORG_UPDATE,
  SAMPLE_BANK,
  SAMPLE_SHIPPING,
  SAMPLE_ITEM_CODE,
  SECOND_ORG,
} from './fixtures';

// Module-level state shared across all describe blocks
let token = '';
let orgId = '';
let secondOrgId = '';

// ─── Auth setup ────────────────────────────────────────────────────────────────

beforeAll(async () => {
  // Ensure the test user exists (idempotent — 400 on duplicate is fine)
  await post('/auth/register', TEST_USER);

  const res = await post<{ accessToken: string; refreshToken?: string }>('/auth/login', {
    email: TEST_USER.email,
    password: TEST_USER.password,
  });
  if (!res.ok || !res.data.accessToken) {
    throw new Error(
      `Login failed (status ${res.status}) — check TEST_EMAIL / TEST_PASSWORD in .env.test`,
    );
  }
  token = res.data.accessToken;
});

// ─── CRUD ──────────────────────────────────────────────────────────────────────

describe('Organizations — Create', () => {
  it('creates an organization and assigns OWNER role', async () => {
    const res = await post<{
      id: string;
      name: string;
      slug: string;
      members: { role: string }[];
    }>('/organizations', SAMPLE_ORG, { token });

    expect(res.status).toBe(201);
    expect(res.data.name).toBe(SAMPLE_ORG.name);
    expect(res.data.slug).toMatch(/^acme-exports/);
    expect(res.data.members[0].role).toBe('OWNER');

    orgId = res.data.id;
  });

  it('generates a unique slug when name is duplicated', async () => {
    const res = await post<{ id: string; slug: string }>(
      '/organizations',
      { ...SAMPLE_ORG, name: SAMPLE_ORG.name },
      { token },
    );
    expect(res.status).toBe(201);
    // Slug must differ from the first one (e.g. acme-exports-pvt-ltd-1)
    expect(res.data.slug).not.toBe('acme-exports-pvt-ltd');
    // Clean up immediately
    await del(`/organizations/${res.data.id}`, { token });
  });

  it('rejects creation with a name shorter than 2 chars', async () => {
    const res = await post('/organizations', { name: 'A', country: 'India' }, { token });
    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await post('/organizations', SAMPLE_ORG);
    expect(res.status).toBe(401);
  });
});

describe('Organizations — Read', () => {
  it('lists all orgs for the authenticated user', async () => {
    const res = await get<{ id: string; name: string }[]>('/organizations', { token });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.some((o) => o.id === orgId)).toBe(true);
  });

  it('fetches a single org with members', async () => {
    const res = await get<{
      id: string;
      name: string;
      members: { role: string; user: { email: string } }[];
    }>(`/organizations/${orgId}`, { token });

    expect(res.status).toBe(200);
    expect(res.data.id).toBe(orgId);
    expect(res.data.members.length).toBeGreaterThan(0);
    expect(res.data.members[0].user.email).toBe(TEST_USER.email);
  });

  it('returns 404 for a non-existent org', async () => {
    const res = await get('/organizations/00000000-0000-0000-0000-000000000000', { token });
    expect(res.status).toBe(404);
  });

  it('returns 400 for a non-UUID org ID', async () => {
    const res = await get('/organizations/not-a-uuid', { token });
    expect(res.status).toBe(400);
  });
});

describe('Organizations — Update (compliance details)', () => {
  it('updates IEC, GSTIN, PAN, CIN and address', async () => {
    const res = await patch<{ iecCode: string; gstNumber: string }>(
      `/organizations/${orgId}`,
      SAMPLE_ORG_UPDATE,
      { token },
    );
    expect(res.status).toBe(200);
  });

  it('rejects invalid GSTIN format', async () => {
    const res = await patch(`/organizations/${orgId}`, { gstNumber: 'INVALID' }, { token });
    expect(res.status).toBe(400);
  });

  it('rejects invalid IEC (wrong length)', async () => {
    const res = await patch(`/organizations/${orgId}`, { iecCode: 'SHORT' }, { token });
    expect(res.status).toBe(400);
  });

  it('rejects invalid PAN format', async () => {
    const res = await patch(`/organizations/${orgId}`, { panNumber: 'BADPAN' }, { token });
    expect(res.status).toBe(400);
  });
});

describe('Organizations — Update (bank details)', () => {
  it('saves valid bank details', async () => {
    const res = await patch<{ bankName: string; bankIFSC: string }>(
      `/organizations/${orgId}`,
      SAMPLE_BANK,
      { token },
    );
    expect(res.status).toBe(200);
  });

  it('rejects invalid IFSC code', async () => {
    const res = await patch(`/organizations/${orgId}`, { bankIFSC: 'BADIFC' }, { token });
    expect(res.status).toBe(400);
  });

  it('rejects account number that is too short', async () => {
    const res = await patch(`/organizations/${orgId}`, { bankAccountNo: '12345' }, { token });
    expect(res.status).toBe(400);
  });
});

describe('Organizations — Update (shipping & item code)', () => {
  it('saves shipping defaults', async () => {
    const res = await patch<{ portOfLoading: string }>(`/organizations/${orgId}`, SAMPLE_SHIPPING, {
      token,
    });
    expect(res.status).toBe(200);
  });

  it('saves item code settings', async () => {
    const res = await patch<{ itemCodePrefix: string; itemCodeDigits: number }>(
      `/organizations/${orgId}`,
      SAMPLE_ITEM_CODE,
      { token },
    );
    expect(res.status).toBe(200);
  });

  it('rejects itemCodeDigits out of range', async () => {
    const res = await patch(`/organizations/${orgId}`, { itemCodeDigits: 10 }, { token });
    expect(res.status).toBe(400);
  });

  it('marks onboarding as done', async () => {
    const res = await patch<{ onboardingDone: boolean }>(
      `/organizations/${orgId}`,
      { onboardingDone: true },
      { token },
    );
    expect(res.status).toBe(200);
    expect(res.data.onboardingDone).toBe(true);
  });
});

describe('Organizations — Members', () => {
  it('lists members for an org the user belongs to', async () => {
    const res = await get<{ role: string; user: { email: string } }[]>(
      `/organizations/${orgId}/members`,
      { token },
    );
    expect(res.status).toBe(200);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0].role).toBe('OWNER');
  });

  it('returns 403 when non-member tries to list members', async () => {
    // Register a fresh user who has no membership
    const ts = Date.now();
    const stranger = {
      email: `stranger_${ts}@shipflow.dev`,
      password: 'Test@1234',
      firstName: 'S',
      lastName: 'T',
    };
    await post('/auth/register', stranger);
    const loginRes = await post<{ accessToken: string }>('/auth/login', {
      email: stranger.email,
      password: stranger.password,
    });
    const strangerToken = loginRes.data.accessToken;

    const res = await get(`/organizations/${orgId}/members`, { token: strangerToken });
    expect(res.status).toBe(403);
  });
});

describe('Organizations — Multi-org & Switch', () => {
  it('creates a second organization for the same user', async () => {
    const res = await post<{ id: string; slug: string }>('/organizations', SECOND_ORG, { token });
    expect(res.status).toBe(201);
    // slug starts with the slugified name; may have a suffix if name already taken
    expect(res.data.slug).toMatch(/^beta-traders-ltd/);
    secondOrgId = res.data.id;
  });

  it('lists both orgs', async () => {
    const res = await get<{ id: string }[]>('/organizations', { token });
    expect(res.status).toBe(200);
    const ids = res.data.map((o) => o.id);
    expect(ids).toContain(orgId);
    expect(ids).toContain(secondOrgId);
  });
});

describe('Organizations — Delete', () => {
  it('soft-deletes the second org (owner)', async () => {
    const res = await del(`/organizations/${secondOrgId}`, { token });
    expect(res.status).toBe(200);
  });

  it('deleted org no longer appears in list', async () => {
    const res = await get<{ id: string }[]>('/organizations', { token });
    const ids = res.data.map((o) => o.id);
    expect(ids).not.toContain(secondOrgId);
  });

  it('returns 403 when non-owner tries to delete', async () => {
    // Register another user
    const ts = Date.now();
    const other = {
      email: `other_${ts}@shipflow.dev`,
      password: 'Test@1234',
      firstName: 'O',
      lastName: 'T',
    };
    await post('/auth/register', other);
    const otherLogin = await post<{ accessToken: string }>('/auth/login', {
      email: other.email,
      password: other.password,
    });
    const res = await del(`/organizations/${orgId}`, { token: otherLogin.data.accessToken });
    expect(res.status).toBe(403);
  });

  it('cleans up: deletes the primary test org', async () => {
    const res = await del(`/organizations/${orgId}`, { token });
    expect(res.status).toBe(200);
  });
});
