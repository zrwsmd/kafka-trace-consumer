# 启动说明

## 1. 项目结构

- 根目录 `kafka-trace-consumer`：后端 Kafka 消费服务
- 子目录 `dashboard`：前端实时仪表盘

## 2. 首次安装

先安装根目录依赖：

```powershell
cd e:\wulianwnag\kafka-trace-consumer
npm install
```

再安装前端依赖：

```powershell
cd e:\wulianwnag\kafka-trace-consumer\dashboard
npm install
```

## 3. 启动前检查

启动前请确认：

- Kafka Broker 地址配置正确
- Kafka Topic 配置正确
- 消费者组配置正确

配置文件位置：

- `src/config.ts`

重点配置项：

- `KAFKA_BROKER`
- `TOPIC`
- `GROUP_ID`
- `FROM_BEGINNING`

如果只想消费最新数据，可以把 `FROM_BEGINNING` 改成 `false`。

## 4. 启动后端

打开第一个 PowerShell 窗口，执行：

```powershell
cd e:\wulianwnag\kafka-trace-consumer
npm run dev
```

后端启动后会做两件事：

- 连接 Kafka 并开始消费数据
- 启动 WebSocket 服务 `ws://localhost:3001`

## 5. 启动前端

打开第二个 PowerShell 窗口，执行：

```powershell
cd e:\wulianwnag\kafka-trace-consumer\dashboard
npm run dev
```

正常情况下，前端默认访问地址为：

```text
http://localhost:5173
```

如果 `npm run dev` 启动失败，可以改用下面这个命令：

```powershell
cd e:\wulianwnag\kafka-trace-consumer\dashboard
.\node_modules\.bin\vite.cmd --host 0.0.0.0 --port 5173
```

## 6. 正确启动顺序

建议顺序如下：

1. 先启动后端 `npm run dev`
2. 再启动前端 `dashboard` 下的 `npm run dev`
3. 最后打开浏览器访问 `http://localhost:5173`

## 7. 启动成功后的效果

启动成功后：

- 后端应监听 `3001`
- 前端应监听 `5173`
- 页面可以打开仪表盘
- 页面会显示：
  - 连接状态
  - 实时监控指标
  - 趋势图
  - 最新消费批次
  - 最近消费消息
  - 原始 JSON 数据
  - 按 `ts` 升序排列的消费帧数据表

## 8. 停止服务

分别在两个终端窗口中按：

```text
Ctrl + C
```

## 9. 常见问题

### 9.1 打不开 `http://localhost:5173`

通常有以下几种原因：

- 只启动了后端，没有启动前端
- 前端窗口已经报错退出
- `5173` 端口没有监听

处理方式：

```powershell
cd e:\wulianwnag\kafka-trace-consumer\dashboard
npm run dev
```

如果还不行，再试：

```powershell
cd e:\wulianwnag\kafka-trace-consumer\dashboard
.\node_modules\.bin\vite.cmd --host 0.0.0.0 --port 5173
```

### 9.2 页面打开了，但没有数据

先检查后端是否已经启动：

```powershell
cd e:\wulianwnag\kafka-trace-consumer
npm run dev
```

再检查：

- Kafka 是否有数据写入
- `src/config.ts` 中的 Broker 和 Topic 是否正确
- 页面右上角连接状态是否为 `Connected`

### 9.3 只能看到少量数据

当前前端会缓存最近一部分消费帧，并按 `ts` 升序显示，不再只显示单批次 100 条。

如果需要显示更多，可以继续调大前端缓存上限，位置在：

- `dashboard/src/hooks/useWebSocket.ts`

当前相关配置项：

- `MAX_FRAME_ROWS`

## 10. 常用命令汇总

后端启动：

```powershell
cd e:\wulianwnag\kafka-trace-consumer
npm run dev
```

前端启动：

```powershell
cd e:\wulianwnag\kafka-trace-consumer\dashboard
npm run dev
```

前端备用启动命令：

```powershell
cd e:\wulianwnag\kafka-trace-consumer\dashboard
.\node_modules\.bin\vite.cmd --host 0.0.0.0 --port 5173
```
