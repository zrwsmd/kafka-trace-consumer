/**
 * Kafka Trace Consumer - 主入口
 *
 * 开发模式: npx ts-node src/consumer.ts
 * 编译运行: npm run build && npm start
 *
 * 使用步骤:
 *   1. 修改 src/config.ts 中的 KAFKA_BROKER 为云服务器公网IP
 *   2. 在 src/message-handler.ts 中实现业务逻辑
 *   3. 运行上面的命令启动
 */
import config from './config';
import * as kafkaClient from './kafka-client';
import { Stats } from './stats';
import { handleMessage } from './message-handler';
import { TraceBatch } from './types';

const stats = new Stats();

// =====================================================================
//  主函数
// =====================================================================
async function run(): Promise<void> {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║  Kafka Trace Consumer (TypeScript) - 控制端消费程序  ║');
    console.log('╚════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Broker:  ${config.KAFKA_BROKER}`);
    console.log(`  Topic:   ${config.TOPIC}`);
    console.log(`  Group:   ${config.GROUP_ID}`);
    console.log(`  From:    ${config.FROM_BEGINNING ? '从头消费' : '只消费最新'}`);
    console.log('');

    try {
        // 1. 连接
        console.log('正在连接 Kafka Broker...');
        await kafkaClient.connect();
        console.log(`✓ 已连接: ${config.KAFKA_BROKER}`);

        // 2. 订阅
        await kafkaClient.subscribe();
        console.log(`✓ 已订阅 topic: ${config.TOPIC}`);
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('开始消费数据... (按 Ctrl+C 退出)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');

        // 3. 消费
        await kafkaClient.run(async ({ partition, message }) => {
            try {
                const payload: TraceBatch = JSON.parse(message.value!.toString());
                const { seq, frames } = payload;

                stats.record(frames.length);
                stats.printProgress(config.PROGRESS_INTERVAL, partition, message.offset, seq);

                await handleMessage(payload, { partition, offset: message.offset });

            } catch (err) {
                const error = err as Error;
                console.error(
                    `[ERROR] 处理消息失败 (partition:${partition} offset:${message.offset}): ${error.message}`
                );
            }
        });

    } catch (error) {
        const err = error as Error;
        console.error('[FATAL] 启动失败:', err.message);
        console.error('');
        console.error('排查步骤:');
        console.error('  1. 确认云服务器 Kafka 正在运行');
        console.error('  2. 确认安全组已开放 9092 端口');
        console.error('  3. 确认 src/config.ts 中的 KAFKA_BROKER 地址正确');
        process.exit(1);
    }
}

// =====================================================================
//  优雅退出
// =====================================================================
async function shutdown(): Promise<void> {
    console.log('\n正在关闭...');
    stats.printSummary();
    try {
        await kafkaClient.disconnect();
        console.log('✓ 已断开 Kafka 连接');
    } catch {
        // ignore
    }
    console.log('程序已退出');
    process.exit(0);
}

process.on('SIGINT',  () => { void shutdown(); });
process.on('SIGTERM', () => { void shutdown(); });

process.on('uncaughtException', (err: Error) => {
    console.error('[FATAL] 未捕获的异常:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
    console.error('[FATAL] 未处理的 Promise 拒绝:', reason);
    process.exit(1);
});

run().catch((err: Error) => {
    console.error('[FATAL]', err);
    process.exit(1);
});
