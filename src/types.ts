/**
 * 数据类型定义
 */

/** 单帧传感器数据 */
export interface TraceFrame {
    ts: number;               // 时间戳 (帧序号)
    axis1_position: number;   // 轴1位置 (mm)
    axis1_velocity: number;   // 轴1速度 (mm/s)
    axis1_torque: number;     // 轴1力矩 (N·m)
    axis2_position: number;   // 轴2位置 (mm)
    axis2_velocity: number;   // 轴2速度 (mm/s)
    motor_rpm: number;        // 电机转速 (RPM)
    motor_temp: number;       // 电机温度 (°C)
    servo_current: number;    // 伺服电流 (A)
    servo_voltage: number;    // 伺服电压 (V)
    pressure_bar: number;     // 压力 (bar)
}

/** 每条 Kafka 消息的 payload */
export interface TraceBatch {
    taskId: string;           // 任务ID
    seq: number;              // 包序号 (从1开始)
    period: number;           // 采集周期 ms
    frames: TraceFrame[];     // 帧数组 (默认100帧)
}

/** 消息元数据 */
export interface MessageMeta {
    partition: number;
    offset: string;
}

/** 统计快照 */
export interface StatsSnapshot {
    batchCount: number;
    frameCount: number;
    elapsed: number;
    batchSpeed: string;
    frameSpeed: string;
}
