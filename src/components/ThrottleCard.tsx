import React from 'react';
import { PanelCard } from './ui/PanelCard';
import { MetricBar } from './ui/MetricBar';
import type { TelemetrySnapshot, ThrottleAuthority } from '../telemetry/telemetryTypes';

export interface ThrottleCardProps {
  snapshot: TelemetrySnapshot;
  onSetAuthority: (authority: ThrottleAuthority) => void;
  onSetThrottleUs: (microseconds: number) => void;
}

export const ThrottleCard: React.FC<ThrottleCardProps> = ({
  snapshot,
  onSetAuthority,
  onSetThrottleUs,
}) => {
  const isScreenControl = snapshot.throttleAuthority === 'SW_OVERRIDE';
  const sliderDisabled =
    !isScreenControl || !snapshot.interlocks.armed || snapshot.interlocks.estopLatched;

  return (
    <PanelCard
      title="Throttle"
      testId="throttle-card"
      badge={
        <button
          type="button"
          className={isScreenControl ? 'inline-toggle is-active' : 'inline-toggle'}
          onClick={() => onSetAuthority(isScreenControl ? 'HW_KNOB' : 'SW_OVERRIDE')}
          data-testid="throttle-authority-btn"
        >
          {isScreenControl ? 'Screen Slider' : 'Manual Handle'}
        </button>
      }
    >
      <div className="simple-metric-body">
        <div className="big-value-group">
          <span className="big-number num" data-testid="throttle-pct">
            {snapshot.throttlePercent.toFixed(0)}
          </span>
          <span className="big-unit">%</span>
        </div>

        <div className="bar-section">
          <MetricBar
            percent={snapshot.throttlePercent}
            tone={isScreenControl ? 'warn' : 'accent'}
            height={10}
          />
          <input
            type="range"
            className="tactical-slider"
            min={snapshot.knobIdleUs}
            max={snapshot.throttleMaxUs}
            step={5}
            value={snapshot.throttleUs}
            disabled={sliderDisabled}
            onChange={(event) => onSetThrottleUs(Number(event.target.value))}
            aria-label="Throttle level"
            data-testid="throttle-slider"
          />
          <div className="scale-caption">
            <span>Idle</span>
            <span>Full</span>
          </div>
        </div>

        <div className="card-footer-line">
          <span className="muted-label">Control</span>
          <span className="footer-val" data-testid="throttle-us">
            {isScreenControl
              ? snapshot.interlocks.armed
                ? 'Active on screen'
                : 'Unlock to move'
              : 'Physical handle'}
          </span>
        </div>
      </div>
    </PanelCard>
  );
};
