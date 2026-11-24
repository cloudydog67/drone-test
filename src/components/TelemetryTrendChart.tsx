import React, { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Pause, Play } from 'lucide-react';
import { PanelCard } from './ui/PanelCard';
import {
  DEFAULT_THRESHOLDS,
  type TelemetryHistoryPoint,
} from '../telemetry/telemetryTypes';

export interface TelemetryTrendChartProps {
  history: TelemetryHistoryPoint[];
  paused: boolean;
  onTogglePause: () => void;
}

type ChartMetric = 'rpm' | 'speedKmh' | 'temperatureC' | 'throttlePercent';

const METRIC_OPTIONS: {
  key: ChartMetric;
  label: string;
  unit: string;
  color: string;
  max: number;
}[] = [
  { key: 'rpm', label: 'RPM', unit: 'RPM', color: '#3b82f6', max: DEFAULT_THRESHOLDS.rpmMaxScale },
  { key: 'speedKmh', label: 'Speed', unit: 'km/h', color: '#e5e7eb', max: DEFAULT_THRESHOLDS.speedMaxKmh },
  { key: 'temperatureC', label: 'Temp', unit: '°C', color: '#eab308', max: DEFAULT_THRESHOLDS.tempMaxScaleC },
  { key: 'throttlePercent', label: 'Throttle', unit: '%', color: '#22c55e', max: 100 },
];

export const TelemetryTrendChart: React.FC<TelemetryTrendChartProps> = ({
  history,
  paused,
  onTogglePause,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('rpm');
  const active = METRIC_OPTIONS.find((item) => item.key === selectedMetric) ?? METRIC_OPTIONS[0];

  return (
    <PanelCard
      title="Live Graph"
      testId="telemetry-chart-card"
      badge={
        <div className="chart-toolbar">
          {METRIC_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={
                selectedMetric === option.key ? 'series-chip is-selected' : 'series-chip'
              }
              onClick={() => setSelectedMetric(option.key)}
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            className="chart-pause-btn"
            onClick={onTogglePause}
            aria-label={paused ? 'Resume graph' : 'Pause graph'}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
            <span>{paused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      }
    >
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 10, right: 16, left: -4, bottom: 0 }}>
            <CartesianGrid stroke="#252830" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#6b7280"
              tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'Inter, Segoe UI, sans-serif' }}
              minTickGap={34}
            />
            <YAxis
              domain={[0, active.max]}
              stroke="#6b7280"
              tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'Inter, Segoe UI, sans-serif' }}
              width={48}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#16181d',
                border: '1px solid #303540',
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'Inter, Segoe UI, sans-serif',
                color: '#f9fafb',
              }}
              formatter={(value) => [`${value} ${active.unit}`, active.label]}
            />
            <Line
              type="monotone"
              dataKey={active.key}
              name={active.label}
              stroke={active.color}
              strokeWidth={2.8}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
};
