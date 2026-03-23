import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { DataPoint } from '../types';

interface TrendChartProps {
  title: string;
  data: DataPoint[];
  dataKeys: { key: string; name: string; color: string }[];
  height?: number;
}

export function TrendChart({ title, data, dataKeys, height = 200 }: TrendChartProps) {
  const chartData = useMemo(() => {
    return data.map((d, i) => ({ ...d, idx: i }));
  }, [data]);

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 backdrop-blur">
      <h3 className="text-sm font-medium text-slate-300 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {dataKeys.map((dk) => (
              <linearGradient key={dk.key} id={`grad-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={dk.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={dk.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="idx"
            tick={false}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={50}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: 12,
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          {dataKeys.map((dk) => (
            <Area
              key={dk.key}
              type="monotone"
              dataKey={dk.key}
              name={dk.name}
              stroke={dk.color}
              strokeWidth={2}
              fill={`url(#grad-${dk.key})`}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
