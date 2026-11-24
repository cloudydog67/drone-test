import React from 'react';
import { Check, Flame, Lock, Unlock, Zap } from 'lucide-react';
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
  const isRunning =
    snapshot.enginePhase === 'RUNNING' ||
    snapshot.enginePhase === 'IDLE' ||
    snapshot.enginePhase === 'WOT';

  return (
    <PanelCard
      title="Engine Controls"
      testId="control-deck-card"
      badge={<span className="runtime-label num">Run {formatRunTime(snapshot.runTimeSeconds)}</span>}
    >
      <div className="simple-controls-layout">
        <div className="step-flow-rail" aria-hidden="true">
          <span className={interlocks.armed ? 'flow-seg seg-go' : 'flow-seg'} />
          <span className={interlocks.ignitionOn ? 'flow-seg seg-warn' : 'flow-seg'} />
          <span
            className={
              isRunning
                ? 'flow-seg seg-go'
                : interlocks.starterCranking
                ? 'flow-seg seg-accent'
                : 'flow-seg'
            }
          />
        </div>

        <div className="step-buttons-row">
          <button
            type="button"
            data-testid="arm-btn"
            disabled={!interlocks.armed && !canArm}
            className={interlocks.armed ? 'step-btn is-armed' : 'step-btn'}
            onClick={onToggleArm}
          >
            <span className={interlocks.armed ? 'led-bar led-go' : 'led-bar'} />
            <div className="step-head">
              <span className={interlocks.armed ? 'step-num is-done' : 'step-num'}>
                {interlocks.armed ? <Check size={14} /> : '1'}
              </span>
              {interlocks.armed ? <Unlock size={19} /> : <Lock size={19} />}
            </div>
            <div className="step-copy">
              <span className="step-title">
                {interlocks.armed ? 'Unlocked' : 'Unlock'}
              </span>
              <span className="step-hint">
                {interlocks.armed
                  ? 'Tap to lock'
                  : !interlocks.knobAtIdle
                  ? 'Set to 0%'
                  : 'Ready'}
              </span>
            </div>
          </button>

          <button
            type="button"
            data-testid="ignition-btn"
            disabled={!canActuate}
            className={interlocks.ignitionOn ? 'step-btn is-ign' : 'step-btn'}
            onClick={onToggleIgnition}
          >
            <span className={interlocks.ignitionOn ? 'led-bar led-warn' : 'led-bar'} />
            <div className="step-head">
              <span className={interlocks.ignitionOn ? 'step-num is-warn-done' : 'step-num'}>
                {interlocks.ignitionOn ? <Check size={14} /> : '2'}
              </span>
              <Flame size={19} />
            </div>
            <div className="step-copy">
              <span className="step-title">
                {interlocks.ignitionOn ? 'Ignition On' : 'Ignition Off'}
              </span>
              <span className="step-hint">
                {interlocks.ignitionOn ? 'Tap to stop' : 'Unlock first'}
              </span>
            </div>
          </button>

          <MomentaryButton
            active={interlocks.starterCranking}
            disabled={!canActuate}
            onPressStart={onStarterStart}
            onPressEnd={onStarterStop}
            className="step-btn step-starter"
            testId="starter-btn"
          >
            <span className={interlocks.starterCranking ? 'led-bar led-accent' : 'led-bar'} />
            <div className="step-head">
              <span className={isRunning ? 'step-num is-done' : 'step-num'}>
                {isRunning ? <Check size={14} /> : '3'}
              </span>
              <Zap size={19} />
            </div>
            <div className="step-copy">
              <span className="step-title">
                {interlocks.starterCranking ? 'Starting...' : isRunning ? 'Running' : 'Hold Start'}
              </span>
              <span className="step-hint">{isRunning ? 'Engine active' : 'Hold to start'}</span>
            </div>
          </MomentaryButton>
        </div>

        <div className="handle-bar">
          <div className="handle-header">
            <span className="muted-label">
              {sourceMode === 'SIM' ? 'Demo Handle' : 'Physical Handle'}
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
