import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from '../src/routes/auth.routes';
import pipelineRoutes from '../src/routes/pipeline.routes';

function createTestApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/pipelines', pipelineRoutes);
  return app;
}

const app = createTestApp();

const email = `pipeline_test_${Date.now()}@datasonar.test`;
const password = 'Test@1234!';
let accessToken: string;
let pipelineId: string;

beforeAll(async () => {
  // Register + login to get a token
  await request(app).post('/api/v1/auth/register').send({
    email,
    password,
    firstName: 'Pipeline',
    lastName: 'Tester',
  });

  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  accessToken = res.body.data.tokens.accessToken;
});

describe('Pipeline API — Integration Tests', () => {
  describe('GET /api/v1/pipelines', () => {
    it('200 — lists pipelines (empty initially)', async () => {
      const res = await request(app)
        .get('/api/v1/pipelines')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.pipelines)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('401 — rejects unauthenticated request', async () => {
      const res = await request(app).get('/api/v1/pipelines');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/pipelines', () => {
    it('403 — VIEWER cannot create pipeline', async () => {
      // New users are VIEWER by default
      const res = await request(app)
        .post('/api/v1/pipelines')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `test-pipeline-${Date.now()}`,
          sourceType: 'api',
          sourceConfig: { endpoint: 'https://api.example.com' },
        });

      // Viewer role should be forbidden
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/pipelines/:id', () => {
    it('404 — returns not found for unknown id', async () => {
      const res = await request(app)
        .get('/api/v1/pipelines/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Pagination', () => {
    it('200 — respects page and limit query params', async () => {
      const res = await request(app)
        .get('/api/v1/pipelines?page=1&limit=5')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pagination.limit).toBe(5);
      expect(res.body.data.pagination.page).toBe(1);
    });
  });
});
