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
import { broadcast } from './ws-server';

/**
 * 处理单条 Kafka 消息
 * @param payload 解析后的 TraceBatch 数据
 * @param meta    消息元数据 (partition, offset)
 */
export async function handleMessage(payload: TraceBatch, meta: MessageMeta): Promise<void> {
    const { taskId, seq, period, frames } = payload;

    // 实时推送最新帧到前端仪表盘
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
