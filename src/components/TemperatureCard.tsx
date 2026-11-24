import React from 'react';
import { AlertTriangle, Thermometer } from 'lucide-react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill, type PillTone } from './ui/StatusPill';
import { MetricBar } from './ui/MetricBar';
import { DEFAULT_THRESHOLDS, type TelemetrySnapshot } from '../telemetry/telemetryTypes';

export interface TemperatureCardProps {
  snapshot: TelemetrySnapshot;
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
      title="CYLINDER TEMP (CHT)"
      testId="temp-card"
      badge={<StatusPill label={temperatureFault.replace('_', ' ')} tone={tone} dot />}
    >
      <div className="temp-card-content">
        <div className="temp-hero-box">
          <div className="metric-hero-row">
            <Thermometer size={24} className={`icon-tone-${tone}`} />
            <span
              className={`metric-hero-xl mono text-tone-${tone}`}
              data-testid="temp-value"
            >
              {temperatureC === null ? 'ERR' : temperatureC.toFixed(1)}
            </span>
            <span className="metric-unit">°C</span>
          </div>
          <div className="temp-trend mono">
            RATE {temperatureTrendCPerSec >= 0 ? '+' : ''}
            {temperatureTrendCPerSec.toFixed(2)} °C/S
          </div>
        </div>

        <div className="metric-block">
          <MetricBar
            percent={barPercent}
            tone={tone === 'go' ? 'accent' : tone}
            height={10}
            markers={[
              { percent: warnMarker, tone: 'warn', title: `WARN ${DEFAULT_THRESHOLDS.tempWarnC}°C` },
              { percent: critMarker, tone: 'danger', title: `CRIT ${DEFAULT_THRESHOLDS.tempCritC}°C` },
            ]}
          />
          <div className="scale-caption mono">
            <span>0°C</span>
            <span>WARN {DEFAULT_THRESHOLDS.tempWarnC}°C</span>
            <span>CRIT {DEFAULT_THRESHOLDS.tempCritC}°C</span>
          </div>
        </div>

        <div className="temp-spec-grid">
          <div className="substat">
            <span className="substat-label">SENSOR</span>
            <span className="substat-value mono">MAX6675</span>
          </div>
          <div className="substat">
            <span className="substat-label">BOARD LIMIT</span>
            <span className="substat-value mono">85°C MAX</span>
          </div>
        </div>

        {temperatureFault !== 'NOMINAL' && (
          <div className={`inline-alert alert-${tone}`}>
            <AlertTriangle size={14} />
            <span>
              {temperatureFault === 'OPEN_PROBE' && 'THERMOCOUPLE OPEN / NaN'}
              {temperatureFault === 'REVERSED_POLARITY' && 'CHECK T+ / T- POLARITY'}
              {temperatureFault === 'WARN_HIGH' && 'HIGH CHT — REDUCE LOAD'}
              {temperatureFault === 'OVERHEAT' && 'OVERHEAT — CUT IGNITION'}
            </span>
          </div>
        )}
      </div>
    </PanelCard>
  );
};
