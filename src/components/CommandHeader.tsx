import React from 'react';
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
): { label: string; dotClass: string } {
  if (snapshot.interlocks.estopLatched) {
    return { label: 'Emergency Stopped', dotClass: 'dot dot-danger' };
  }
  if (watchdogStale || !snapshot.interlocks.edgeLinkOnline) {
    return { label: 'Signal Lost', dotClass: 'dot dot-danger' };
  }
  if (
    snapshot.temperatureFault === 'OVERHEAT' ||
    snapshot.temperatureFault === 'OPEN_PROBE' ||
    snapshot.temperatureFault === 'REVERSED_POLARITY'
  ) {
    return { label: 'Temp Warning', dotClass: 'dot dot-danger' };
  }
  if (snapshot.enginePhase === 'RUNNING' || snapshot.enginePhase === 'IDLE' || snapshot.enginePhase === 'WOT') {
    return { label: 'Engine Running', dotClass: 'dot dot-go' };
  }
  if (snapshot.interlocks.armed) {
    return { label: 'Ready to Start', dotClass: 'dot dot-warn' };
  }
  return { label: 'Standby', dotClass: 'dot dot-go' };
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
  const watchdogStale = watchdogAgeMs > DEFAULT_THRESHOLDS.watchdogLimitMs;
  const overall = getOverallStatus(snapshot, watchdogStale);

  return (
    <header className="command-header" data-testid="command-header">
      <div className="header-group">
        <span className="app-title">Drone Engine Monitor</span>

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

        <div className="overall-status" data-testid="watchdog-status">
          <span className={overall.dotClass} />
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
          {recording ? <Square size={13} /> : <Circle size={13} />}
          <span className="num">{recording ? `Recording ${formatDuration(recordingSeconds)}` : 'Record'}</span>
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
