import React from 'react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill, type PillTone } from './ui/StatusPill';
import { DEFAULT_THRESHOLDS, type TelemetrySnapshot } from '../telemetry/telemetryTypes';

export interface RpmGaugeCardProps {
  snapshot: TelemetrySnapshot;
}

const CENTER = 100;
const START_ANGLE = 135;
const SWEEP_ANGLE = 270;

function polar(deg: number, radius: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

function arcPath(radius: number, startDeg: number, endDeg: number): string {
  const start = polar(endDeg, radius);
  const end = polar(startDeg, radius);
  const largeArc = endDeg - startDeg <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function formatPhase(phase: TelemetrySnapshot['enginePhase']): { label: string; tone: PillTone } {
  switch (phase) {
    case 'STOPPED':
      return { label: 'Off', tone: 'neutral' };
    case 'CRANKING':
      return { label: 'Starting', tone: 'accent' };
    case 'IDLE':
      return { label: 'Idle', tone: 'go' };
    case 'RUNNING':
      return { label: 'Running', tone: 'go' };
    case 'WOT':
      return { label: 'Max Power', tone: 'warn' };
    case 'E-STOP':
      return { label: 'Stopped', tone: 'danger' };
  }
}

export const RpmGaugeCard: React.FC<RpmGaugeCardProps> = ({ snapshot }) => {
  const maxRpm = DEFAULT_THRESHOLDS.rpmMaxScale;
  const redline = DEFAULT_THRESHOLDS.rpmRedline;
  const ratio = Math.max(0, Math.min(1, snapshot.rpm / maxRpm));
  const needleAngle = START_ANGLE + ratio * SWEEP_ANGLE;
  const redStart = START_ANGLE + (redline / maxRpm) * SWEEP_ANGLE;
  const redEnd = START_ANGLE + SWEEP_ANGLE;
  const inRedline = snapshot.rpm >= redline;
  const phase = formatPhase(snapshot.enginePhase);

  return (
    <PanelCard
      title="RPM"
      testId="rpm-card"
      badge={<StatusPill label={phase.label} tone={phase.tone} dot />}
    >
      <div className="rpm-simple-body">
        <svg viewBox="0 0 200 170" className="rpm-arc-svg" aria-label="Engine RPM">
          <path
            d={arcPath(74, START_ANGLE, START_ANGLE + SWEEP_ANGLE)}
            fill="none"
            stroke="#272b33"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d={arcPath(74, redStart, redEnd)}
            fill="none"
            stroke="rgba(239, 68, 68, 0.35)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {ratio > 0.005 && (
            <path
              d={arcPath(74, START_ANGLE, needleAngle)}
              fill="none"
              stroke={inRedline ? '#ef4444' : '#3b82f6'}
              strokeWidth="12"
              strokeLinecap="round"
            />
          )}
          <text
            x={CENTER}
            y={CENTER + 4}
            textAnchor="middle"
            fill={inRedline ? '#f87171' : '#f9fafb'}
            fontSize="30"
            fontWeight="700"
            fontFamily="Inter, Segoe UI, sans-serif"
            data-testid="rpm-value"
          >
            {snapshot.rpm.toLocaleString()}
          </text>
          <text
            x={CENTER}
            y={CENTER + 26}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="12"
            fontWeight="500"
            fontFamily="Inter, Segoe UI, sans-serif"
          >
            RPM
          </text>
        </svg>

        <div className="card-footer-line">
          <span className="muted-label">Peak</span>
          <span className="footer-val num">{snapshot.peakRpm.toLocaleString()} RPM</span>
        </div>
      </div>
    </PanelCard>
  );
};
