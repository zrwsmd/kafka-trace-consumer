import React from 'react';
import {
  Activity,
  Gauge,
  Thermometer,
  Zap,
  BarChart3,
  Radio,
  CircleDot,
  ArrowUpDown,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';
import { MetricCard } from './components/MetricCard';
import { TrendChart } from './components/TrendChart';

export default function App() {
  const { connected, dataPoints, latest, stats, seq, taskId } = useWebSocket();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <h1 className="text-lg font-bold tracking-tight">Trace Monitor</h1>
            {taskId && (
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                {taskId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-6">
            {stats && (
              <div className="hidden md:flex items-center gap-6 text-xs text-slate-400">
                <span>
                  <span className="text-slate-300 font-medium">{stats.batchCount.toLocaleString()}</span> batches
                </span>
                <span>
                  <span className="text-slate-300 font-medium">{stats.frameCount.toLocaleString()}</span> frames
                </span>
                <span>
                  <span className="text-emerald-400 font-medium">{stats.batchSpeed}</span> batch/s
                </span>
                <span>
                  <span className="text-emerald-400 font-medium">{stats.frameSpeed}</span> frame/s
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
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

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Metric Cards Row */}
        {latest ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <MetricCard
                label="Motor RPM"
                value={latest.motor_rpm}
                unit="RPM"
                icon={<Gauge className="w-5 h-5" />}
                color="text-cyan-400"
              />
              <MetricCard
                label="Pressure"
                value={latest.pressure_bar}
                unit="bar"
                icon={<Activity className="w-5 h-5" />}
                color="text-violet-400"
              />
              <MetricCard
                label="Motor Temp"
                value={latest.motor_temp}
                unit="°C"
                icon={<Thermometer className="w-5 h-5" />}
                color="text-amber-400"
              />
              <MetricCard
                label="Servo Current"
                value={latest.servo_current}
                unit="A"
                icon={<Zap className="w-5 h-5" />}
                color="text-emerald-400"
              />
              <MetricCard
                label="Axis1 Torque"
                value={latest.axis1_torque}
                unit="N·m"
                icon={<BarChart3 className="w-5 h-5" />}
                color="text-rose-400"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TrendChart
                title="Motor RPM"
                data={dataPoints}
                dataKeys={[{ key: 'motor_rpm', name: 'RPM', color: '#22d3ee' }]}
              />
              <TrendChart
                title="Pressure (bar)"
                data={dataPoints}
                dataKeys={[{ key: 'pressure_bar', name: 'Pressure', color: '#a78bfa' }]}
              />
              <TrendChart
                title="Axis 1 — Position / Velocity"
                data={dataPoints}
                dataKeys={[
                  { key: 'axis1_position', name: 'Position (mm)', color: '#34d399' },
                  { key: 'axis1_velocity', name: 'Velocity (mm/s)', color: '#60a5fa' },
                ]}
              />
              <TrendChart
                title="Axis 2 — Position / Velocity"
                data={dataPoints}
                dataKeys={[
                  { key: 'axis2_position', name: 'Position (mm)', color: '#f472b6' },
                  { key: 'axis2_velocity', name: 'Velocity (mm/s)', color: '#fb923c' },
                ]}
              />
              <TrendChart
                title="Motor Temperature (°C)"
                data={dataPoints}
                dataKeys={[{ key: 'motor_temp', name: 'Temp', color: '#fbbf24' }]}
              />
              <TrendChart
                title="Servo — Current (A) / Voltage (V)"
                data={dataPoints}
                dataKeys={[
                  { key: 'servo_current', name: 'Current (A)', color: '#4ade80' },
                  { key: 'servo_voltage', name: 'Voltage (V)', color: '#c084fc' },
                ]}
              />
              <TrendChart
                title="Axis 1 Torque (N·m)"
                data={dataPoints}
                dataKeys={[{ key: 'axis1_torque', name: 'Torque', color: '#fb7185' }]}
                height={200}
              />
            </div>

            {/* Footer stats on mobile */}
            {stats && (
              <div className="md:hidden grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">Batches</p>
                  <p className="font-bold text-lg">{stats.batchCount.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3 text-center">
                  <p className="text-slate-400 text-xs">Frames</p>
                  <p className="font-bold text-lg">{stats.frameCount.toLocaleString()}</p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Waiting State */
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="relative">
              <Radio className="w-16 h-16 text-slate-600" />
              {connected && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
                </span>
              )}
            </div>
            <p className="text-slate-400 text-lg">
              {connected ? 'Waiting for data...' : 'Connecting to consumer...'}
            </p>
            <p className="text-slate-600 text-sm">
              {connected
                ? 'Consumer is connected. Data will appear once messages arrive.'
                : 'Make sure the Kafka consumer is running (npm run dev)'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
