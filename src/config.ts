/**
 * Kafka Trace Consumer 配置
 *
 * 修改说明:
 *   KAFKA_BROKER  → 改为你的云服务器公网IP:9092
 *   TOPIC         → 与 Producer 端保持一致，默认 trace-data
 *   FROM_BEGINNING → true=从头消费所有数据, false=只消费新数据
 */

const config = {
    // ---- Kafka 连接 ----
    KAFKA_BROKER: '47.129.128.147:9092',   // 改为你的云服务器公网IP

    TOPIC: 'trace-data',                    // topic 名称
    GROUP_ID: 'trace-consumer-group-4',      // 消费者组ID

    // ---- 消费行为 ----
    FROM_BEGINNING: true,                   // true=从头消费, false=只消费最新数据

    // ---- 连接参数 ----
    CONNECTION_TIMEOUT: 10000,              // 连接超时 ms
    REQUEST_TIMEOUT: 30000,                 // 请求超时 ms
    SESSION_TIMEOUT: 30000,                 // Session 超时 ms
    HEARTBEAT_INTERVAL: 3000,              // 心跳间隔 ms

    // ---- 进度打印 ----
    PROGRESS_INTERVAL: 1,                   // 每消费多少包打印一次进度
} as const;

export default config;
