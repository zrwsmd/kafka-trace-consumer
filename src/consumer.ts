/**
 * Kafka Trace Consumer - 主入口
 *
 * 开发模式:
 *   npm run dev
 *
 * 生产模式:
 *   npm run build
 *   npm start
 *
 * 当前职责:
 *   1. 连接 Kafka
 *   2. 消费 TraceBatch 数据
 *   3. 写入 CSV 文件
 *   4. 向前端仪表盘推送实时数据
 *   5. 输出消费统计信息
 */
import config from './config';
import * as kafkaClient from './kafka-client';
import { closeCsvWriter, getCsvOutputDir } from './csv-writer';
import { logger } from './logger';
import { handleMessage } from './message-handler';
import { Stats } from './stats';
import { TraceBatch } from './types';
import {
    broadcast,
    startServer as startWsServer,
    stopServer as stopWsServer,
} from './ws-server';

const stats = new Stats();
let statsTimer: NodeJS.Timeout | null = null;
let isShuttingDown = false;

// =====================================================================
//  主函数
// =====================================================================
async function run(): Promise<void> {
    logger.info('========================================');
    logger.info('Kafka Trace Consumer (TypeScript)');
    logger.info('========================================');
    logger.info(`  Broker:  ${config.KAFKA_BROKER}`);
    logger.info(`  Topic:   ${config.TOPIC}`);
    logger.info(`  Group:   ${config.GROUP_ID}`);
    logger.info(`  From:    ${config.FROM_BEGINNING ? 'from beginning' : 'latest only'}`);
    logger.info(`  CSV:     ${getCsvOutputDir()}`);
    logger.info('');

    try {
        // 0. 启动 WebSocket 服务，供前端仪表盘连接
        startWsServer(3001);
        logger.info('Dashboard: http://localhost:5173');

        // 定时向前端广播消费统计
        statsTimer = setInterval(() => {
            broadcast({ type: 'stats', stats: stats.getSnapshot() });
        }, 1000);

        // 1. 连接 Kafka Broker
        logger.info('Connecting to Kafka broker...');
        await kafkaClient.connect();
        logger.info(`Connected: ${config.KAFKA_BROKER}`);

        // 2. 订阅 Topic
        await kafkaClient.subscribe();
        logger.info(`Subscribed topic: ${config.TOPIC}`);
        logger.info('Start consuming messages... Press Ctrl+C to exit.');

        // 3. 开始消费消息
        await kafkaClient.run(async ({ partition, message }) => {
            try {
                if (!message.value) {
                    logger.warn(`Skip empty message (partition:${partition} offset:${message.offset})`);
                    return;
                }

                const payload: TraceBatch = JSON.parse(message.value.toString());
                const { seq, frames } = payload;

                // 记录消费统计
                stats.record(frames.length);
                stats.printProgress(config.PROGRESS_INTERVAL, partition, message.offset, seq, logger);

                // 处理消息:
                //   - 写入 CSV
                //   - 推送前端
                await handleMessage(payload, { partition, offset: message.offset });
            } catch (error) {
                const err = error as Error;
                logger.error(
                    `Message handling failed (partition:${partition} offset:${message.offset}): ${err.message}`,
                );
            }
        });
    } catch (error) {
        const err = error as Error;
        logger.error(`Startup failed: ${err.message}`);
        logger.error('Checklist:');
        logger.error('  1. Confirm Kafka is running');
        logger.error('  2. Confirm port 9092 is reachable');
        logger.error('  3. Confirm src/config.ts has the correct KAFKA_BROKER');
        await shutdown(1);
    }
}

// =====================================================================
//  优雅退出
// =====================================================================
async function shutdown(exitCode: number = 0): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info('Shutting down...');
    stats.printSummary(logger);

    if (statsTimer) {
        clearInterval(statsTimer);
        statsTimer = null;
    }

    // 先关闭 WebSocket，避免前端继续收到残余数据
    stopWsServer();

    try {
        // 关闭 CSV 写入流，确保缓冲区刷盘
        await closeCsvWriter();
    } catch (error) {
        const err = error as Error;
        logger.error(`Failed to close CSV writer: ${err.message}`);
    }

    try {
        await kafkaClient.disconnect();
        logger.info('Kafka connection closed');
    } catch (error) {
        const err = error as Error;
        logger.error(`Failed to disconnect Kafka client: ${err.message}`);
    }

    logger.info('Process exited');
    process.exit(exitCode);
}

// Ctrl+C 退出
process.on('SIGINT', () => {
    void shutdown(0);
});

// 系统终止信号
process.on('SIGTERM', () => {
    void shutdown(0);
});

// 未捕获异常
process.on('uncaughtException', (error: Error) => {
    logger.error(`Uncaught exception: ${error.message}`);
    void shutdown(1);
});

// 未处理的 Promise 拒绝
process.on('unhandledRejection', (reason: unknown) => {
    logger.error(`Unhandled rejection: ${String(reason)}`);
    void shutdown(1);
});

run().catch((error: Error) => {
    logger.error(`Unexpected startup error: ${error.message}`);
    void shutdown(1);
});
