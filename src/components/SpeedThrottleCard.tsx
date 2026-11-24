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
      title="SPEED & THROTTLE"
      testId="speed-throttle-card"
      badge={
        <StatusPill
          label={isSw ? 'SW OVERRIDE' : 'HW KNOB'}
          tone={isSw ? 'warn' : 'accent'}
        />
      }
    >
      <div className="split-telemetry">
        <div className="metric-block">
          <div className="metric-head">
            <span className="metric-label">GROUND / AIR SPEED</span>
            <span className="metric-secondary mono" data-testid="speed-knots">
              {snapshot.speedKnots.toFixed(1)} KT
            </span>
          </div>
          <div className="metric-hero-row">
            <span className="metric-hero mono" data-testid="speed-kmh">
              {snapshot.speedKmh.toFixed(1)}
            </span>
            <span className="metric-unit">KM/H</span>
          </div>
          <MetricBar percent={speedPct} tone="accent" height={7} />
          <div className="scale-caption mono">
            <span>0</span>
            <span>80</span>
            <span>{DEFAULT_THRESHOLDS.speedMaxKmh} KM/H</span>
          </div>
        </div>

        <div className="block-divider" />

        <div className="metric-block">
          <div className="metric-head">
            <span className="metric-label">THROTTLE SERVO</span>
            <button
              type="button"
              className={isSw ? 'inline-toggle is-active' : 'inline-toggle'}
              onClick={() => onSetAuthority(isSw ? 'HW_KNOB' : 'SW_OVERRIDE')}
              data-testid="throttle-authority-btn"
            >
              {isSw ? <Sliders size={11} /> : <Lock size={11} />}
              <span>{isSw ? 'SW ACTIVE' : 'SW LOCKED'}</span>
            </button>
          </div>
          <div className="metric-hero-row">
            <span className="metric-hero mono" data-testid="throttle-pct">
              {snapshot.throttlePercent.toFixed(0)}
            </span>
            <span className="metric-unit">%</span>
            <span className="metric-pwm mono" data-testid="throttle-us">
              {snapshot.throttleUs} µS
            </span>
          </div>

          <MetricBar
            percent={snapshot.throttlePercent}
            tone={isSw ? 'warn' : 'accent'}
            height={7}
            markers={
              isSw
                ? [{ percent: knobPct, tone: 'go', title: `HW KNOB ${snapshot.knobUs} µS` }]
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

          <div className="scale-caption mono">
            <span>IDLE {snapshot.knobIdleUs}</span>
            <span>KNOB {snapshot.knobUs}</span>
            <span>MAX {snapshot.throttleMaxUs}</span>
          </div>
        </div>
      </div>
    </PanelCard>
  );
};
