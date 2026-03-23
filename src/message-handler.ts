import { appendFramesToCsv } from './csv-writer';
import { TraceBatch, MessageMeta } from './types';
import { broadcast } from './ws-server';

/**
 * Handle one Kafka message:
 * 1. Persist every consumed frame to CSV
 * 2. Broadcast the latest frame to the frontend dashboard
 */
export async function handleMessage(payload: TraceBatch, meta: MessageMeta): Promise<void> {
    const { taskId, seq, period, frames } = payload;

    await appendFramesToCsv(frames);

    if (frames.length > 0) {
        broadcast({
            type: 'data',
            taskId,
            seq,
            period,
            timestamp: Date.now(),
            latest: frames[frames.length - 1],
            frameCount: frames.length,
            batch: payload,
            meta,
        });
    }
}
