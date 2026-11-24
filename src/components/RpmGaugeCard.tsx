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
  const peakRatio = Math.max(0, Math.min(1, snapshot.peakRpm / maxRpm));
  const needleAngle = START_ANGLE + ratio * SWEEP_ANGLE;
  const peakAngle = START_ANGLE + peakRatio * SWEEP_ANGLE;
  const redStart = START_ANGLE + (redline / maxRpm) * SWEEP_ANGLE;
  const redEnd = START_ANGLE + SWEEP_ANGLE;
  const inRedline = snapshot.rpm >= redline;
  const phase = formatPhase(snapshot.enginePhase);

  const needleTip = polar(needleAngle, 73);
  const needleBaseL = polar(needleAngle - 9, 54);
  const needleBaseR = polar(needleAngle + 9, 54);
  const peakOuter = polar(peakAngle, 91);
  const peakInner = polar(peakAngle, 81);

  return (
    <PanelCard
      title="RPM"
      testId="rpm-card"
      badge={<StatusPill label={phase.label} tone={phase.tone} dot />}
    >
      <div className="rpm-simple-body">
        <svg viewBox="0 0 220 194" className="rpm-arc-svg" aria-label="Engine RPM">
          <defs>
            <linearGradient id="rpmArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="55%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={CENTER} cy={CENTER} r="96" fill="#0d1015" stroke="#222834" strokeWidth="1.2" />
          <circle cx={CENTER} cy={CENTER} r="54" fill="#131720" stroke="#232936" strokeWidth="1" />

          {Array.from({ length: 41 }).map((_, idx) => {
            const tickRatio = idx / 40;
            const deg = START_ANGLE + tickRatio * SWEEP_ANGLE;
            const major = idx % 8 === 0;
            const medium = idx % 4 === 0;
            const isRed = tickRatio * maxRpm >= redline;
            const p1 = polar(deg, 92);
            const p2 = polar(deg, major ? 83 : medium ? 86 : 88.5);
            return (
              <line
                key={idx}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isRed ? '#ef4444' : major ? '#94a3b8' : '#2e3545'}
                strokeWidth={major ? 1.8 : 1}
              />
            );
          })}

          {[0, 2, 4, 6, 8, 10].map((val) => {
            const deg = START_ANGLE + (val / 10) * SWEEP_ANGLE;
            const pos = polar(deg, 65);
            return (
              <text
                key={val}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={val >= 8 ? '#f87171' : '#64748b'}
                fontSize="9.5"
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
            stroke="#1e232e"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d={arcPath(78, redStart, redEnd)}
            fill="none"
            stroke="rgba(239, 68, 68, 0.34)"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {ratio > 0.005 && (
            <path
              d={arcPath(78, START_ANGLE, needleAngle)}
              fill="none"
              stroke={inRedline ? '#ef4444' : 'url(#rpmArcGrad)'}
              strokeWidth="9"
              strokeLinecap="round"
              filter="url(#arcGlow)"
            />
          )}

          {snapshot.peakRpm > 150 && (
            <line
              x1={peakOuter.x}
              y1={peakOuter.y}
              x2={peakInner.x}
              y2={peakInner.y}
              stroke="#f59e0b"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          )}

          <polygon
            points={`${needleTip.x},${needleTip.y} ${needleBaseL.x},${needleBaseL.y} ${needleBaseR.x},${needleBaseR.y}`}
            fill={inRedline ? '#ef4444' : '#f8fafc'}
            opacity="0.92"
          />

          <text
            x={CENTER}
            y={CENTER + 5}
            textAnchor="middle"
            fill={inRedline ? '#f87171' : '#f9fafb'}
            fontSize="31"
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
            fontSize="11.5"
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
