import React from 'react';
import { Flame, Lock, Unlock, Zap } from 'lucide-react';
import { PanelCard } from './ui/PanelCard';
import { MomentaryButton } from './ui/MomentaryButton';
import type { TelemetrySnapshot, TelemetrySource } from '../telemetry/telemetryTypes';

export interface EngineControlDeckProps {
  snapshot: TelemetrySnapshot;
  sourceMode: TelemetrySource;
  onToggleArm: () => void;
  onToggleIgnition: () => void;
  onStarterStart: () => void;
  onStarterStop: () => void;
  onSimKnobChange: (microseconds: number) => void;
}

function formatRunTime(seconds: number): string {
  const total = Math.floor(seconds);
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export const EngineControlDeck: React.FC<EngineControlDeckProps> = ({
  snapshot,
  sourceMode,
  onToggleArm,
  onToggleIgnition,
  onStarterStart,
  onStarterStop,
  onSimKnobChange,
}) => {
  const { interlocks } = snapshot;
  const canArm = interlocks.edgeLinkOnline && interlocks.knobAtIdle && !interlocks.estopLatched;
  const canActuate = interlocks.armed && interlocks.edgeLinkOnline && !interlocks.estopLatched;
  const span = Math.max(1, snapshot.throttleMaxUs - snapshot.knobIdleUs);
  const handlePct = Math.round(((snapshot.knobUs - snapshot.knobIdleUs) / span) * 100);

  return (
    <PanelCard
      title="Engine Controls"
      testId="control-deck-card"
      badge={<span className="runtime-label num">Run time {formatRunTime(snapshot.runTimeSeconds)}</span>}
    >
      <div className="simple-controls-layout">
        <div className="step-buttons-row">
          <button
            type="button"
            data-testid="arm-btn"
            disabled={!interlocks.armed && !canArm}
            className={interlocks.armed ? 'step-btn is-armed' : 'step-btn'}
            onClick={onToggleArm}
          >
            <div className="step-head">
              <span className="step-num">1</span>
              {interlocks.armed ? <Unlock size={16} /> : <Lock size={16} />}
            </div>
            <span className="step-title">
              {interlocks.armed ? 'Unlocked' : 'Unlock'}
            </span>
            <span className="step-hint">
              {interlocks.armed
                ? 'Tap to lock'
                : !interlocks.knobAtIdle
                ? 'Set handle to 0%'
                : 'Ready to unlock'}
            </span>
          </button>

          <button
            type="button"
            data-testid="ignition-btn"
            disabled={!canActuate}
            className={interlocks.ignitionOn ? 'step-btn is-ign' : 'step-btn'}
            onClick={onToggleIgnition}
          >
            <div className="step-head">
              <span className="step-num">2</span>
              <Flame size={16} />
            </div>
            <span className="step-title">
              {interlocks.ignitionOn ? 'Ignition On' : 'Ignition Off'}
            </span>
            <span className="step-hint">
              {interlocks.ignitionOn ? 'Tap to stop engine' : 'Unlock first'}
            </span>
          </button>

          <MomentaryButton
            active={interlocks.starterCranking}
            disabled={!canActuate}
            onPressStart={onStarterStart}
            onPressEnd={onStarterStop}
            className="step-btn step-starter"
            testId="starter-btn"
          >
            <div className="step-head">
              <span className="step-num">3</span>
              <Zap size={16} />
            </div>
            <span className="step-title">
              {interlocks.starterCranking ? 'Starting...' : 'Hold to Start'}
            </span>
            <span className="step-hint">Release when running</span>
          </MomentaryButton>
        </div>

        <div className="handle-bar">
          <div className="handle-header">
            <span className="muted-label">
              {sourceMode === 'SIM' ? 'Demo Throttle Handle' : 'Physical Throttle Handle'}
            </span>
            <span className="footer-val num">{handlePct}%</span>
          </div>
          {sourceMode === 'SIM' && (
            <input
              type="range"
              className="tactical-slider"
              min={snapshot.knobIdleUs}
              max={snapshot.throttleMaxUs}
              step={5}
              value={snapshot.knobUs}
              onChange={(event) => onSimKnobChange(Number(event.target.value))}
              aria-label="Demo physical throttle handle"
              data-testid="sim-knob-slider"
            />
          )}
        </div>
      </div>
    </PanelCard>
  );
};
