import React from 'react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill, type PillTone } from './ui/StatusPill';
import {
  DEFAULT_THRESHOLDS,
  type TelemetrySnapshot,
  type TemperatureFault,
} from '../telemetry/telemetryTypes';

export interface TemperatureCardProps {
  snapshot: TelemetrySnapshot;
}

function formatTempStatus(fault: TemperatureFault): { label: string; tone: PillTone } {
  switch (fault) {
    case 'NOMINAL':
      return { label: 'Safe', tone: 'go' };
    case 'WARN_HIGH':
      return { label: 'Hot', tone: 'warn' };
    case 'OVERHEAT':
      return { label: 'Overheating', tone: 'danger' };
    case 'OPEN_PROBE':
      return { label: 'No Sensor', tone: 'danger' };
    case 'REVERSED_POLARITY':
      return { label: 'Check Wire', tone: 'danger' };
  }
}

export const TemperatureCard: React.FC<TemperatureCardProps> = ({ snapshot }) => {
  const { temperatureC, temperatureFault } = snapshot;
  const status = formatTempStatus(temperatureFault);

  const markerPercent =
    temperatureC === null
      ? 0
      : Math.max(0, Math.min(100, (temperatureC / DEFAULT_THRESHOLDS.tempMaxScaleC) * 100));

  return (
    <PanelCard
      title="Temperature"
      testId="temp-card"
      badge={<StatusPill label={status.label} tone={status.tone} dot />}
    >
      <div className="simple-metric-body">
        <div className="big-value-group">
          <span
            className={`big-number num text-tone-${status.tone}`}
            data-testid="temp-value"
          >
            {temperatureC === null ? '--' : temperatureC.toFixed(0)}
          </span>
          <span className="big-unit">°C</span>
        </div>

        <div className="bar-section">
          <div className="thermal-spectrum">
            <div className="thermal-gradient" />
            {temperatureC !== null && (
              <span
                className="thermal-pointer"
                style={{ left: `${markerPercent}%` }}
              />
            )}
          </div>
          <div className="scale-caption num">
            <span>Safe</span>
            <span>Hot {DEFAULT_THRESHOLDS.tempWarnC}°</span>
            <span>Limit {DEFAULT_THRESHOLDS.tempCritC}°</span>
          </div>
        </div>

        <div className="card-footer-line">
          <span className="muted-label">Engine Heat</span>
          <span className={`footer-val text-tone-${status.tone}`}>{status.label}</span>
        </div>
      </div>
    </PanelCard>
  );
};
