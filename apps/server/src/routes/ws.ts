/**
 * WebSocket routes (사용자 앱 실시간 알림).
 *
 * MVP: 단순 user 단위 broadcast. user_id로 채널 구분.
 *
 * 사용자 앱 → ws://server/ws?token=<jwt> 연결
 * 서버 → 해당 user에 일어나는 이벤트 (티켓 진행, ChangeRequest 상태) broadcast
 *
 * 확장 시 Azure SignalR Service로 이전.
 */

import { FastifyPluginAsync } from 'fastify';
import type { WebSocket } from 'ws';
import { logger } from '../lib/logger.js';

// 단순 in-memory 채널. 단일 인스턴스 가정 (Closed Beta까지).
// Open Beta에서 SignalR 또는 Redis pub/sub로 전환.
const channels = new Map<string, Set<WebSocket>>();

export function broadcastToUser(userId: string, event: unknown): void {
  const sockets = channels.get(userId);
  if (!sockets) return;
  const payload = JSON.stringify(event);
  for (const ws of sockets) {
    try {
      ws.send(payload);
    } catch (err) {
      logger.error({ err, userId }, 'WebSocket send failed');
    }
  }
}

export const wsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { websocket: true }, async (socket, req) => {
    // JWT 검증 (query param token)
    const token = (req.query as any)?.token;
    if (!token) {
      socket.close(1008, 'Token required');
      return;
    }

    let userId: string;
    try {
      const decoded = app.jwt.verify<{ id: string }>(token);
      userId = decoded.id;
    } catch {
      socket.close(1008, 'Invalid token');
      return;
    }

    // 채널 등록
    if (!channels.has(userId)) channels.set(userId, new Set());
    channels.get(userId)!.add(socket);
    req.log.info({ userId }, 'WebSocket connected');

    socket.on('close', () => {
      channels.get(userId)?.delete(socket);
      if (channels.get(userId)?.size === 0) channels.delete(userId);
      req.log.info({ userId }, 'WebSocket disconnected');
    });

    socket.send(JSON.stringify({ type: 'connected', userId }));
  });
};
