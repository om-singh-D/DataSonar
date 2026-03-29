'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

export interface QualityDimensions {
  dimension: string;
  score: number;
  fullMark: number;
}

interface QualityRadarProps {
  data: QualityDimensions[];
}

export function QualityRadar({ data }: QualityRadarProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="rgba(72, 71, 74, 0.15)" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#adaaad', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="Quality Score"
          dataKey="score"
          stroke="#85adff"
          fill="#85adff"
          fillOpacity={0.5}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#131315', borderColor: 'rgba(72, 71, 74, 0.15)', borderRadius: '8px', color: '#f9f5f8' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
