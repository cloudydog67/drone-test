import React from 'react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill, type PillTone } from './ui/StatusPill';
import { DEFAULT_THRESHOLDS, type TelemetrySnapshot } from '../telemetry/telemetryTypes';

export interface WindCardProps {
  snapshot: TelemetrySnapshot;
}

function compassDirection(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
  return dirs[idx];
}

function getWindStatus(kmh: number): { label: string; tone: PillTone } {
  if (kmh >= DEFAULT_THRESHOLDS.windHighKmh) {
    return { label: 'High', tone: 'danger' };
  }
  if (kmh >= DEFAULT_THRESHOLDS.windWarnKmh) {
    return { label: 'Strong', tone: 'warn' };
  }
  if (kmh >= 12) {
    return { label: 'Breeze', tone: 'accent' };
  }
  return { label: 'Calm', tone: 'go' };
}

export const WindCard: React.FC<WindCardProps> = ({ snapshot }) => {
  const wind = Math.max(0, snapshot.windSpeedKmh);
  const status = getWindStatus(wind);
  const dirLabel = compassDirection(snapshot.windDirectionDegrees);

  return (
    <PanelCard
      title="Wind"
      testId="wind-card"
      badge={<StatusPill label={status.label} tone={status.tone} dot />}
    >
      <div className="wind-vane-layout">
        <div className="fuel-readout-col">
          <div className="compact-hero-row">
            <span
              className={`compact-number num text-tone-${status.tone}`}
              data-testid="wind-kmh"
            >
              {wind.toFixed(0)}
            </span>
            <span className="compact-unit">km/h</span>
          </div>
          <span className="muted-label num">
            {dirLabel} · {(wind / 3.6).toFixed(1)} m/s
          </span>
        </div>

        <svg viewBox="0 0 64 64" className="wind-dial-svg" aria-label={`Wind from ${dirLabel}`}>
          <circle cx="32" cy="32" r="28" fill="#0d1015" stroke="#313b4f" strokeWidth="1.5" />
          <circle cx="32" cy="32" r="19" fill="none" stroke="#222938" strokeWidth="1" />
          <text x="32" y="13" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="700">
            N
          </text>
          <g
            style={{
              transformOrigin: '32px 32px',
              transform: `rotate(${snapshot.windDirectionDegrees}deg)`,
              transition: 'transform 0.35s ease',
            }}
          >
            <line
              x1="32"
              y1="16"
              x2="32"
              y2="48"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <polygon points="32,12 27,21 37,21" fill="#38bdf8" />
            <circle cx="32" cy="32" r="3.2" fill="#ffffff" />
          </g>
        </svg>
      </div>
    </PanelCard>
  );
};
