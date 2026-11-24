import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  { key: 'rpm', label: 'RPM', unit: 'RPM', color: '#38bdf8', max: DEFAULT_THRESHOLDS.rpmMaxScale },
  { key: 'speedKmh', label: 'Speed', unit: 'km/h', color: '#e5e7eb', max: DEFAULT_THRESHOLDS.speedMaxKmh },
  { key: 'temperatureC', label: 'Temp', unit: '°C', color: '#f59e0b', max: DEFAULT_THRESHOLDS.tempMaxScaleC },
  { key: 'throttlePercent', label: 'Throttle', unit: '%', color: '#22c55e', max: 100 },
];

export const TelemetryTrendChart: React.FC<TelemetryTrendChartProps> = ({
  history,
  paused,
  onTogglePause,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('rpm');
  const active = METRIC_OPTIONS.find((item) => item.key === selectedMetric) ?? METRIC_OPTIONS[0];
  const latestPoint = history[history.length - 1];
  const latestRaw = latestPoint ? latestPoint[active.key] : 0;
  const latestDisplay =
    latestRaw === null
      ? '--'
      : active.key === 'rpm'
      ? Math.round(latestRaw).toLocaleString()
      : Number(latestRaw).toFixed(active.key === 'throttlePercent' ? 0 : 1);

  return (
    <PanelCard
      title={`Live Graph · ${latestDisplay} ${active.unit}`}
      testId="telemetry-chart-card"
      badge={
        <div className="chart-toolbar">
          <div className="chart-tabs">
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
          </div>
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
          <AreaChart data={history} margin={{ top: 12, right: 16, left: -6, bottom: 0 }}>
            <defs>
              <linearGradient id="metricAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={active.color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={active.color} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#222630" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#4b5563"
              tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'Inter, Segoe UI, sans-serif' }}
              minTickGap={34}
              tickLine={false}
            />
            <YAxis
              domain={[0, active.max]}
              stroke="#4b5563"
              tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'Inter, Segoe UI, sans-serif' }}
              width={48}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121418',
                border: '1px solid #303643',
                borderRadius: 10,
                fontSize: 13,
                fontFamily: 'Inter, Segoe UI, sans-serif',
                color: '#f9fafb',
                boxShadow: '0 10px 28px rgba(0, 0, 0, 0.45)',
              }}
              formatter={(value) => [`${value} ${active.unit}`, active.label]}
            />
            <Area
              type="monotone"
              dataKey={active.key}
              name={active.label}
              stroke={active.color}
              strokeWidth={2.6}
              fill="url(#metricAreaFill)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
};
