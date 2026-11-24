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
  const watchdogStale = watchdogAgeMs > DEFAULT_THRESHOLDS.watchdogLimitMs;
  const overall = getOverallStatus(snapshot, watchdogStale);

  return (
    <header className="command-header" data-testid="command-header">
      <div className="header-group">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M3.5 12h4.2M16.3 12h4.2M12 3.5v4.2M12 16.3v4.2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="4.5" cy="4.5" r="2" fill="currentColor" opacity="0.65" />
              <circle cx="19.5" cy="4.5" r="2" fill="currentColor" opacity="0.65" />
              <circle cx="4.5" cy="19.5" r="2" fill="currentColor" opacity="0.65" />
              <circle cx="19.5" cy="19.5" r="2" fill="currentColor" opacity="0.65" />
            </svg>
          </div>
          <span className="app-title">Drone Engine Monitor</span>
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
