# Kafka Trace Consumer (TypeScript)

> 控制端数据消费程序 —— 从 Kafka Broker 读取上位机发送的 Trace 轨迹数据

## 目录结构

```
kafka-trace-consumer/
├── package.json              # 依赖配置
├── tsconfig.json             # TypeScript 编译配置
├── README.md
└── src/
    ├── config.ts             # 配置文件  ← 只需修改这里
    ├── types.ts              # 类型定义
    ├── consumer.ts           # 主入口
    ├── kafka-client.ts       # Kafka 客户端封装
    ├── stats.ts              # 统计模块
    └── message-handler.ts   # 消息处理 ← 在这里写业务逻辑
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 修改配置

编辑 `src/config.ts`:

```typescript
KAFKA_BROKER: '你的云服务器公网IP:9092',
```

### 3. 运行

```bash
# 开发模式 (直接运行 ts，不需要编译)
npm run dev

# 生产模式 (先编译再运行)
npm run build
npm start
```

## 数据结构 (TraceBatch)

```typescript
interface TraceBatch {
    taskId: string;
    seq: number;
    period: number;
    frames: TraceFrame[];   // 默认 100 帧/包
}

interface TraceFrame {
    ts: number;
    axis1_position: number;  // 轴1位置 (mm)
    axis1_velocity: number;  // 轴1速度 (mm/s)
    axis1_torque:   number;  // 轴1力矩 (N·m)
    axis2_position: number;  // 轴2位置 (mm)
    axis2_velocity: number;  // 轴2速度 (mm/s)
    motor_rpm:      number;  // 电机转速 (RPM)
    motor_temp:     number;  // 电机温度 (°C)
    servo_current:  number;  // 伺服电流 (A)
    servo_voltage:  number;  // 伺服电压 (V)
    pressure_bar:   number;  // 压力 (bar)
}
```

## 添加业务逻辑

在 `src/message-handler.ts` 中实现 `handleMessage()`:

```typescript
export async function handleMessage(payload: TraceBatch, meta: MessageMeta): Promise<void> {
    const { taskId, seq, frames } = payload;
    
    // 在这里实现: 存库 / 推前端 / 写文件 / 分析
}
```

## 配置说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `KAFKA_BROKER` | Kafka 地址 | 需修改 |
| `TOPIC` | topic 名称 | trace-data |
| `GROUP_ID` | 消费者组 | trace-consumer-group |
| `FROM_BEGINNING` | 从头消费 | true |
| `PROGRESS_INTERVAL` | 进度打印间隔(包) | 100 |

## 常见问题

**Q: 如何只消费最新数据?**
```typescript
// src/config.ts
FROM_BEGINNING: false,
```

**Q: 如何重新从头消费?**
```bash
# 在云服务器上删除消费者组
/opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --delete --group trace-consumer-group
```
