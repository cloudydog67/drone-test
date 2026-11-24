import { useCallback, useEffect, useRef, useState } from 'react';
import { espTelemetryBus } from './telemetryBus';
import { PassiveEspTransport, SimulatedEspTransport } from './simulatedTransport';
import type {
  CommandAck,
  TelemetryCommand,
  TelemetryHistoryPoint,
  TelemetrySnapshot,
  TelemetrySource,
} from './telemetryTypes';

const HISTORY_LIMIT = 90;
const CSV_HEADER =
  'iso_time,source,phase,speed_kmh,speed_kt,rpm,raw_rpm,hall_rpm,temp_c,temp_fault,throttle_pct,throttle_us,knob_us,fuel_pct,wind_kmh,wind_dir_deg,gps_fix,satellites,lat,lon,alt_m,hdg_deg,armed,ign_on,starter,estop';

function formatClock(timestampMs: number): string {
  return new Date(timestampMs).toTimeString().slice(0, 8);
}

function snapshotToCsvRow(s: TelemetrySnapshot): string {
  return [
    new Date(s.timestampMs).toISOString(),
    s.source,
    s.enginePhase,
    s.speedKmh,
    s.speedKnots,
    s.rpm,
    s.rawRpm,
    s.hallRpm,
    s.temperatureC ?? '',
    s.temperatureFault,
    s.throttlePercent,
    s.throttleUs,
    s.knobUs,
    s.fuelPercent,
    s.windSpeedKmh,
    s.windDirectionDegrees,
    s.gps.fix,
    s.gps.satellites,
    s.gps.latitude,
    s.gps.longitude,
    s.gps.altitudeMeters,
    s.gps.headingDegrees,
    s.interlocks.armed,
    s.interlocks.ignitionOn,
    s.interlocks.starterCranking,
    s.interlocks.estopLatched,
  ].join(',');
}

export function useTelemetry() {
  const simTransportRef = useRef<SimulatedEspTransport | null>(null);
  const espTransportRef = useRef<PassiveEspTransport | null>(null);
  const pausedRef = useRef(false);
  const lastPacketPerfRef = useRef(performance.now());
  const csvRowsRef = useRef<string[]>([]);
  const recordingStartRef = useRef<number | null>(null);

  const [sourceMode, setSourceMode] = useState<TelemetrySource>('SIM');
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot>(() =>
    espTelemetryBus.getSnapshot()
  );
  const [history, setHistory] = useState<TelemetryHistoryPoint[]>([]);
  const [chartPaused, setChartPaused] = useState(false);
  const [watchdogAgeMs, setWatchdogAgeMs] = useState(0);
  const [lastAck, setLastAck] = useState<CommandAck | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  useEffect(() => {
    const sim = new SimulatedEspTransport();
    const esp = new PassiveEspTransport();
    simTransportRef.current = sim;
    espTransportRef.current = esp;

    espTelemetryBus.attachTransport(sim);

    const unsubscribe = espTelemetryBus.subscribe((next) => {
      lastPacketPerfRef.current = performance.now();
      setSnapshot(next);

      if (!pausedRef.current) {
        setHistory((prev) => {
          const point: TelemetryHistoryPoint = {
            timeLabel: formatClock(next.timestampMs),
            timestampMs: next.timestampMs,
            rpm: next.rpm,
            speedKmh: next.speedKmh,
            temperatureC: next.temperatureC,
            throttlePercent: next.throttlePercent,
            fuelPercent: next.fuelPercent,
            windSpeedKmh: next.windSpeedKmh,
          };
          const trimmed =
            prev.length >= HISTORY_LIMIT ? prev.slice(prev.length - (HISTORY_LIMIT - 1)) : prev;
          return [...trimmed, point];
        });
      }

      if (recordingStartRef.current !== null) {
        csvRowsRef.current.push(snapshotToCsvRow(next));
        setRecordingSeconds(Math.floor((Date.now() - recordingStartRef.current) / 1000));
      }
    });

    const watchdogTimer = window.setInterval(() => {
      setWatchdogAgeMs(Math.round(performance.now() - lastPacketPerfRef.current));
    }, 150);

    return () => {
      unsubscribe();
      window.clearInterval(watchdogTimer);
      sim.stop();
      esp.stop();
    };
  }, []);

  const switchSourceMode = useCallback((nextMode: TelemetrySource) => {
    setSourceMode(nextMode);
    if (nextMode === 'SIM' && simTransportRef.current) {
      espTelemetryBus.attachTransport(simTransportRef.current);
      setLastAck({ accepted: true, reason: 'Demo mode active' });
    } else if (nextMode === 'ESP32' && espTransportRef.current) {
      espTelemetryBus.attachTransport(espTransportRef.current);
      espTelemetryBus.pushSnapshot({ source: 'ESP32' });
      setLastAck({ accepted: true, reason: 'Ready for ESP32 stream' });
    }
  }, []);

  const sendCommand = useCallback((command: TelemetryCommand): CommandAck => {
    const ack = espTelemetryBus.sendCommand(command);
    setLastAck(ack);
    return ack;
  }, []);

  const toggleChartPaused = useCallback(() => {
    setChartPaused((prev) => {
      pausedRef.current = !prev;
      return !prev;
    });
  }, []);

  const toggleRecording = useCallback(() => {
    if (recordingStartRef.current !== null) {
      const csvText = [CSV_HEADER, ...csvRowsRef.current].join('\n');
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const link = document.createElement('a');
      link.href = url;
      link.download = `drone-engine-${stamp}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      recordingStartRef.current = null;
      csvRowsRef.current = [];
      setRecording(false);
      setRecordingSeconds(0);
      setLastAck({ accepted: true, reason: 'Log saved' });
    } else {
      csvRowsRef.current = [];
      recordingStartRef.current = Date.now();
      setRecording(true);
      setRecordingSeconds(0);
      setLastAck({ accepted: true, reason: 'Recording started' });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        sendCommand({ type: 'ESTOP' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sendCommand]);

  return {
    sourceMode,
    snapshot,
    history,
    chartPaused,
    watchdogAgeMs,
    lastAck,
    recording,
    recordingSeconds,
    switchSourceMode,
    sendCommand,
    toggleChartPaused,
    toggleRecording,
  };
}
