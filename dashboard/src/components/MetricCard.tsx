import React from 'react';

interface MetricCardProps {
  label: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  color?: string;
}

export function MetricCard({ label, value, unit, icon, color = 'text-cyan-400' }: MetricCardProps) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 backdrop-blur">
      <div className={`p-3 rounded-lg bg-slate-700/50 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400 truncate">{label}</p>
        <p className={`text-2xl font-bold tabular-nums ${color}`}>
          {typeof value === 'number' ? value.toFixed(1) : value}
          <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}
