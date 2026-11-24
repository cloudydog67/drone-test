import React from 'react';
import { PanelCard } from './ui/PanelCard';
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
          <div className="ruler-slider-shell">
            <div
              className={
                isScreenControl ? 'ruler-fill ruler-fill-warn' : 'ruler-fill ruler-fill-accent'
              }
              style={{ width: `${snapshot.throttlePercent}%` }}
            />
            <div className="ruler-ticks" aria-hidden="true">
              {Array.from({ length: 21 }).map((_, idx) => (
                <span
                  key={idx}
                  className={idx % 5 === 0 ? 'ruler-tick is-major' : 'ruler-tick'}
                />
              ))}
            </div>
            <input
              type="range"
              className="ruler-input"
              min={snapshot.knobIdleUs}
              max={snapshot.throttleMaxUs}
              step={5}
              value={snapshot.throttleUs}
              disabled={sliderDisabled}
              onChange={(event) => onSetThrottleUs(Number(event.target.value))}
              aria-label="Throttle level"
              data-testid="throttle-slider"
            />
          </div>
          <div className="scale-caption">
            <span>Idle</span>
            <span>50%</span>
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
