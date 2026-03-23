/**
 * WebSocket 服务器
 * 将 Kafka 消费到的数据实时推送给前端仪表盘
 */
import { WebSocketServer, WebSocket } from 'ws';
import { TraceFrame, StatsSnapshot } from './types';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export interface WsDataMessage {
    type: 'data';
    taskId: string;
    seq: number;
    period: number;
    timestamp: number;
    latest: TraceFrame;
    frameCount: number;
}

export interface WsStatsMessage {
    type: 'stats';
    stats: StatsSnapshot;
}

export type WsMessage = WsDataMessage | WsStatsMessage;

/**
 * 启动 WebSocket 服务器
 */
export function startServer(port: number = 3001): void {
    wss = new WebSocketServer({ port });

    wss.on('connection', (ws) => {
        clients.add(ws);
        ws.on('close', () => clients.delete(ws));
        ws.on('error', () => clients.delete(ws));
    });

    console.log(`✓ WebSocket 服务已启动: ws://localhost:${port}`);
}

/**
 * 向所有连接的客户端广播消息
 */
export function broadcast(data: WsMessage): void {
    if (clients.size === 0) return;
    const msg = JSON.stringify(data);
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    }
}

/**
 * 关闭 WebSocket 服务器
 */
export function stopServer(): void {
    if (wss) {
        for (const client of clients) {
            client.close();
        }
        clients.clear();
        wss.close();
        wss = null;
    }
}
