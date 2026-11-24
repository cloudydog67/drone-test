export type TelemetrySource = 'SIM' | 'ESP32';

export type EnginePhase =
  | 'STOPPED'
  | 'CRANKING'
  | 'IDLE'
  | 'RUNNING'
  | 'WOT'
  | 'E-STOP';

export type TemperatureFault =
  | 'NOMINAL'
  | 'WARN_HIGH'
  | 'OVERHEAT'
  | 'OPEN_PROBE'
  | 'REVERSED_POLARITY';

export type GpsFixMode = 'NO_FIX' | '2D_FIX' | '3D_FIX' | 'RTK_FIX';

export type ButtonState = 'up' | 'DOWN';

export type ThrottleAuthority = 'HW_KNOB' | 'SW_OVERRIDE';

export interface GpsTelemetry {
  fix: GpsFixMode;
  satellites: number;
  hdop: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  headingDegrees: number;
}

export interface InterlockTelemetry {
  edgeLinkOnline: boolean;
  knobAtIdle: boolean;
  armed: boolean;
  ignitionOn: boolean;
  starterCranking: boolean;
  estopLatched: boolean;
  buttonACdi: ButtonState;
  buttonBStarter: ButtonState;
}

export interface TelemetrySnapshot {
  timestampMs: number;
  source: TelemetrySource;
  heartbeatMs: number;
  enginePhase: EnginePhase;
  runTimeSeconds: number;
  speedKmh: number;
  speedKnots: number;
  rpm: number;
  rawRpm: number;
  hallRpm: number;
  peakRpm: number;
  temperatureC: number | null;
  temperatureTrendCPerSec: number;
  temperatureFault: TemperatureFault;
  throttlePercent: number;
  throttleUs: number;
  knobUs: number;
  knobIdleUs: number;
  throttleMaxUs: number;
  throttleAuthority: ThrottleAuthority;
  gps: GpsTelemetry;
  interlocks: InterlockTelemetry;
}

export interface TelemetryHistoryPoint {
  timeLabel: string;
  timestampMs: number;
  rpm: number;
  speedKmh: number;
  temperatureC: number | null;
  throttlePercent: number;
}

export type TelemetryCommand =
  | { type: 'ESTOP' }
  | { type: 'CLEAR_ESTOP' }
  | { type: 'SET_ARMED'; armed: boolean }
  | { type: 'SET_IGNITION'; on: boolean }
  | { type: 'SET_STARTER'; active: boolean }
  | { type: 'SET_THROTTLE_AUTHORITY'; authority: ThrottleAuthority }
  | { type: 'SET_THROTTLE_US'; microseconds: number }
  | { type: 'SET_SIM_KNOB_US'; microseconds: number }
  | { type: 'RESET_PEAK_RPM' }
  | { type: 'RAW_SERIAL'; line: string };

export interface CommandAck {
  accepted: boolean;
  reason: string;
}

export interface EspTelemetryTransport {
  readonly source: TelemetrySource;
  start(onSnapshot: (snapshot: TelemetrySnapshot) => void): void;
  stop(): void;
  sendCommand(command: TelemetryCommand): CommandAck;
}

export interface TelemetryThresholds {
  rpmRedline: number;
  rpmMaxScale: number;
  speedMaxKmh: number;
  tempWarnC: number;
  tempCritC: number;
  tempMaxScaleC: number;
  watchdogLimitMs: number;
}

export const DEFAULT_THRESHOLDS: TelemetryThresholds = {
  rpmRedline: 8000,
  rpmMaxScale: 10000,
  speedMaxKmh: 160,
  tempWarnC: 185,
  tempCritC: 210,
  tempMaxScaleC: 240,
  watchdogLimitMs: 500,
};

export const INITIAL_TELEMETRY_SNAPSHOT: TelemetrySnapshot = {
  timestampMs: Date.now(),
  source: 'SIM',
  heartbeatMs: 20,
  enginePhase: 'STOPPED',
  runTimeSeconds: 0,
  speedKmh: 0,
  speedKnots: 0,
  rpm: 0,
  rawRpm: 0,
  hallRpm: 0,
  peakRpm: 0,
  temperatureC: 28.4,
  temperatureTrendCPerSec: 0,
  temperatureFault: 'NOMINAL',
  throttlePercent: 0,
  throttleUs: 1050,
  knobUs: 1050,
  knobIdleUs: 1050,
  throttleMaxUs: 1950,
  throttleAuthority: 'HW_KNOB',
  gps: {
    fix: '3D_FIX',
    satellites: 14,
    hdop: 0.72,
    latitude: -6.208763,
    longitude: 106.845599,
    altitudeMeters: 42.5,
    headingDegrees: 48,
  },
  interlocks: {
    edgeLinkOnline: true,
    knobAtIdle: true,
    armed: false,
    ignitionOn: false,
    starterCranking: false,
    estopLatched: false,
    buttonACdi: 'up',
    buttonBStarter: 'up',
  },
};
