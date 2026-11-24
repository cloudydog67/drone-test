import React from 'react';
import { Flame, Shield, Zap } from 'lucide-react';
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

  return (
    <PanelCard
      title="Engine Controls"
      testId="control-deck-card"
      badge={<span className="runtime-label num">Run time {formatRunTime(snapshot.runTimeSeconds)}</span>}
    >
      <div className="control-deck-layout">
        <div className="control-switches-col">
          <div className="primary-switch-row">
            <button
              type="button"
              data-testid="arm-btn"
              disabled={!interlocks.armed && !canArm}
              className={
                interlocks.armed ? 'tactical-action-btn is-armed' : 'tactical-action-btn'
              }
              onClick={onToggleArm}
            >
              <Shield size={16} />
              <div className="btn-label-stack">
                <span className="btn-main">{interlocks.armed ? 'Armed' : 'Arm System'}</span>
                <span className="btn-sub">
                  {interlocks.armed ? 'Click to disarm' : canArm ? 'Ready to arm' : 'Knob must be idle'}
                </span>
              </div>
            </button>

            <button
              type="button"
              data-testid="ignition-btn"
              disabled={!canActuate}
              className={
                interlocks.ignitionOn ? 'tactical-action-btn is-ign' : 'tactical-action-btn'
              }
              onClick={onToggleIgnition}
            >
              <Flame size={16} />
              <div className="btn-label-stack">
                <span className="btn-main">
                  {interlocks.ignitionOn ? 'Ignition On' : 'Ignition Off'}
                </span>
                <span className="btn-sub">
                  {interlocks.ignitionOn ? 'Click to cut spark' : 'Arm system first'}
                </span>
              </div>
            </button>
          </div>

          <div className="esp-inputs-panel">
            <div className="esp-input-row">
              <span className="substat-label">Button A (CDI)</span>
              <span className="esp-val">{interlocks.buttonACdi === 'DOWN' ? 'Pressed' : 'Released'}</span>
            </div>
            <div className="esp-input-row">
              <span className="substat-label">Button B (Starter)</span>
              <span className="esp-val">{interlocks.buttonBStarter === 'DOWN' ? 'Pressed' : 'Released'}</span>
            </div>
            <div className="esp-input-row">
              <span className="substat-label">Physical Knob</span>
              <span className="esp-val num">{snapshot.knobUs} µs</span>
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
                aria-label="Simulated physical knob PWM"
                data-testid="sim-knob-slider"
              />
            )}
          </div>
        </div>

        <div className="starter-col">
          <MomentaryButton
            active={interlocks.starterCranking}
            disabled={!canActuate}
            onPressStart={onStarterStart}
            onPressEnd={onStarterStop}
            className="starter-circle"
            testId="starter-btn"
          >
            <Zap size={22} />
            <span className="starter-title">
              {interlocks.starterCranking ? 'Cranking' : 'Starter'}
            </span>
            <span className="starter-sub">Hold to crank</span>
          </MomentaryButton>
          <span className="starter-note">0% throttle idles only</span>
        </div>
      </div>
    </PanelCard>
  );
};
