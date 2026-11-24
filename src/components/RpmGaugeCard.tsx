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
      title="ENGINE RPM"
      testId="rpm-card"
      badge={<StatusPill label={snapshot.enginePhase} tone={phaseTone} />}
    >
      <div className="rpm-card-content">
        <svg viewBox="0 0 210 210" className="rpm-svg" aria-label="Engine RPM Gauge">
          <circle cx={CENTER} cy={CENTER} r="90" className="dial-outer" />
          <circle cx={CENTER} cy={CENTER} r="66" className="dial-inner" />

          {rpmRatio > 0.005 && (
            <path
              d={arcPath(68, START_ANGLE, needleAngle)}
              fill="none"
              stroke={inRedline ? '#ef4444' : '#38bdf8'}
              strokeWidth="4.5"
              strokeLinecap="round"
            />
          )}

          <path
            d={arcPath(84, redStart, redEnd)}
            fill="none"
            stroke="#ef4444"
            strokeOpacity="0.8"
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
                stroke={redZone ? '#f87171' : major ? '#cbd5e1' : '#475569'}
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
                fill={ratio * maxRpm >= redline ? '#f87171' : '#94a3b8'}
                fontSize="9.5"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                {idx}
              </text>
            );
          })}

          {snapshot.peakRpm > 100 && (
            <circle cx={peakPoint.x} cy={peakPoint.y} r="3" fill="#f59e0b" />
          )}

          <polygon
            points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
            fill="#ef4444"
          />

          <circle cx={CENTER} cy={CENTER} r="49" className="dial-hub" />
          <text
            x={CENTER}
            y={CENTER - 2}
            textAnchor="middle"
            fill={inRedline ? '#f87171' : '#f8fafc'}
            fontSize="26"
            fontWeight="700"
            fontFamily="JetBrains Mono, monospace"
            data-testid="rpm-value"
          >
            {snapshot.rpm.toLocaleString()}
          </text>
          <text
            x={CENTER}
            y={CENTER + 17}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="10"
            fontWeight="700"
            fontFamily="JetBrains Mono, monospace"
            letterSpacing="0.14em"
          >
            RPM
          </text>
        </svg>

        <div className="rpm-subgrid">
          <div className="substat">
            <span className="substat-label">PEAK</span>
            <span className="substat-value mono">{snapshot.peakRpm.toLocaleString()}</span>
          </div>
          <div className="substat">
            <span className="substat-label">HALL</span>
            <span className="substat-value mono">{snapshot.hallRpm.toLocaleString()}</span>
          </div>
          <button
            type="button"
            className="icon-chip-btn"
            onClick={onResetPeak}
            aria-label="Reset peak RPM"
            title="Reset peak RPM"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </PanelCard>
  );
};
