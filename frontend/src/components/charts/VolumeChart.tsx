'use client';

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ComposedChart
} from 'recharts';

export interface VolumeDataPoint {
  timestamp: string;
  volume: number;
  isAnomaly: boolean;
}

interface VolumeChartProps {
  data: VolumeDataPoint[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    anomalyVolume: d.isAnomaly ? d.volume : null, // Plotted as separate scatter series
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="timestamp"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => {
            try {
               return new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } catch (e) {
               return val;
            }
          }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => `${val}`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
          labelFormatter={(val) => {
             try {
                return new Date(val).toLocaleString()
             } catch (e) {
                return val;
             }
          }}
        />
        <Line
          type="monotone"
          dataKey="volume"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Scatter dataKey="anomalyVolume" fill="hsl(var(--destructive))" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
