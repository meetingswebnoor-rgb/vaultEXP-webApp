'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ChartDataPoint {
  label: string;
  value: number;
}

interface NeonLineChartProps {
  data: ChartDataPoint[];
  color?: string;
  height?: number | string;
  showGrid?: boolean;
  valueFormatter?: (val: number) => string;
}

export function NeonLineChart({
  data,
  color = '#00FF88', // vault-green default
  height = 300,
  showGrid = true,
  valueFormatter = (val: number) => `$${val.toLocaleString()}`
}: NeonLineChartProps) {
  // Dynamic filter ID based on the color to avoid collisions
  const filterId = `neonGlow-${color.replace('#', '')}`;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
          <defs>
            {/* Custom SVG Filter for the Neon Glow effect */}
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              {/* Layer the blur to intensify the neon core */}
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(255,255,255,0.06)" 
            />
          )}

          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500 }}
            dy={10}
            minTickGap={20}
          />

          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 500 }}
            tickFormatter={(val) => {
              if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
              if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
              return `$${val}`;
            }}
            dx={-10}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 20, 16, 0.85)',
              border: `1px solid ${color}40`,
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              fontWeight: 600,
              boxShadow: `0 8px 32px ${color}25`,
            }}
            itemStyle={{ color }}
            formatter={(value: any) => [valueFormatter(Number(value)), 'Value']}
            labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px', fontSize: '12px' }}
            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={false}
            activeDot={{
              r: 6,
              fill: '#fff',
              stroke: color,
              strokeWidth: 2,
              filter: `url(#${filterId})`
            }}
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
            filter={`url(#${filterId})`} // Apply neon glow directly to the line path
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
