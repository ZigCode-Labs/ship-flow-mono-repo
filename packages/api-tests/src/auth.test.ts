import { describe, it, expect, beforeAll } from 'vitest';
import { post } from './client';
import { TEST_USER } from './fixtures';

// Shared token written to a module-level var so organization tests can import it
export let accessToken = '';
export let userId = '';

describe('Auth — Register & Login', () => {
  it('registers a new user (or accepts existing)', async () => {
    const res = await post('/auth/register', TEST_USER);
    // 201 on fresh register, 400 "Email already in use" is also fine for repeat runs
    expect([201, 400]).toContain(res.status);
  });

  it('rejects register with short password', async () => {
    const res = await post('/auth/register', { ...TEST_USER, password: '123' });
    expect(res.status).toBe(400);
  });

  it('rejects register with invalid email', async () => {
    const res = await post('/auth/register', { ...TEST_USER, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('logs in and returns tokens', async () => {
    const res = await post<{
      accessToken: string;
      refreshToken: string;
      user: { id: string; email: string };
    }>('/auth/login', { email: TEST_USER.email, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.data.accessToken).toBeTruthy();
    expect(res.data.refreshToken).toBeTruthy();
    expect(res.data.user.email).toBe(TEST_USER.email);

    accessToken = res.data.accessToken;
    userId = res.data.user.id;
  });

  it('rejects login with wrong password', async () => {
    const res = await post('/auth/login', { email: TEST_USER.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('rejects login with unknown email', async () => {
    const res = await post('/auth/login', { email: 'nobody@example.com', password: 'Test@1234' });
    expect(res.status).toBe(401);
  });

  it('refreshes tokens', async () => {
    // Get a fresh refresh token first
    const loginRes = await post<{ accessToken: string; refreshToken: string }>('/auth/login', {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });
    const res = await post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken: loginRes.data.refreshToken,
    });
    expect(res.status).toBe(200);
    expect(res.data.accessToken).toBeTruthy();
  });

  it('rejects requests to protected routes without a token', async () => {
    const res = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:9000'}/organizations`);
    expect(res.status).toBe(401);
  });
});
