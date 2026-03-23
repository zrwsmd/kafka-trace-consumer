import React from 'react';
import {
  Activity,
  BarChart3,
  Cpu,
  Gauge,
  Radio,
  Thermometer,
  Zap,
} from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';
import { MetricCard } from './components/MetricCard';
import { TrendChart } from './components/TrendChart';

export default function App() {
  const { connected, latest, chartFrames, stats, seq, taskId } = useWebSocket();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-cyan-400" />
            <h1 className="text-lg font-bold tracking-tight">Trace Dashboard</h1>
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
        {latest ? (
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
                ? 'Dashboard will keep showing real-time metrics once consumed messages arrive.'
                : 'Make sure the Kafka consumer is running (npm run dev).'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
