import React from 'react';
import { Fuel } from 'lucide-react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill, type PillTone } from './ui/StatusPill';
import { DEFAULT_THRESHOLDS, type TelemetrySnapshot } from '../telemetry/telemetryTypes';

export interface FuelCardProps {
  snapshot: TelemetrySnapshot;
}

function getFuelStatus(percent: number): { label: string; tone: PillTone } {
  if (percent <= DEFAULT_THRESHOLDS.fuelCritPercent) {
    return { label: 'Critical', tone: 'danger' };
  }
  if (percent <= DEFAULT_THRESHOLDS.fuelLowPercent) {
    return { label: 'Low', tone: 'warn' };
  }
  return { label: 'Good', tone: 'go' };
}

export const FuelCard: React.FC<FuelCardProps> = ({ snapshot }) => {
  const fuel = Math.max(0, Math.min(100, snapshot.fuelPercent));
  const status = getFuelStatus(fuel);

  return (
    <PanelCard
      title="Fuel"
      testId="fuel-card"
      badge={<StatusPill label={status.label} tone={status.tone} dot />}
    >
      <div className="compact-metric-body">
        <div className="compact-hero-row">
          <Fuel size={20} className={`icon-tone-${status.tone}`} />
          <span
            className={`compact-number num text-tone-${status.tone}`}
            data-testid="fuel-pct"
          >
            {fuel.toFixed(0)}
          </span>
          <span className="compact-unit">%</span>
        </div>

        <div className="fuel-bar-track">
          <div
            className={`fuel-bar-fill fill-${status.tone}`}
            style={{ width: `${fuel}%` }}
          />
          <span
            className="fuel-low-mark"
            style={{ left: `${DEFAULT_THRESHOLDS.fuelLowPercent}%` }}
            title={`Low fuel ${DEFAULT_THRESHOLDS.fuelLowPercent}%`}
          />
        </div>

        <div className="scale-caption">
          <span>Empty</span>
          <span>Full</span>
        </div>
      </div>
    </PanelCard>
  );
};
