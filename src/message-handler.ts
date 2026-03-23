/**
 * 消息处理模块
 *
 * 在 handleMessage() 中实现业务逻辑:
 *   - 存入数据库 (MySQL / MongoDB / InfluxDB)
 *   - 实时推送到前端 WebSocket
 *   - 写入文件
 *   - 数据分析计算
 *
 * payload 数据结构 (TraceBatch):
 * {
 *   taskId: "trace_001",
 *   seq: 1,
 *   period: 1,
 *   frames: [
 *     {
 *       ts: 1,
 *       axis1_position: 12.345,   // 轴1位置 (mm)
 *       axis1_velocity: 3.141,    // 轴1速度 (mm/s)
 *       axis1_torque:   48.200,   // 轴1力矩 (N·m)
 *       axis2_position: 55.678,   // 轴2位置 (mm)
 *       axis2_velocity: 10.234,   // 轴2速度 (mm/s)
 *       motor_rpm:      1487.500, // 电机转速 (RPM)
 *       motor_temp:     64.320,   // 电机温度 (°C)
 *       servo_current:  4.812,    // 伺服电流 (A)
 *       servo_voltage:  48.100,   // 伺服电压 (V)
 *       pressure_bar:   5.230     // 压力 (bar)
 *     },
 *     // ... 共 100 帧
 *   ]
 * }
 */
import { TraceBatch, MessageMeta } from './types';

/**
 * 处理单条 Kafka 消息
 * @param payload 解析后的 TraceBatch 数据
 * @param meta    消息元数据 (partition, offset)
 */
export async function handleMessage(payload: TraceBatch, meta: MessageMeta): Promise<void> {
    const { taskId, seq, period, frames } = payload;

    // ===== 在这里添加你的业务逻辑 =====

    // 示例 1: 打印前几条消息的详细内容 (调试用)
    // if (seq <= 3) {
    //     console.log(`\n[DEBUG] seq=${seq} frames=${frames.length}`);
    //     console.log('  第一帧:', JSON.stringify(frames[0], null, 2));
    // }

    // 示例 2: 存入 MySQL (需要: npm install mysql2 @types/node)
    // import mysql from 'mysql2/promise';
    // const conn = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'trace' });
    // for (const frame of frames) {
    //     await conn.execute(
    //         'INSERT INTO trace_data (task_id, seq, ts, axis1_pos, motor_rpm) VALUES (?,?,?,?,?)',
    //         [taskId, seq, frame.ts, frame.axis1_position, frame.motor_rpm]
    //     );
    // }
    // await conn.end();

    // 示例 3: 存入 MongoDB (需要: npm install mongodb)
    // import { MongoClient } from 'mongodb';
    // const client = new MongoClient('mongodb://localhost:27017');
    // await client.connect();
    // await client.db('trace').collection<TraceBatch>('batches').insertOne(payload);
    // await client.close();

    // 示例 4: 实时推送到前端 WebSocket (需要: npm install ws @types/ws)
    // import { WebSocket, WebSocketServer } from 'ws';
    // wss.clients.forEach((client) => {
    //     if (client.readyState === WebSocket.OPEN) {
    //         client.send(JSON.stringify({ seq, frames }));
    //     }
    // });

    // 示例 5: 写入文件 (每条 batch 一行 JSON)
    // import { appendFileSync } from 'fs';
    // appendFileSync('trace-output.jsonl', JSON.stringify(payload) + '\n');
}
