import React from 'react';
import {
  Activity,
  ArrowUpDown,
  BarChart3,
  CircleDot,
  Cpu,
  Gauge,
  Radio,
  Thermometer,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';
import { MetricCard } from './components/MetricCard';
import { TrendChart } from './components/TrendChart';

const FRAME_COLUMNS = [
  { key: 'ts', label: 'ts' },
  { key: 'axis1_position', label: 'axis1_position' },
  { key: 'axis1_velocity', label: 'axis1_velocity' },
  { key: 'axis1_torque', label: 'axis1_torque' },
  { key: 'axis2_position', label: 'axis2_position' },
  { key: 'axis2_velocity', label: 'axis2_velocity' },
  { key: 'motor_rpm', label: 'motor_rpm' },
  { key: 'motor_temp', label: 'motor_temp' },
  { key: 'servo_current', label: 'servo_current' },
  { key: 'servo_voltage', label: 'servo_voltage' },
  { key: 'pressure_bar', label: 'pressure_bar' },
] as const;

function formatDateTime(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(timestamp);
}

function formatNumber(value: number, fractionDigits: number = 3): string {
  return Number.isFinite(value) ? value.toFixed(fractionDigits) : '-';
}

export default function App() {
  const {
    connected,
    latest,
    latestMessage,
    recentMessages,
    chartFrames,
    tableFrames,
    stats,
    seq,
    taskId,
  } = useWebSocket();

  const latestBatchFrames = latestMessage?.batch.frames ?? [];
  const rawPayload = latestMessage
    ? JSON.stringify(
        {
          timestamp: latestMessage.timestamp,
          meta: latestMessage.meta,
          batch: latestMessage.batch,
        },
        null,
        2,
      )
    : '';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-cyan-400" />
            <h1 className="text-lg font-bold tracking-tight">Trace Monitor</h1>
            {taskId && (
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                {taskId}
              </span>
            )}
            {seq > 0 && (
              <span className="rounded border border-slate-700 px-2 py-0.5 text-xs text-slate-400">
                seq #{seq}
              </span>
            )}
          </div>
          <div className="flex items-center gap-6">
            {stats && (
              <div className="hidden items-center gap-6 text-xs text-slate-400 md:flex">
                <span>
                  <span className="font-medium text-slate-300">
                    {stats.batchCount.toLocaleString()}
                  </span>{' '}
                  batches
                </span>
                <span>
                  <span className="font-medium text-slate-300">
                    {stats.frameCount.toLocaleString()}
                  </span>{' '}
                  frames
                </span>
                <span>
                  <span className="font-medium text-emerald-400">{stats.batchSpeed}</span>{' '}
                  batch/s
                </span>
                <span>
                  <span className="font-medium text-emerald-400">{stats.frameSpeed}</span>{' '}
                  frame/s
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  connected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-500'
                }`}
              />
              <span className="text-xs text-slate-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-6 py-6">
        {latest && latestMessage ? (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              <MetricCard
                label="Motor RPM"
                value={latest.motor_rpm}
                unit="RPM"
                icon={<Gauge className="h-5 w-5" />}
                color="text-cyan-400"
              />
              <MetricCard
                label="Pressure"
                value={latest.pressure_bar}
                unit="bar"
                icon={<Activity className="h-5 w-5" />}
                color="text-violet-400"
              />
              <MetricCard
                label="Motor Temp"
                value={latest.motor_temp}
                unit="degC"
                icon={<Thermometer className="h-5 w-5" />}
                color="text-amber-400"
              />
              <MetricCard
                label="Servo Current"
                value={latest.servo_current}
                unit="A"
                icon={<Zap className="h-5 w-5" />}
                color="text-emerald-400"
              />
              <MetricCard
                label="Axis1 Torque"
                value={latest.axis1_torque}
                unit="N*m"
                icon={<BarChart3 className="h-5 w-5" />}
                color="text-rose-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <TrendChart
                title="Motor RPM"
                data={chartFrames}
                dataKeys={[{ key: 'motor_rpm', name: 'RPM', color: '#22d3ee' }]}
              />
              <TrendChart
                title="Pressure (bar)"
                data={chartFrames}
                dataKeys={[{ key: 'pressure_bar', name: 'Pressure', color: '#a78bfa' }]}
              />
              <TrendChart
                title="Axis 1 Position / Velocity"
                data={chartFrames}
                dataKeys={[
                  { key: 'axis1_position', name: 'Position (mm)', color: '#34d399' },
                  { key: 'axis1_velocity', name: 'Velocity (mm/s)', color: '#60a5fa' },
                ]}
              />
              <TrendChart
                title="Axis 2 Position / Velocity"
                data={chartFrames}
                dataKeys={[
                  { key: 'axis2_position', name: 'Position (mm)', color: '#f472b6' },
                  { key: 'axis2_velocity', name: 'Velocity (mm/s)', color: '#fb923c' },
                ]}
              />
              <TrendChart
                title="Motor Temperature (degC)"
                data={chartFrames}
                dataKeys={[{ key: 'motor_temp', name: 'Temp', color: '#fbbf24' }]}
              />
              <TrendChart
                title="Servo Current / Voltage"
                data={chartFrames}
                dataKeys={[
                  { key: 'servo_current', name: 'Current (A)', color: '#4ade80' },
                  { key: 'servo_voltage', name: 'Voltage (V)', color: '#c084fc' },
                ]}
              />
              <TrendChart
                title="Axis 1 Torque (N*m)"
                data={chartFrames}
                dataKeys={[{ key: 'axis1_torque', name: 'Torque', color: '#fb7185' }]}
                height={200}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
              <section className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 backdrop-blur">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-cyan-400" />
                    <h2 className="text-sm font-semibold text-slate-100">
                      Consumed Frames Ordered By ts
                    </h2>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>{chartFrames.length.toLocaleString()} buffered for charts</p>
                    <p>{tableFrames.length.toLocaleString()} shown in table</p>
                    <p>{latestBatchFrames.length.toLocaleString()} frames in latest batch</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
                    <p className="text-xs text-slate-500">Task ID</p>
                    <p className="mt-1 truncate text-sm font-medium text-slate-100">
                      {latestMessage.taskId}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
                    <p className="text-xs text-slate-500">Seq</p>
                    <p className="mt-1 text-sm font-medium text-slate-100">{latestMessage.seq}</p>
                  </div>
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
                    <p className="text-xs text-slate-500">Period</p>
                    <p className="mt-1 text-sm font-medium text-slate-100">
                      {latestMessage.period} ms
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
                    <p className="text-xs text-slate-500">Partition</p>
                    <p className="mt-1 text-sm font-medium text-slate-100">
                      {latestMessage.meta.partition}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
                    <p className="text-xs text-slate-500">Offset</p>
                    <p className="mt-1 truncate text-sm font-medium text-slate-100">
                      {latestMessage.meta.offset}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3">
                    <p className="text-xs text-slate-500">Consumed At</p>
                    <p className="mt-1 text-sm font-medium text-slate-100">
                      {formatDateTime(latestMessage.timestamp)}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Charts keep a longer 10000-frame history, while the table only shows the latest 2000 frames in ascending ts order.
                </p>

                <div className="mt-4 overflow-hidden rounded-lg border border-slate-700/60">
                  <div className="max-h-[960px] overflow-auto">
                    <table className="min-w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/80 text-slate-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">#</th>
                          {FRAME_COLUMNS.map((column) => (
                            <th key={column.key} className="whitespace-nowrap px-3 py-2 font-medium">
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableFrames.map((frame, index) => (
                            <tr
                              key={`${frame._partition}-${frame._offset}-${frame.ts}-${index}`}
                              className="border-t border-slate-800/80 bg-slate-950/30 transition-colors hover:bg-slate-900/60"
                            >
                              <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                              {FRAME_COLUMNS.map((column) => (
                                <td key={column.key} className="whitespace-nowrap px-3 py-2 tabular-nums">
                                  {formatNumber(frame[column.key])}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <div className="space-y-4">
                <section className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 backdrop-blur">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <h2 className="text-sm font-semibold text-slate-100">Recent Consumed Messages</h2>
                  </div>

                  <div className="space-y-2">
                    {recentMessages.map((message) => (
                      <div
                        key={`${message.meta.partition}-${message.meta.offset}`}
                        className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-slate-100">
                              {message.taskId} / seq #{message.seq}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              partition {message.meta.partition} | offset {message.meta.offset}
                            </p>
                          </div>
                          <span className="rounded bg-slate-800 px-2 py-1 text-xs text-cyan-300">
                            {message.frameCount} frames
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {formatDateTime(message.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 backdrop-blur">
                  <div className="mb-4 flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-violet-400" />
                    <h2 className="text-sm font-semibold text-slate-100">Raw Payload JSON</h2>
                  </div>

                  <pre className="max-h-[560px] overflow-auto rounded-lg border border-slate-700/60 bg-slate-950/70 p-3 text-xs leading-6 text-slate-300">
                    {rawPayload}
                  </pre>
                </section>
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-2 gap-3 text-sm md:hidden">
                <div className="rounded-lg bg-slate-800/60 p-3 text-center">
                  <p className="text-xs text-slate-400">Batches</p>
                  <p className="text-lg font-bold">{stats.batchCount.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-slate-800/60 p-3 text-center">
                  <p className="text-xs text-slate-400">Frames</p>
                  <p className="text-lg font-bold">{stats.frameCount.toLocaleString()}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
            <div className="relative">
              <Radio className="h-16 w-16 text-slate-600" />
              {connected && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
                </span>
              )}
            </div>
            <p className="text-lg text-slate-400">
              {connected ? 'Waiting for consumed data...' : 'Connecting to consumer...'}
            </p>
            <p className="text-center text-sm text-slate-600">
              {connected
                ? 'Dashboard will keep showing metrics and also render the consumed batch payload once messages arrive.'
                : 'Make sure the Kafka consumer is running (npm run dev).'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
