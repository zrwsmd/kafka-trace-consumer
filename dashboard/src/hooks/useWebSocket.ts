import { useEffect, useRef, useState, useCallback } from 'react';
import {
  WsMessage,
  WsDataMessage,
  DataPoint,
  StatsSnapshot,
  TraceFrame,
  ConsumedFrameRow,
} from '../types';

const MAX_POINTS = 300;
const MAX_RECENT_MESSAGES = 50;
const MAX_FRAME_ROWS = 2000;
const WS_URL = 'ws://localhost:3001';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [latest, setLatest] = useState<TraceFrame | null>(null);
  const [latestMessage, setLatestMessage] = useState<WsDataMessage | null>(null);
  const [recentMessages, setRecentMessages] = useState<WsDataMessage[]>([]);
  const [consumedFrames, setConsumedFrames] = useState<ConsumedFrameRow[]>([]);
  const [stats, setStats] = useState<StatsSnapshot | null>(null);
  const [seq, setSeq] = useState(0);
  const [taskId, setTaskId] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onclose = () => {
      setConnected(false);
      reconnectTimer.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => ws.close();

    ws.onmessage = (event) => {
      const msg: WsMessage = JSON.parse(event.data);

      if (msg.type === 'data') {
        const point: DataPoint = { ...msg.latest, _time: msg.timestamp };
        const nextFrames: ConsumedFrameRow[] = msg.batch.frames.map((frame) => ({
          ...frame,
          _time: msg.timestamp,
          _seq: msg.seq,
          _taskId: msg.taskId,
          _partition: msg.meta.partition,
          _offset: msg.meta.offset,
        }));

        setLatest(msg.latest);
        setLatestMessage(msg);
        setSeq(msg.seq);
        setTaskId(msg.taskId);
        setDataPoints((prev) => {
          const next = [...prev, point];
          return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
        });
        setConsumedFrames((prev) => {
          const next = [...prev, ...nextFrames];
          next.sort((a, b) => a.ts - b.ts || a._time - b._time);
          return next.length > MAX_FRAME_ROWS ? next.slice(-MAX_FRAME_ROWS) : next;
        });
        setRecentMessages((prev) => {
          const next = [msg, ...prev];
          return next.slice(0, MAX_RECENT_MESSAGES);
        });
      } else if (msg.type === 'stats') {
        setStats(msg.stats);
      }
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return {
    connected,
    dataPoints,
    latest,
    latestMessage,
    recentMessages,
    consumedFrames,
    stats,
    seq,
    taskId,
  };
}
