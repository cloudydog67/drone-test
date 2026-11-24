import React from 'react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill, type PillTone } from './ui/StatusPill';
import { DEFAULT_THRESHOLDS, type TelemetrySnapshot } from '../telemetry/telemetryTypes';

export interface RpmGaugeCardProps {
  snapshot: TelemetrySnapshot;
}

const CENTER = 110;
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
  const tipPos = polar(needleAngle, 78);

  return (
    <PanelCard
      title="RPM"
      testId="rpm-card"
      badge={<StatusPill label={phase.label} tone={phase.tone} dot />}
    >
      <div className="rpm-simple-body">
        <svg viewBox="0 0 220 192" className="rpm-arc-svg" aria-label="Engine RPM">
          <defs>
            <linearGradient id="rpmArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="65%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>

          <circle cx={CENTER} cy={CENTER} r="94" fill="#101216" stroke="#22262f" strokeWidth="1" />

          {Array.from({ length: 21 }).map((_, idx) => {
            const tickRatio = idx / 20;
            const deg = START_ANGLE + tickRatio * SWEEP_ANGLE;
            const major = idx % 4 === 0;
            const isRed = tickRatio * maxRpm >= redline;
            const p1 = polar(deg, 90);
            const p2 = polar(deg, major ? 82 : 86);
            return (
              <line
                key={idx}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isRed ? '#ef4444' : major ? '#64748b' : '#2d3340'}
                strokeWidth={major ? 1.8 : 1}
              />
            );
          })}

          {[0, 2, 4, 6, 8, 10].map((val) => {
            const deg = START_ANGLE + (val / 10) * SWEEP_ANGLE;
            const pos = polar(deg, 64);
            return (
              <text
                key={val}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={val >= 8 ? '#f87171' : '#6b7280'}
                fontSize="10"
                fontWeight="600"
                fontFamily="Inter, Segoe UI, sans-serif"
              >
                {val}k
              </text>
            );
          })}

          <path
            d={arcPath(78, START_ANGLE, START_ANGLE + SWEEP_ANGLE)}
            fill="none"
            stroke="#20242c"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d={arcPath(78, redStart, redEnd)}
            fill="none"
            stroke="rgba(239, 68, 68, 0.32)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {ratio > 0.005 && (
            <path
              d={arcPath(78, START_ANGLE, needleAngle)}
              fill="none"
              stroke={inRedline ? '#ef4444' : 'url(#rpmArcGrad)'}
              strokeWidth="10"
              strokeLinecap="round"
            />
          )}

          {ratio > 0.005 && (
            <circle
              cx={tipPos.x}
              cy={tipPos.y}
              r="4.5"
              fill="#ffffff"
              stroke={inRedline ? '#ef4444' : '#38bdf8'}
              strokeWidth="2"
            />
          )}

          <text
            x={CENTER}
            y={CENTER + 6}
            textAnchor="middle"
            fill={inRedline ? '#f87171' : '#f9fafb'}
            fontSize="32"
            fontWeight="700"
            fontFamily="Inter, Segoe UI, sans-serif"
            data-testid="rpm-value"
          >
            {snapshot.rpm.toLocaleString()}
          </text>
          <text
            x={CENTER}
            y={CENTER + 28}
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
          <span className="muted-label">Peak Speed</span>
          <span className="footer-val num">{snapshot.peakRpm.toLocaleString()} RPM</span>
        </div>
      </div>
    </PanelCard>
  );
};
