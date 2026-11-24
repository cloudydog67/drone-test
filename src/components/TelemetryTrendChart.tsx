import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
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

type ChartMetric =
  | 'rpm'
  | 'speedKmh'
  | 'temperatureC'
  | 'throttlePercent'
  | 'fuelPercent'
  | 'windSpeedKmh';

const METRIC_OPTIONS: {
  key: ChartMetric;
  label: string;
  unit: string;
  color: string;
  max: number;
  limit?: number;
}[] = [
  {
    key: 'rpm',
    label: 'RPM',
    unit: 'RPM',
    color: '#38bdf8',
    max: DEFAULT_THRESHOLDS.rpmMaxScale,
    limit: DEFAULT_THRESHOLDS.rpmRedline,
  },
  { key: 'speedKmh', label: 'Speed', unit: 'km/h', color: '#60a5fa', max: DEFAULT_THRESHOLDS.speedMaxKmh },
  {
    key: 'temperatureC',
    label: 'Temp',
    unit: '°C',
    color: '#f59e0b',
    max: DEFAULT_THRESHOLDS.tempMaxScaleC,
    limit: DEFAULT_THRESHOLDS.tempWarnC,
  },
  { key: 'throttlePercent', label: 'Throttle', unit: '%', color: '#22c55e', max: 100 },
  {
    key: 'fuelPercent',
    label: 'Fuel',
    unit: '%',
    color: '#10b981',
    max: 100,
    limit: DEFAULT_THRESHOLDS.fuelLowPercent,
  },
  {
    key: 'windSpeedKmh',
    label: 'Wind',
    unit: 'km/h',
    color: '#38bdf8',
    max: DEFAULT_THRESHOLDS.windMaxScaleKmh,
    limit: DEFAULT_THRESHOLDS.windWarnKmh,
  },
];

export const TelemetryTrendChart: React.FC<TelemetryTrendChartProps> = ({
  history,
  paused,
  onTogglePause,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('rpm');
  const active = METRIC_OPTIONS.find((item) => item.key === selectedMetric) ?? METRIC_OPTIONS[0];

  const numericValues = history
    .map((point) => point[active.key])
    .filter((value): value is number => value !== null);

  const latestRaw = numericValues.length > 0 ? numericValues[numericValues.length - 1] : 0;
  const peakRaw = numericValues.length > 0 ? Math.max(...numericValues) : 0;

  const formatMetric = (val: number) =>
    active.key === 'rpm'
      ? Math.round(val).toLocaleString()
      : val.toFixed(active.key === 'throttlePercent' || active.key === 'fuelPercent' ? 0 : 1);

  return (
    <PanelCard
      title={`Live Graph · ${formatMetric(latestRaw)} ${active.unit}`}
      testId="telemetry-chart-card"
      badge={
        <div className="chart-header-right">
          <span className="chart-peak-tag num">
            High {formatMetric(peakRaw)} {active.unit}
          </span>
          <button
            type="button"
            className="chart-pause-btn"
            onClick={onTogglePause}
            aria-label={paused ? 'Resume graph' : 'Pause graph'}
          >
            {paused ? <Play size={14} /> : <Pause size={14} />}
            <span>{paused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      }
    >
      <div className="chart-panel-stack">
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

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="metricAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={active.color} stopOpacity={0.36} />
                  <stop offset="100%" stopColor={active.color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timeLabel"
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, Segoe UI, sans-serif' }}
                minTickGap={42}
                tickLine={false}
              />
              <YAxis
                domain={[0, active.max]}
                stroke="var(--text-muted)"
                tick={{ fill: 'var(--text-muted)', fontSize: 13, fontFamily: 'Inter, Segoe UI, sans-serif' }}
                width={52}
                tickLine={false}
              />
              {active.limit !== undefined && (
                <ReferenceLine
                  y={active.limit}
                  stroke="#ef4444"
                  strokeOpacity={0.55}
                  strokeDasharray="5 5"
                />
              )}
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 10,
                  fontSize: 15,
                  fontFamily: 'Inter, Segoe UI, sans-serif',
                  color: 'var(--text-primary)',
                  boxShadow: '0 10px 28px rgba(0, 0, 0, 0.35)',
                }}
                formatter={(value) => [`${value} ${active.unit}`, active.label]}
              />
              <Area
                type="monotone"
                dataKey={active.key}
                name={active.label}
                stroke={active.color}
                strokeWidth={3}
                fill="url(#metricAreaFill)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PanelCard>
  );
};
