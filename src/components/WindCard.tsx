import React from 'react';
import { Wind } from 'lucide-react';
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
  const windPct = Math.max(0, Math.min(100, (wind / DEFAULT_THRESHOLDS.windMaxScaleKmh) * 100));
  const dirLabel = compassDirection(snapshot.windDirectionDegrees);

  return (
    <PanelCard
      title="Wind"
      testId="wind-card"
      badge={<StatusPill label={status.label} tone={status.tone} dot />}
    >
      <div className="compact-metric-body">
        <div className="compact-hero-row">
          <Wind size={20} className={`icon-tone-${status.tone}`} />
          <span
            className={`compact-number num text-tone-${status.tone}`}
            data-testid="wind-kmh"
          >
            {wind.toFixed(0)}
          </span>
          <span className="compact-unit">km/h</span>
        </div>

        <div className="fuel-bar-track">
          <div
            className={`fuel-bar-fill fill-${status.tone}`}
            style={{ width: `${windPct}%` }}
          />
        </div>

        <div className="scale-caption num">
          <span>From {dirLabel} ({snapshot.windDirectionDegrees}°)</span>
          <span>{(wind / 3.6).toFixed(1)} m/s</span>
        </div>
      </div>
    </PanelCard>
  );
};
