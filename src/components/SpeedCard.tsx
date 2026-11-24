import React from 'react';
import { Gauge } from 'lucide-react';
import { PanelCard } from './ui/PanelCard';
import { DEFAULT_THRESHOLDS, type TelemetrySnapshot } from '../telemetry/telemetryTypes';

export interface SpeedCardProps {
  snapshot: TelemetrySnapshot;
}

export const SpeedCard: React.FC<SpeedCardProps> = ({ snapshot }) => {
  const speedPct = Math.max(
    0,
    Math.min(100, (snapshot.speedKmh / DEFAULT_THRESHOLDS.speedMaxKmh) * 100)
  );
  const totalSegments = 16;
  const activeSegments = Math.round((speedPct / 100) * totalSegments);

  return (
    <PanelCard
      title="Speed"
      testId="speed-card"
      badge={<Gauge size={16} className="card-header-icon" />}
    >
      <div className="simple-metric-body">
        <div className="big-value-group">
          <span className="big-number num" data-testid="speed-kmh">
            {snapshot.speedKmh.toFixed(0)}
          </span>
          <span className="big-unit">km/h</span>
        </div>

        <div className="bar-section">
          <div className="segment-bar" aria-hidden="true">
            {Array.from({ length: totalSegments }).map((_, idx) => (
              <span
                key={idx}
                className={
                  idx < activeSegments ? 'segment-cell is-lit' : 'segment-cell'
                }
              />
            ))}
          </div>
          <div className="scale-caption num">
            <span>0</span>
            <span>80</span>
            <span>{DEFAULT_THRESHOLDS.speedMaxKmh} km/h</span>
          </div>
        </div>

        <div className="card-footer-line">
          <span className="muted-label">Airspeed</span>
          <span className="footer-val num" data-testid="speed-knots">
            {snapshot.speedKnots.toFixed(1)} knots
          </span>
        </div>
      </div>
    </PanelCard>
  );
};
