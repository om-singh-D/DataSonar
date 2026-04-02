import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface AnomalyEvent {
  id: string;
  sourceId: string;
  message: string;
  timestamp?: string;
  detectedAt?: string;
  severity: number | string;
  anomalyType: string;
}

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<AnomalyEvent[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    let ws: WebSocket;

    if (!wsUrl) {
      console.warn('NEXT_PUBLIC_WS_URL is not set. Realtime alerts are disabled.');
      return;
    }

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to DataSonar real-time feed');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new-anomaly' || data.type === 'new-alert' || data.type === 'quality-update') {
            setAlerts((prev) => [data.payload, ...prev].slice(0, 50));

            if (data.type === 'new-alert' || data.type === 'alert-updated') {
              queryClient.invalidateQueries({ queryKey: ['alerts'] });
            }
            if (data.type === 'new-anomaly' || data.type === 'quality-update') {
              queryClient.invalidateQueries({ queryKey: ['overview'] });
              queryClient.invalidateQueries({ queryKey: ['pipelines'] });
            }
          }
        } catch (e) {
          console.error('Failed to parse WS message', e);
        }
      };

      ws.onclose = () => {
        console.log('WS connection closed.');
      };

      setSocket(ws);
    } catch (err) {
      console.error('Failed to connect to WS', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return { alerts, socket };
}
