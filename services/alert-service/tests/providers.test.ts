import axios from 'axios';

import { SlackProvider } from '../src/providers/slack.provider';
import { WebhookProvider } from '../src/providers/webhook.provider';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const alert = {
  event_id: 'evt-1',
  source_id: 'source-1',
  pipeline_id: 'pipeline-1',
  detected_at: new Date().toISOString(),
  anomaly_types: ['quality'],
  severity: 'high' as const,
  summary: 'Quality drop',
  quality_score: 0.42,
  record_count: 120,
};

describe('providers', () => {
  beforeEach(() => {
    mockedAxios.post.mockResolvedValue({ data: { ok: true } } as never);
  });

  it('formats slack payload using blocks', async () => {
    const provider = new SlackProvider('https://hooks.slack.test/123');
    const sent = await provider.send(alert);

    expect(sent).toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://hooks.slack.test/123',
      expect.objectContaining({ blocks: expect.any(Array) }),
    );
  });

  it('posts raw alert to webhook endpoint', async () => {
    const provider = new WebhookProvider('https://webhook.test/alerts');
    const sent = await provider.send(alert);

    expect(sent).toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledWith('https://webhook.test/alerts', alert);
  });
});
