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
import { logger } from './logger';

const stats = new Stats();

// =====================================================================
//  主函数
// =====================================================================
async function run(): Promise<void> {
    logger.info('╔════════════════════════════════════════════════════╗');
    logger.info('║  Kafka Trace Consumer (TypeScript) - 控制端消费程序  ║');
    logger.info('╚════════════════════════════════════════════════════╝');
    logger.info('');
    logger.info(`  Broker:  ${config.KAFKA_BROKER}`);
    logger.info(`  Topic:   ${config.TOPIC}`);
    logger.info(`  Group:   ${config.GROUP_ID}`);
    logger.info(`  From:    ${config.FROM_BEGINNING ? '从头消费' : '只消费最新'}`);
    logger.info('');

    try {
        // 1. 连接
        logger.info('正在连接 Kafka Broker...');
        await kafkaClient.connect();
        logger.info(`✓ 已连接: ${config.KAFKA_BROKER}`);

        // 2. 订阅
        await kafkaClient.subscribe();
        logger.info(`✓ 已订阅 topic: ${config.TOPIC}`);
        logger.info('');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('开始消费数据... (按 Ctrl+C 退出)');
        logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        logger.info('');

        // 3. 消费
        await kafkaClient.run(async ({ partition, message }) => {
            try {
                const payload: TraceBatch = JSON.parse(message.value!.toString());
                const { seq, frames } = payload;

                stats.record(frames.length);
                stats.printProgress(config.PROGRESS_INTERVAL, partition, message.offset, seq, logger);

                await handleMessage(payload, { partition, offset: message.offset });

            } catch (err) {
                const error = err as Error;
                logger.error(
                    `处理消息失败 (partition:${partition} offset:${message.offset}): ${error.message}`
                );
            }
        });

    } catch (error) {
        const err = error as Error;
        logger.error(`启动失败: ${err.message}`);
        logger.error('排查步骤:');
        logger.error('  1. 确认云服务器 Kafka 正在运行');
        logger.error('  2. 确认安全组已开放 9092 端口');
        logger.error('  3. 确认 src/config.ts 中的 KAFKA_BROKER 地址正确');
        process.exit(1);
    }
}

// =====================================================================
//  优雅退出
// =====================================================================
async function shutdown(): Promise<void> {
    logger.info('正在关闭...');
    stats.printSummary(logger);
    try {
        await kafkaClient.disconnect();
        logger.info('✓ 已断开 Kafka 连接');
    } catch {
        // ignore
    }
    logger.info('程序已退出');
    process.exit(0);
}

process.on('SIGINT',  () => { void shutdown(); });
process.on('SIGTERM', () => { void shutdown(); });

process.on('uncaughtException', (err: Error) => {
    logger.error(`未捕获的异常: ${err.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
    logger.error(`未处理的 Promise 拒绝: ${String(reason)}`);
    process.exit(1);
});

run().catch((err: Error) => {
    logger.error(`启动异常: ${err.message}`);
    process.exit(1);
});
