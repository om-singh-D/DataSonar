import { WebSocketServer, WebSocket } from 'ws';
import { config } from '../config';
import { logger } from '../utils/logger';
import { startRealtimeBridge, stopRealtimeBridge } from './kafka-bridge';

let wss: WebSocketServer;

export function startWebSocketServer(): WebSocketServer {
  wss = new WebSocketServer({ port: config.service.wsPort });

  wss.on('connection', (ws) => {
    logger.info('WebSocket client connected', { clients: wss.clients.size });

    ws.on('close', () => {
      logger.debug('WebSocket client disconnected', { clients: wss.clients.size });
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', payload: { message: 'DataSonar WS connected' } }));
  });

  logger.info(`WebSocket server started on port ${config.service.wsPort}`);

  // Start realtime bridge
  void startRealtimeBridge(broadcast);

  return wss;
}

export function broadcast(type: string, payload: unknown): void {
  if (!wss) return;
  const message = JSON.stringify({ type, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function stopWebSocketServer(): void {
  void stopRealtimeBridge();
  if (wss) wss.close();
}
