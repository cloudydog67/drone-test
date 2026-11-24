import React from 'react';
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
      <div className="fuel-sight-layout">
        <div className="fuel-readout-col">
          <div className="compact-hero-row">
            <span
              className={`compact-number num text-tone-${status.tone}`}
              data-testid="fuel-pct"
            >
              {fuel.toFixed(0)}
            </span>
            <span className="compact-unit">%</span>
          </div>
          <span className="muted-label">Tank Level</span>
        </div>

        <div className="sight-glass" aria-label={`Fuel tank ${fuel.toFixed(0)} percent`}>
          <div
            className={`sight-liquid liquid-${status.tone}`}
            style={{ height: `${fuel}%` }}
          >
            <span className="sight-meniscus" />
          </div>
          <span className="sight-mark" style={{ bottom: '75%' }} />
          <span className="sight-mark" style={{ bottom: '50%' }} />
          <span className="sight-mark sight-mark-low" style={{ bottom: '25%' }} />
        </div>
      </div>
    </PanelCard>
  );
};
