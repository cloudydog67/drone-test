import React from 'react';
import { Lock, Sliders } from 'lucide-react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill } from './ui/StatusPill';
import { MetricBar } from './ui/MetricBar';
import {
  DEFAULT_THRESHOLDS,
  type TelemetrySnapshot,
  type ThrottleAuthority,
} from '../telemetry/telemetryTypes';

export interface SpeedThrottleCardProps {
  snapshot: TelemetrySnapshot;
  onSetAuthority: (authority: ThrottleAuthority) => void;
  onSetThrottleUs: (microseconds: number) => void;
}

export const SpeedThrottleCard: React.FC<SpeedThrottleCardProps> = ({
  snapshot,
  onSetAuthority,
  onSetThrottleUs,
}) => {
  const speedPct = (snapshot.speedKmh / DEFAULT_THRESHOLDS.speedMaxKmh) * 100;
  const span = Math.max(1, snapshot.throttleMaxUs - snapshot.knobIdleUs);
  const knobPct = ((snapshot.knobUs - snapshot.knobIdleUs) / span) * 100;
  const isSw = snapshot.throttleAuthority === 'SW_OVERRIDE';
  const sliderDisabled =
    !isSw || !snapshot.interlocks.armed || snapshot.interlocks.estopLatched;

  return (
    <PanelCard
      title="Speed & Throttle"
      testId="speed-throttle-card"
      badge={
        <StatusPill
          label={isSw ? 'Software Control' : 'Physical Knob'}
          tone={isSw ? 'warn' : 'neutral'}
        />
      }
    >
      <div className="split-telemetry">
        <div className="metric-block">
          <div className="metric-head">
            <span className="metric-label">Speed</span>
            <span className="metric-secondary num" data-testid="speed-knots">
              {snapshot.speedKnots.toFixed(1)} kt
            </span>
          </div>
          <div className="metric-hero-row">
            <span className="metric-hero num" data-testid="speed-kmh">
              {snapshot.speedKmh.toFixed(1)}
            </span>
            <span className="metric-unit">km/h</span>
          </div>
          <MetricBar percent={speedPct} tone="accent" height={7} />
          <div className="scale-caption num">
            <span>0</span>
            <span>80</span>
            <span>{DEFAULT_THRESHOLDS.speedMaxKmh} km/h</span>
          </div>
        </div>

        <div className="block-divider" />

        <div className="metric-block">
          <div className="metric-head">
            <span className="metric-label">Throttle</span>
            <button
              type="button"
              className={isSw ? 'inline-toggle is-active' : 'inline-toggle'}
              onClick={() => onSetAuthority(isSw ? 'HW_KNOB' : 'SW_OVERRIDE')}
              data-testid="throttle-authority-btn"
            >
              {isSw ? <Sliders size={12} /> : <Lock size={12} />}
              <span>{isSw ? 'Override On' : 'Unlock Override'}</span>
            </button>
          </div>
          <div className="metric-hero-row">
            <span className="metric-hero num" data-testid="throttle-pct">
              {snapshot.throttlePercent.toFixed(0)}
            </span>
            <span className="metric-unit">%</span>
            <span className="metric-pwm num" data-testid="throttle-us">
              {snapshot.throttleUs} µs
            </span>
          </div>

          <MetricBar
            percent={snapshot.throttlePercent}
            tone={isSw ? 'warn' : 'accent'}
            height={7}
            markers={
              isSw
                ? [{ percent: knobPct, tone: 'go', title: `Physical knob ${snapshot.knobUs} µs` }]
                : []
            }
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
            aria-label="Throttle PWM microseconds"
            data-testid="throttle-slider"
          />

          <div className="scale-caption num">
            <span>Idle {snapshot.knobIdleUs} µs</span>
            <span>Knob {snapshot.knobUs} µs</span>
            <span>Max {snapshot.throttleMaxUs} µs</span>
          </div>
        </div>
      </div>
    </PanelCard>
  );
};
