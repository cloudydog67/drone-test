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
  const { interlocks } = snapshot;

  return (
    <header className="command-header" data-testid="command-header">
      <div className="header-group">
        <span className="app-title">Engine Test Stand</span>

        <div className="source-switch" role="group" aria-label="Telemetry Source">
          <button
            type="button"
            className={sourceMode === 'SIM' ? 'source-btn active' : 'source-btn'}
            onClick={() => onSwitchSource('SIM')}
          >
            Sim
          </button>
          <button
            type="button"
            className={sourceMode === 'ESP32' ? 'source-btn active' : 'source-btn'}
            onClick={() => onSwitchSource('ESP32')}
          >
            ESP32
          </button>
        </div>

        <div className="status-row">
          <span className="inline-status" data-testid="watchdog-status">
            <span className={watchdogStale ? 'dot dot-danger' : 'dot dot-go'} />
            <span className="num">
              {watchdogStale ? `Link stale (${watchdogAgeMs} ms)` : `Link ${snapshot.heartbeatMs} ms`}
            </span>
          </span>

          <span className="inline-status">
            <span className={interlocks.edgeLinkOnline ? 'dot dot-go' : 'dot dot-danger'} />
            <span>{interlocks.edgeLinkOnline ? 'Edge online' : 'Edge offline'}</span>
          </span>

          <span className="inline-status">
            <span className={interlocks.knobAtIdle ? 'dot dot-go' : 'dot dot-warn'} />
            <span>{interlocks.knobAtIdle ? 'Knob idle' : 'Knob high'}</span>
          </span>

          <span className="inline-status">
            <span className={interlocks.armed ? 'dot dot-go' : 'dot dot-neutral'} />
            <span>{interlocks.armed ? 'Armed' : 'Disarmed'}</span>
          </span>
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
          <span className="num">{recording ? formatDuration(recordingSeconds) : 'Record CSV'}</span>
        </button>

        {interlocks.estopLatched && (
          <button
            type="button"
            className="reset-estop-btn"
            onClick={onClearEstop}
            data-testid="clear-estop-btn"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}

        <button
          type="button"
          className={interlocks.estopLatched ? 'estop-trigger latched' : 'estop-trigger'}
          onClick={onEstop}
          data-testid="estop-btn"
        >
          <OctagonAlert size={16} />
          <span>E-STOP</span>
        </button>
      </div>
    </header>
  );
};
