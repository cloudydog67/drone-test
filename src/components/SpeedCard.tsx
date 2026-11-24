import React from 'react';
import { PanelCard } from './ui/PanelCard';
import { MetricBar } from './ui/MetricBar';
import { DEFAULT_THRESHOLDS, type TelemetrySnapshot } from '../telemetry/telemetryTypes';

export interface SpeedCardProps {
  snapshot: TelemetrySnapshot;
}

export const SpeedCard: React.FC<SpeedCardProps> = ({ snapshot }) => {
  const speedPct = (snapshot.speedKmh / DEFAULT_THRESHOLDS.speedMaxKmh) * 100;

  return (
    <PanelCard title="Speed" testId="speed-card">
      <div className="simple-metric-body">
        <div className="big-value-group">
          <span className="big-number num" data-testid="speed-kmh">
            {snapshot.speedKmh.toFixed(0)}
          </span>
          <span className="big-unit">km/h</span>
        </div>

        <div className="bar-section">
          <MetricBar percent={speedPct} tone="accent" height={10} />
          <div className="scale-caption num">
            <span>0</span>
            <span>{DEFAULT_THRESHOLDS.speedMaxKmh} km/h</span>
          </div>
        </div>

        <div className="card-footer-line">
          <span className="muted-label">Knots</span>
          <span className="footer-val num" data-testid="speed-knots">
            {snapshot.speedKnots.toFixed(1)} kt
          </span>
        </div>
      </div>
    </PanelCard>
  );
};
