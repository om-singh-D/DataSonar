import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/api/v1/pipelines', () => {
    return HttpResponse.json([
      { id: '1', name: 'Test Pipeline', status: 'Healthy', score: 99 }
    ])
  }),
];
