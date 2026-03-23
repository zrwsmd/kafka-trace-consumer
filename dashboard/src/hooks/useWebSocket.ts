import { useEffect, useRef, useState, useCallback } from 'react';
import {
  WsMessage,
  StatsSnapshot,
  TraceFrame,
  ConsumedFrameRow,
} from '../types';

const MAX_CHART_FRAMES = 10000;
const WS_URL = 'ws://localhost:3001';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [latest, setLatest] = useState<TraceFrame | null>(null);
  const [chartFrames, setChartFrames] = useState<ConsumedFrameRow[]>([]);
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
        const nextFrames: ConsumedFrameRow[] = msg.batch.frames.map((frame) => ({
          ...frame,
          _time: msg.timestamp,
          _seq: msg.seq,
          _taskId: msg.taskId,
          _partition: msg.meta.partition,
          _offset: msg.meta.offset,
        }));

        setLatest(msg.latest);
        setSeq(msg.seq);
        setTaskId(msg.taskId);
        setChartFrames((prev) => {
          const next = [...prev, ...nextFrames];
          next.sort((a, b) => a.ts - b.ts || a._time - b._time);
          return next.length > MAX_CHART_FRAMES ? next.slice(-MAX_CHART_FRAMES) : next;
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
    latest,
    chartFrames,
    stats,
    seq,
    taskId,
  };
}
