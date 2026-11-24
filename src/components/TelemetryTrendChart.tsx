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

export const TelemetryTrendChart: React.FC<TelemetryTrendChartProps> = ({
  history,
  paused,
  onTogglePause,
}) => {
  const [showRpm, setShowRpm] = useState(true);
  const [showSpeed, setShowSpeed] = useState(true);
  const [showTemp, setShowTemp] = useState(true);
  const [showThrottle, setShowThrottle] = useState(true);

  return (
    <PanelCard
      title="LIVE TELEMETRY TREND"
      testId="telemetry-chart-card"
      badge={
        <div className="chart-toolbar">
          <button
            type="button"
            className={showRpm ? 'series-chip active-rpm' : 'series-chip'}
            onClick={() => setShowRpm((v) => !v)}
          >
            RPM
          </button>
          <button
            type="button"
            className={showSpeed ? 'series-chip active-speed' : 'series-chip'}
            onClick={() => setShowSpeed((v) => !v)}
          >
            SPEED
          </button>
          <button
            type="button"
            className={showTemp ? 'series-chip active-temp' : 'series-chip'}
            onClick={() => setShowTemp((v) => !v)}
          >
            TEMP
          </button>
          <button
            type="button"
            className={showThrottle ? 'series-chip active-thr' : 'series-chip'}
            onClick={() => setShowThrottle((v) => !v)}
          >
            THR %
          </button>
          <button
            type="button"
            className="chart-pause-btn"
            onClick={onTogglePause}
            aria-label={paused ? 'Resume chart' : 'Pause chart'}
          >
            {paused ? <Play size={12} /> : <Pause size={12} />}
            <span>{paused ? 'RESUME' : 'PAUSE'}</span>
          </button>
        </div>
      }
    >
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 8, right: 14, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#252a33" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              minTickGap={28}
            />
            <YAxis
              yAxisId="rpm"
              domain={[0, DEFAULT_THRESHOLDS.rpmMaxScale]}
              stroke="#38bdf8"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
              width={40}
            />
            <YAxis
              yAxisId="aux"
              orientation="right"
              domain={[0, DEFAULT_THRESHOLDS.tempMaxScaleC]}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              width={36}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111318',
                border: '1px solid #334155',
                borderRadius: 8,
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#f8fafc',
              }}
            />
            {showRpm && (
              <Line
                yAxisId="rpm"
                type="monotone"
                dataKey="rpm"
                name="RPM"
                stroke="#38bdf8"
                strokeWidth={2.2}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {showSpeed && (
              <Line
                yAxisId="aux"
                type="monotone"
                dataKey="speedKmh"
                name="SPEED km/h"
                stroke="#a78bfa"
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {showTemp && (
              <Line
                yAxisId="aux"
                type="monotone"
                dataKey="temperatureC"
                name="TEMP °C"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
            {showThrottle && (
              <Line
                yAxisId="aux"
                type="monotone"
                dataKey="throttlePercent"
                name="THR %"
                stroke="#22c55e"
                strokeWidth={1.8}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PanelCard>
  );
};
