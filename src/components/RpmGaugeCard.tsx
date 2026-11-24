import React from 'react';
import { RotateCcw } from 'lucide-react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill } from './ui/StatusPill';
import { DEFAULT_THRESHOLDS, type TelemetrySnapshot } from '../telemetry/telemetryTypes';

export interface RpmGaugeCardProps {
  snapshot: TelemetrySnapshot;
  onResetPeak: () => void;
}

const CENTER = 105;
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

function formatPhase(phase: TelemetrySnapshot['enginePhase']): string {
  switch (phase) {
    case 'STOPPED':
      return 'Stopped';
    case 'CRANKING':
      return 'Cranking';
    case 'IDLE':
      return 'Idle';
    case 'RUNNING':
      return 'Running';
    case 'WOT':
      return 'Max Power';
    case 'E-STOP':
      return 'E-Stop';
  }
}

export const RpmGaugeCard: React.FC<RpmGaugeCardProps> = ({ snapshot, onResetPeak }) => {
  const maxRpm = DEFAULT_THRESHOLDS.rpmMaxScale;
  const redline = DEFAULT_THRESHOLDS.rpmRedline;

  const rpmRatio = Math.max(0, Math.min(1, snapshot.rpm / maxRpm));
  const peakRatio = Math.max(0, Math.min(1, snapshot.peakRpm / maxRpm));
  const needleAngle = START_ANGLE + rpmRatio * SWEEP_ANGLE;
  const peakAngle = START_ANGLE + peakRatio * SWEEP_ANGLE;
  const redStart = START_ANGLE + (redline / maxRpm) * SWEEP_ANGLE;
  const redEnd = START_ANGLE + SWEEP_ANGLE;

  const tip = polar(needleAngle, 70);
  const left = polar(needleAngle - 4.5, 83);
  const right = polar(needleAngle + 4.5, 83);
  const peakPoint = polar(peakAngle, 76);

  const inRedline = snapshot.rpm >= redline;
  const phaseTone =
    snapshot.enginePhase === 'E-STOP'
      ? 'danger'
      : snapshot.enginePhase === 'WOT'
      ? 'warn'
      : snapshot.enginePhase === 'RUNNING' || snapshot.enginePhase === 'IDLE'
      ? 'go'
      : snapshot.enginePhase === 'CRANKING'
      ? 'accent'
      : 'neutral';

  return (
    <PanelCard
      title="Engine RPM"
      testId="rpm-card"
      badge={<StatusPill label={formatPhase(snapshot.enginePhase)} tone={phaseTone} dot />}
    >
      <div className="rpm-card-content">
        <svg viewBox="0 0 210 210" className="rpm-svg" aria-label="Engine RPM Gauge">
          <circle cx={CENTER} cy={CENTER} r="90" className="dial-outer" />
          <circle cx={CENTER} cy={CENTER} r="66" className="dial-inner" />

          {rpmRatio > 0.005 && (
            <path
              d={arcPath(68, START_ANGLE, needleAngle)}
              fill="none"
              stroke={inRedline ? '#ef4444' : '#3b82f6'}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          )}

          <path
            d={arcPath(84, redStart, redEnd)}
            fill="none"
            stroke="#ef4444"
            strokeOpacity="0.85"
            strokeWidth="3"
          />

          {Array.from({ length: 51 }).map((_, idx) => {
            const ratio = idx / 50;
            const deg = START_ANGLE + ratio * SWEEP_ANGLE;
            const major = idx % 5 === 0;
            const redZone = ratio * maxRpm >= redline;
            const p1 = polar(deg, 84);
            const p2 = polar(deg, major ? 73 : 78);
            return (
              <line
                key={idx}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={redZone ? '#f87171' : major ? '#d1d5db' : '#4b5563'}
                strokeWidth={major ? 1.8 : 1}
              />
            );
          })}

          {Array.from({ length: 11 }).map((_, idx) => {
            const ratio = idx / 10;
            const deg = START_ANGLE + ratio * SWEEP_ANGLE;
            const pos = polar(deg, 95);
            return (
              <text
                key={idx}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={ratio * maxRpm >= redline ? '#f87171' : '#9ca3af'}
                fontSize="10"
                fontWeight="600"
                fontFamily="Inter, Segoe UI, sans-serif"
              >
                {idx}
              </text>
            );
          })}

          {snapshot.peakRpm > 100 && (
            <circle cx={peakPoint.x} cy={peakPoint.y} r="3" fill="#eab308" />
          )}

          <polygon
            points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
            fill="#ef4444"
          />

          <circle cx={CENTER} cy={CENTER} r="49" className="dial-hub" />
          <text
            x={CENTER}
            y={CENTER - 1}
            textAnchor="middle"
            fill={inRedline ? '#f87171' : '#f9fafb'}
            fontSize="26"
            fontWeight="700"
            fontFamily="Inter, Segoe UI, sans-serif"
            data-testid="rpm-value"
          >
            {snapshot.rpm.toLocaleString()}
          </text>
          <text
            x={CENTER}
            y={CENTER + 17}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="11"
            fontWeight="500"
            fontFamily="Inter, Segoe UI, sans-serif"
          >
            RPM
          </text>
        </svg>

        <div className="rpm-subgrid">
          <div className="substat">
            <span className="substat-label">Peak</span>
            <span className="substat-value num">{snapshot.peakRpm.toLocaleString()}</span>
          </div>
          <div className="substat">
            <span className="substat-label">Hall Backup</span>
            <span className="substat-value num">{snapshot.hallRpm.toLocaleString()}</span>
          </div>
          <button
            type="button"
            className="icon-chip-btn"
            onClick={onResetPeak}
            aria-label="Reset peak RPM"
            title="Reset peak RPM"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </PanelCard>
  );
};
