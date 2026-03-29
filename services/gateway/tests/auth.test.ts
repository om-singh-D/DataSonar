import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from '../src/routes/auth.routes';

// Minimal Express app for testing (no swagger, no morgan noise)
function createTestApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true, legacyHeaders: false })
  );
  app.use('/api/v1/auth', authRoutes);
  return app;
}

const app = createTestApp();

// Unique email per test run to avoid collisions
const uniqueEmail = `testuser_${Date.now()}@datasonar.test`;
const password = 'Test@1234!';
let accessToken: string;
let refreshToken: string;

describe('Auth Service — Integration Tests', () => {
  describe('POST /api/v1/auth/register', () => {
    it('201 — registers a new user and returns tokens', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: uniqueEmail,
        password,
        firstName: 'Test',
        lastName: 'User',
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(uniqueEmail);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
      // Password must not leak
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('409 — rejects duplicate email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: uniqueEmail,
        password,
        firstName: 'Test',
        lastName: 'User',
      });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('error');
    });

    it('400 — rejects weak password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: `weak_${Date.now()}@datasonar.test`,
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('400 — rejects invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'not-an-email',
        password,
        firstName: 'Test',
        lastName: 'User',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('200 — returns tokens for valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: uniqueEmail,
        password,
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      accessToken = res.body.data.tokens.accessToken;
      refreshToken = res.body.data.tokens.refreshToken;
      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
    });

    it('401 — rejects wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: uniqueEmail,
        password: 'WrongPassword!1',
      });

      expect(res.status).toBe(401);
    });

    it('401 — rejects unknown email', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@nowhere.com',
        password,
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('200 — issues new access token from valid refresh token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.tokens.accessToken).toBeTruthy();
    });

    it('401 — rejects invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'garbage.token.here' });

      expect(res.status).toBe(401);
    });

    it('400 — rejects missing refresh token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('200 — returns user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(uniqueEmail);
    });

    it('401 — rejects missing token', async () => {
      const res = await request(app).get('/api/v1/auth/profile');
      expect(res.status).toBe(401);
    });

    it('401 — rejects malformed token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/api-keys', () => {
    it('201 — creates an API key and returns rawKey once', async () => {
      const res = await request(app)
        .post('/api/v1/auth/api-keys')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Test Key', scopes: ['read'] });

      expect(res.status).toBe(201);
      expect(res.body.data.rawKey).toMatch(/^ds_/);
      expect(res.body.data.prefix).toBeDefined();
    });

    it('401 — requires auth to create API key', async () => {
      const res = await request(app)
        .post('/api/v1/auth/api-keys')
        .send({ name: 'Test Key', scopes: ['read'] });

      expect(res.status).toBe(401);
    });
  });
});
