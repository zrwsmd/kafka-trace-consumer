/**
 * Kafka 客户端封装
 * 基于 kafkajs，提供类型安全的连接、订阅、消费接口
 */
import { Kafka, Consumer, EachMessagePayload, logLevel, CompressionTypes, CompressionCodecs } from 'kafkajs';
import config from './config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const lz4 = require('lz4');

// kafkajs 要求 CompressionCodecs 注册的必须是工厂函数 () => ({ compress, decompress })
(CompressionCodecs as Record<number, unknown>)[CompressionTypes.LZ4] = () => ({
    async compress(buffer: Buffer): Promise<Buffer> {
        return lz4.encode(buffer);
    },
    async decompress(buffer: Buffer): Promise<Buffer> {
        return lz4.decode(buffer);
    },
});

let consumer: Consumer | null = null;

/**
 * 初始化并返回 Kafka Consumer
 */
function createConsumer(): Consumer {
    const kafka = new Kafka({
        clientId: 'trace-consumer-ts',
        brokers: [config.KAFKA_BROKER],
        connectionTimeout: config.CONNECTION_TIMEOUT,
        requestTimeout: config.REQUEST_TIMEOUT,
        logLevel: logLevel.ERROR,   // 只打印 ERROR 级别日志
        retry: {
            retries: 5,
            initialRetryTime: 300,
            factor: 2,
        },
    });

    consumer = kafka.consumer({
        groupId: config.GROUP_ID,
        sessionTimeout: config.SESSION_TIMEOUT,
        heartbeatInterval: config.HEARTBEAT_INTERVAL,
    });

    return consumer;
}

/**
 * 连接到 Kafka Broker
 */
export async function connect(): Promise<void> {
    if (!consumer) createConsumer();
    await consumer!.connect();
}

/**
 * 订阅 topic
 */
export async function subscribe(): Promise<void> {
    await consumer!.subscribe({
        topic: config.TOPIC,
        fromBeginning: config.FROM_BEGINNING,
    });
}

/**
 * 启动消费循环
 * @param onMessage 每条消息的处理回调
 */
export async function run(
    onMessage: (payload: EachMessagePayload) => Promise<void>
): Promise<void> {
    await consumer!.run({
        eachMessage: onMessage,
    });
}

/**
 * 断开连接
 */
export async function disconnect(): Promise<void> {
    if (consumer) {
        await consumer.disconnect();
        consumer = null;
    }
}
