/**
 * 消费统计模块
 */
import { StatsSnapshot } from './types';

export class Stats {
    private batchCount = 0;
    private frameCount = 0;
    private readonly startTime = Date.now();

    /**
     * 记录一条消息消费
     * @param frameCountInBatch 本条消息包含的帧数
     */
    record(frameCountInBatch: number): void {
        this.batchCount++;
        this.frameCount += frameCountInBatch;
    }

    /**
     * 获取当前统计快照
     */
    getSnapshot(): StatsSnapshot {
        const elapsed = (Date.now() - this.startTime) / 1000;
        return {
            batchCount: this.batchCount,
            frameCount: this.frameCount,
            elapsed,
            batchSpeed: elapsed > 0 ? (this.batchCount / elapsed).toFixed(0) : '0',
            frameSpeed: elapsed > 0 ? (this.frameCount / elapsed).toFixed(0) : '0',
        };
    }

    /**
     * 每 interval 包打印一次进度
     */
    printProgress(interval: number, partition: number, offset: string, seq: number): void {
        if (this.batchCount % interval !== 0) return;

        const s = this.getSnapshot();
        const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        console.log(
            `[${time}] ` +
            `已消费: ${s.batchCount.toLocaleString()} 包, ${s.frameCount.toLocaleString()} 帧  |  ` +
            `速度: ${s.batchSpeed} 包/秒, ${s.frameSpeed} 帧/秒  |  ` +
            `partition:${partition} offset:${offset} seq:${seq}`
        );
    }

    /**
     * 打印最终汇总
     */
    printSummary(): void {
        const s = this.getSnapshot();
        console.log('');
        console.log('╔════════════════════════════════════════════════════╗');
        console.log('║                   消费统计                          ║');
        console.log('╚════════════════════════════════════════════════════╝');
        console.log('');
        console.log(`  总包数: ${s.batchCount.toLocaleString()}`);
        console.log(`  总帧数: ${s.frameCount.toLocaleString()}`);
        console.log(`  耗时:   ${s.elapsed.toFixed(1)} 秒 (${(s.elapsed / 60).toFixed(1)} 分钟)`);
        if (s.elapsed > 0) {
            console.log(`  平均速度: ${s.batchSpeed} 包/秒, ${s.frameSpeed} 帧/秒`);
        }
        console.log('');
    }
}
