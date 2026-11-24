import React, { useEffect, useState } from 'react';
import { Circle, OctagonAlert, RotateCcw, Square } from 'lucide-react';
import {
  DEFAULT_THRESHOLDS,
  type CommandAck,
  type TelemetrySnapshot,
  type TelemetrySource,
} from '../telemetry/telemetryTypes';

export interface CommandHeaderProps {
  snapshot: TelemetrySnapshot;
  sourceMode: TelemetrySource;
  watchdogAgeMs: number;
  recording: boolean;
  recordingSeconds: number;
  lastAck: CommandAck | null;
  onSwitchSource: (source: TelemetrySource) => void;
  onToggleRecord: () => void;
  onEstop: () => void;
  onClearEstop: () => void;
}

function formatDuration(totalSeconds: number): string {
  const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const secs = String(totalSeconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function getOverallStatus(
  snapshot: TelemetrySnapshot,
  watchdogStale: boolean
): { label: string; tone: 'go' | 'warn' | 'danger' | 'neutral' } {
  if (snapshot.interlocks.estopLatched) {
    return { label: 'Emergency Stopped', tone: 'danger' };
  }
  if (watchdogStale || !snapshot.interlocks.edgeLinkOnline) {
    return { label: 'Signal Lost', tone: 'danger' };
  }
  if (
    snapshot.temperatureFault === 'OVERHEAT' ||
    snapshot.temperatureFault === 'OPEN_PROBE' ||
    snapshot.temperatureFault === 'REVERSED_POLARITY'
  ) {
    return { label: 'Temp Warning', tone: 'danger' };
  }
  if (snapshot.fuelPercent <= DEFAULT_THRESHOLDS.fuelCritPercent) {
    return { label: 'Fuel Critical', tone: 'danger' };
  }
  if (snapshot.windSpeedKmh >= DEFAULT_THRESHOLDS.windHighKmh) {
    return { label: 'High Wind Warning', tone: 'danger' };
  }
  if (
    snapshot.enginePhase === 'RUNNING' ||
    snapshot.enginePhase === 'IDLE' ||
    snapshot.enginePhase === 'WOT'
  ) {
    return { label: 'Engine Running', tone: 'go' };
  }
  if (snapshot.interlocks.armed) {
    return { label: 'Ready to Start', tone: 'warn' };
  }
  return { label: 'Standby', tone: 'go' };
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  snapshot,
  sourceMode,
  watchdogAgeMs,
  recording,
  recordingSeconds,
  lastAck,
  onSwitchSource,
  onToggleRecord,
  onEstop,
  onClearEstop,
}) => {
  const [clock, setClock] = useState(() => new Date().toTimeString().slice(0, 8));

  useEffect(() => {
    const id = window.setInterval(() => {
      setClock(new Date().toTimeString().slice(0, 8));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const watchdogStale = watchdogAgeMs > DEFAULT_THRESHOLDS.watchdogLimitMs;
  const overall = getOverallStatus(snapshot, watchdogStale);
  const rotorSpinDuration =
    snapshot.rpm > 120 ? Math.max(0.14, 1.4 - (snapshot.rpm / 9000) * 1.2) : 0;

  return (
    <header className="command-header" data-testid="command-header">
      <div className="header-group">
        <div className="brand-lockup">
          <div className={snapshot.rpm > 120 ? 'brand-mark is-spinning' : 'brand-mark'} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5.5 5.5L18.5 18.5M18.5 5.5L5.5 18.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.55"
              />
              <rect x="9.5" y="9.5" width="5" height="5" rx="1.4" fill="currentColor" />
              {[
                { cx: 5.5, cy: 5.5 },
                { cx: 18.5, cy: 5.5 },
                { cx: 5.5, cy: 18.5 },
                { cx: 18.5, cy: 18.5 },
              ].map((rotor, idx) => (
                <g
                  key={idx}
                  style={
                    rotorSpinDuration > 0
                      ? {
                          transformOrigin: `${rotor.cx}px ${rotor.cy}px`,
                          animation: `rotorSpin ${rotorSpinDuration}s linear infinite`,
                        }
                      : undefined
                  }
                >
                  <circle
                    cx={rotor.cx}
                    cy={rotor.cy}
                    r="3.2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeDasharray="3 2.2"
                  />
                  <circle cx={rotor.cx} cy={rotor.cy} r="1" fill="currentColor" />
                </g>
              ))}
            </svg>
          </div>
          <div className="brand-text">
            <span className="app-title">Drone Engine Monitor</span>
            <span className="header-clock num">{clock}</span>
          </div>
        </div>

        <div className="source-switch" role="group" aria-label="Mode">
          <button
            type="button"
            className={sourceMode === 'SIM' ? 'source-btn active' : 'source-btn'}
            onClick={() => onSwitchSource('SIM')}
          >
            Demo
          </button>
          <button
            type="button"
            className={sourceMode === 'ESP32' ? 'source-btn active' : 'source-btn'}
            onClick={() => onSwitchSource('ESP32')}
          >
            Live
          </button>
        </div>

        <div className={`overall-status status-${overall.tone}`} data-testid="watchdog-status">
          <span className={`dot dot-${overall.tone}`} />
          <span>{overall.label}</span>
        </div>
      </div>

      <div className="header-group">
        {lastAck && !lastAck.accepted && (
          <span className="ack-notice" data-testid="command-ack">
            {lastAck.reason}
          </span>
        )}

        <button
          type="button"
          className={recording ? 'rec-btn is-recording' : 'rec-btn'}
          onClick={onToggleRecord}
          data-testid="record-csv-btn"
        >
          {recording ? <Square size={12} /> : <Circle size={12} />}
          <span className="num">
            {recording ? `Recording ${formatDuration(recordingSeconds)}` : 'Record'}
          </span>
        </button>

        {snapshot.interlocks.estopLatched && (
          <button
            type="button"
            className="reset-estop-btn"
            onClick={onClearEstop}
            data-testid="clear-estop-btn"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}

        <button
          type="button"
          className={snapshot.interlocks.estopLatched ? 'estop-trigger latched' : 'estop-trigger'}
          onClick={onEstop}
          data-testid="estop-btn"
        >
          <OctagonAlert size={18} />
          <span>EMERGENCY STOP</span>
        </button>
      </div>
    </header>
  );
};
