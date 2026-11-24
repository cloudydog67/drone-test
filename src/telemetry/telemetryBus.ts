import {
  INITIAL_TELEMETRY_SNAPSHOT,
  type CommandAck,
  type EspTelemetryTransport,
  type TelemetryCommand,
  type TelemetrySnapshot,
} from './telemetryTypes';

type SnapshotListener = (snapshot: TelemetrySnapshot) => void;
type CommandHandler = (command: TelemetryCommand) => CommandAck;

export interface EspTelemetryBus {
  getSnapshot(): TelemetrySnapshot;
  subscribe(listener: SnapshotListener): () => void;
  pushSnapshot(partial: Partial<TelemetrySnapshot>): void;
  attachTransport(transport: EspTelemetryTransport): void;
  setExternalCommandHandler(handler: CommandHandler | null): void;
  sendCommand(command: TelemetryCommand): CommandAck;
}

class TelemetryBusImpl implements EspTelemetryBus {
  private snapshot: TelemetrySnapshot = INITIAL_TELEMETRY_SNAPSHOT;
  private listeners = new Set<SnapshotListener>();
  private activeTransport: EspTelemetryTransport | null = null;
  private externalCommandHandler: CommandHandler | null = null;

  getSnapshot(): TelemetrySnapshot {
    return this.snapshot;
  }

  subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot);
    return () => {
      this.listeners.delete(listener);
    };
  }

  pushSnapshot(partial: Partial<TelemetrySnapshot>): void {
    this.snapshot = {
      ...this.snapshot,
      ...partial,
      gps: partial.gps ? { ...this.snapshot.gps, ...partial.gps } : this.snapshot.gps,
      interlocks: partial.interlocks
        ? { ...this.snapshot.interlocks, ...partial.interlocks }
        : this.snapshot.interlocks,
      timestampMs: partial.timestampMs ?? Date.now(),
    };
    this.listeners.forEach((listener) => listener(this.snapshot));
  }

  attachTransport(transport: EspTelemetryTransport): void {
    if (this.activeTransport) {
      this.activeTransport.stop();
    }
    this.activeTransport = transport;
    transport.start((next) => {
      this.snapshot = next;
      this.listeners.forEach((listener) => listener(this.snapshot));
    });
  }

  setExternalCommandHandler(handler: CommandHandler | null): void {
    this.externalCommandHandler = handler;
  }

  sendCommand(command: TelemetryCommand): CommandAck {
    if (this.externalCommandHandler) {
      return this.externalCommandHandler(command);
    }
    if (this.activeTransport) {
      return this.activeTransport.sendCommand(command);
    }
    return { accepted: false, reason: 'NO_ACTIVE_TRANSPORT' };
  }
}

export const espTelemetryBus: EspTelemetryBus = new TelemetryBusImpl();

declare global {
  interface Window {
    espTelemetryBus?: EspTelemetryBus;
  }
}

if (typeof window !== 'undefined') {
  window.espTelemetryBus = espTelemetryBus;
}
