import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface AnomalyEvent {
  id: string;
  pipelineId: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<AnomalyEvent[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';
    const newSocket = io(wsUrl, {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('ANOMALY_DETECTED', (anomaly: AnomalyEvent) => {
      setAlerts((prev) => [anomaly, ...prev].slice(0, 100)); // Keep last 100 alerts
      // TODO: Show toast notification here
      console.log('Anomaly received:', anomaly);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return { alerts, socket };
}
