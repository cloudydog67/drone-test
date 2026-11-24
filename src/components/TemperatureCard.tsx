import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill, type PillTone } from './ui/StatusPill';
import { MetricBar } from './ui/MetricBar';
import {
  DEFAULT_THRESHOLDS,
  type TelemetrySnapshot,
  type TemperatureFault,
} from '../telemetry/telemetryTypes';

export interface TemperatureCardProps {
  snapshot: TelemetrySnapshot;
}

function formatFaultLabel(fault: TemperatureFault): string {
  switch (fault) {
    case 'NOMINAL':
      return 'Normal';
    case 'WARN_HIGH':
      return 'High Temp';
    case 'OVERHEAT':
      return 'Overheat';
    case 'OPEN_PROBE':
      return 'Probe Open';
    case 'REVERSED_POLARITY':
      return 'Reversed T+/T-';
  }
}

export const TemperatureCard: React.FC<TemperatureCardProps> = ({ snapshot }) => {
  const { temperatureC, temperatureFault, temperatureTrendCPerSec } = snapshot;

  const tone: PillTone =
    temperatureFault === 'OVERHEAT' ||
    temperatureFault === 'OPEN_PROBE' ||
    temperatureFault === 'REVERSED_POLARITY'
      ? 'danger'
      : temperatureFault === 'WARN_HIGH'
      ? 'warn'
      : 'go';

  const barPercent =
    temperatureC === null
      ? 0
      : Math.max(0, Math.min(100, (temperatureC / DEFAULT_THRESHOLDS.tempMaxScaleC) * 100));

  const warnMarker = (DEFAULT_THRESHOLDS.tempWarnC / DEFAULT_THRESHOLDS.tempMaxScaleC) * 100;
  const critMarker = (DEFAULT_THRESHOLDS.tempCritC / DEFAULT_THRESHOLDS.tempMaxScaleC) * 100;

  return (
    <PanelCard
      title="Cylinder Temp"
      testId="temp-card"
      badge={<StatusPill label={formatFaultLabel(temperatureFault)} tone={tone} dot />}
    >
      <div className="temp-card-content">
        <div className="temp-hero-box">
          <div className="metric-hero-row">
            <span
              className={`metric-hero-xl num text-tone-${tone}`}
              data-testid="temp-value"
            >
              {temperatureC === null ? 'Error' : temperatureC.toFixed(1)}
            </span>
            <span className="metric-unit">°C</span>
          </div>
          <div className="temp-trend num">
            Rate: {temperatureTrendCPerSec >= 0 ? '+' : ''}
            {temperatureTrendCPerSec.toFixed(2)} °C/s
          </div>
        </div>

        <div className="metric-block">
          <MetricBar
            percent={barPercent}
            tone={tone === 'go' ? 'accent' : tone}
            height={9}
            markers={[
              { percent: warnMarker, tone: 'warn', title: `Warning ${DEFAULT_THRESHOLDS.tempWarnC}°C` },
              { percent: critMarker, tone: 'danger', title: `Critical ${DEFAULT_THRESHOLDS.tempCritC}°C` },
            ]}
          />
          <div className="scale-caption num">
            <span>0°C</span>
            <span>Warn {DEFAULT_THRESHOLDS.tempWarnC}°C</span>
            <span>Max {DEFAULT_THRESHOLDS.tempCritC}°C</span>
          </div>
        </div>

        <div className="temp-spec-grid">
          <div className="substat">
            <span className="substat-label">Probe</span>
            <span className="substat-value">MAX6675</span>
          </div>
          <div className="substat">
            <span className="substat-label">Board Limit</span>
            <span className="substat-value num">85 °C</span>
          </div>
        </div>

        {temperatureFault !== 'NOMINAL' && (
          <div className={`inline-alert alert-${tone}`}>
            <AlertTriangle size={14} />
            <span>
              {temperatureFault === 'OPEN_PROBE' && 'Thermocouple disconnected (NaN)'}
              {temperatureFault === 'REVERSED_POLARITY' && 'Temperature dropping — check T+/T- wiring'}
              {temperatureFault === 'WARN_HIGH' && 'High cylinder temperature — reduce throttle'}
              {temperatureFault === 'OVERHEAT' && 'Overheat limit exceeded — cut ignition'}
            </span>
          </div>
        )}
      </div>
    </PanelCard>
  );
};
