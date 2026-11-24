import React from 'react';
import { Circle, OctagonAlert, Radio, RotateCcw, Square } from 'lucide-react';
import { StatusPill } from './ui/StatusPill';
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
        <div className="callsign-block">
          <span className="callsign-code">UAS-DYNO-01</span>
          <span className="callsign-sub">TWIN-IC TEST CONSOLE</span>
        </div>

        <div className="source-switch" role="group" aria-label="Telemetry Source">
          <button
            type="button"
            className={sourceMode === 'SIM' ? 'source-btn active' : 'source-btn'}
            onClick={() => onSwitchSource('SIM')}
          >
            SIM
          </button>
          <button
            type="button"
            className={sourceMode === 'ESP32' ? 'source-btn active' : 'source-btn'}
            onClick={() => onSwitchSource('ESP32')}
          >
            ESP32
          </button>
        </div>

        <StatusPill
          testId="watchdog-status"
          icon={<Radio size={13} />}
          label={watchdogStale ? `LINK STALE ${watchdogAgeMs}ms` : `LINK ${snapshot.heartbeatMs}ms`}
          tone={watchdogStale ? 'danger' : 'go'}
        />

        <div className="interlock-strip">
          <StatusPill
            label={interlocks.edgeLinkOnline ? 'EDGE OK' : 'EDGE LOST'}
            tone={interlocks.edgeLinkOnline ? 'go' : 'danger'}
            dot
          />
          <StatusPill
            label={interlocks.knobAtIdle ? 'IDLE OK' : 'KNOB HIGH'}
            tone={interlocks.knobAtIdle ? 'accent' : 'warn'}
            dot
          />
          <StatusPill
            label={interlocks.armed ? 'ARMED' : 'SAFE'}
            tone={interlocks.armed ? 'go' : 'neutral'}
            dot
          />
          <StatusPill
            label={interlocks.ignitionOn ? 'CDI ON' : 'CDI OFF'}
            tone={interlocks.ignitionOn ? 'warn' : 'neutral'}
            dot
          />
        </div>
      </div>

      <div className="header-group">
        {lastAck && (
          <span
            className={lastAck.accepted ? 'ack-readout' : 'ack-readout ack-warn'}
            data-testid="command-ack"
          >
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
          <span className="mono">{recording ? formatDuration(recordingSeconds) : 'REC CSV'}</span>
        </button>

        {interlocks.estopLatched && (
          <button
            type="button"
            className="reset-estop-btn"
            onClick={onClearEstop}
            data-testid="clear-estop-btn"
          >
            <RotateCcw size={13} />
            RESET
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
          <kbd className="estop-key">ESC</kbd>
        </button>
      </div>
    </header>
  );
};
