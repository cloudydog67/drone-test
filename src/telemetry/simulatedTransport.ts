import {
  DEFAULT_THRESHOLDS,
  type CommandAck,
  type EnginePhase,
  type EspTelemetryTransport,
  type TelemetryCommand,
  type TelemetrySnapshot,
  type TemperatureFault,
  type ThrottleAuthority,
} from './telemetryTypes';

const IDLE_TOLERANCE_US = 50;
const MAX_CRANK_SECONDS = 5.0;
const TICK_INTERVAL_MS = 100;

export class SimulatedEspTransport implements EspTelemetryTransport {
  readonly source = 'SIM' as const;

  private timerId: number | null = null;
  private lastTickMs = performance.now();

  private rpm = 0;
  private rawRpm = 0;
  private hallRpm = 0;
  private peakRpm = 0;
  private speedKmh = 0;
  private temperatureC = 28.4;
  private temperatureTrendCPerSec = 0;
  private fuelPercent = 86;
  private windSpeedKmh = 12.4;
  private windDirectionDegrees = 315;
  private windPhase = 0;

  private knobIdleUs = 1050;
  private throttleMaxUs = 1950;
  private knobUs = 1050;
  private softwareThrottleUs = 1050;
  private throttleAuthority: ThrottleAuthority = 'HW_KNOB';

  private edgeLinkOnline = true;
  private armed = false;
  private ignitionOn = false;
  private starterCranking = false;
  private estopLatched = false;
  private engineRunning = false;
  private crankElapsedSeconds = 0;
  private runTimeSeconds = 0;

  private latitude = -6.208763;
  private longitude = 106.845599;
  private altitudeMeters = 42.5;
  private headingDegrees = 48;

  private isKnobAtIdle(): boolean {
    return this.knobUs <= this.knobIdleUs + IDLE_TOLERANCE_US;
  }

  start(onSnapshot: (snapshot: TelemetrySnapshot) => void): void {
    this.stop();
    this.lastTickMs = performance.now();
    onSnapshot(this.buildSnapshot());
    this.timerId = window.setInterval(() => {
      this.advancePhysics();
      onSnapshot(this.buildSnapshot());
    }, TICK_INTERVAL_MS);
  }

  stop(): void {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  sendCommand(command: TelemetryCommand): CommandAck {
    switch (command.type) {
      case 'ESTOP':
        this.estopLatched = true;
        this.ignitionOn = false;
        this.starterCranking = false;
        this.armed = false;
        this.engineRunning = false;
        this.softwareThrottleUs = this.knobIdleUs;
        this.knobUs = this.knobIdleUs;
        this.throttleAuthority = 'HW_KNOB';
        this.crankElapsedSeconds = 0;
        return { accepted: true, reason: 'Emergency stop activated' };

      case 'CLEAR_ESTOP':
        if (!this.isKnobAtIdle()) {
          return { accepted: false, reason: 'Set throttle handle to 0% first' };
        }
        this.estopLatched = false;
        return { accepted: true, reason: 'Reset complete' };

      case 'SET_ARMED':
        if (!command.armed) {
          this.armed = false;
          this.ignitionOn = false;
          this.starterCranking = false;
          this.engineRunning = false;
          return { accepted: true, reason: 'Controls locked' };
        }
        if (this.estopLatched) {
          return { accepted: false, reason: 'Reset emergency stop first' };
        }
        if (!this.edgeLinkOnline) {
          return { accepted: false, reason: 'Engine signal lost' };
        }
        if (!this.isKnobAtIdle()) {
          return { accepted: false, reason: 'Set throttle handle to 0% first' };
        }
        this.armed = true;
        return { accepted: true, reason: 'Controls unlocked' };

      case 'SET_IGNITION':
        if (command.on) {
          if (!this.armed || this.estopLatched) {
            return { accepted: false, reason: 'Unlock controls first' };
          }
          if (this.fuelPercent <= 0) {
            return { accepted: false, reason: 'Fuel tank empty' };
          }
          this.ignitionOn = true;
          return { accepted: true, reason: 'Ignition on' };
        }
        this.ignitionOn = false;
        this.engineRunning = false;
        return { accepted: true, reason: 'Ignition off' };

      case 'SET_STARTER':
        if (command.active) {
          if (!this.armed || this.estopLatched) {
            return { accepted: false, reason: 'Unlock controls first' };
          }
          this.starterCranking = true;
          return { accepted: true, reason: 'Starting' };
        }
        this.starterCranking = false;
        this.crankElapsedSeconds = 0;
        return { accepted: true, reason: 'Starter released' };

      case 'SET_THROTTLE_AUTHORITY':
        this.throttleAuthority = command.authority;
        if (command.authority === 'SW_OVERRIDE') {
          this.softwareThrottleUs = this.knobUs;
        }
        return { accepted: true, reason: 'Throttle mode updated' };

      case 'SET_THROTTLE_US': {
        if (this.throttleAuthority !== 'SW_OVERRIDE' || !this.armed || this.estopLatched) {
          return { accepted: false, reason: 'Unlock controls to move throttle' };
        }
        this.softwareThrottleUs = Math.max(
          this.knobIdleUs,
          Math.min(this.throttleMaxUs, Math.round(command.microseconds))
        );
        return { accepted: true, reason: 'Throttle updated' };
      }

      case 'SET_SIM_KNOB_US':
        this.knobUs = Math.max(
          this.knobIdleUs,
          Math.min(this.throttleMaxUs, Math.round(command.microseconds))
        );
        return { accepted: true, reason: 'Handle moved' };

      case 'RESET_PEAK_RPM':
        this.peakRpm = this.rpm;
        return { accepted: true, reason: 'Peak RPM reset' };

      case 'RAW_SERIAL':
        return { accepted: true, reason: command.line };
    }
  }

  private advancePhysics(): void {
    const now = performance.now();
    const dt = Math.max(0.01, Math.min(0.25, (now - this.lastTickMs) / 1000));
    this.lastTickMs = now;

    const activeUs =
      this.throttleAuthority === 'SW_OVERRIDE' ? this.softwareThrottleUs : this.knobUs;
    const span = Math.max(1, this.throttleMaxUs - this.knobIdleUs);
    const throttlePct = Math.max(0, Math.min(100, ((activeUs - this.knobIdleUs) / span) * 100));

    if (this.starterCranking) {
      this.crankElapsedSeconds += dt;
      if (this.crankElapsedSeconds >= MAX_CRANK_SECONDS) {
        this.starterCranking = false;
        this.crankElapsedSeconds = 0;
      }
    }

    if (this.fuelPercent <= 0) {
      this.engineRunning = false;
    }

    if (this.starterCranking && !this.engineRunning) {
      const targetCrank = 540 + (Math.random() - 0.5) * 35;
      this.rpm += (targetCrank - this.rpm) * Math.min(1, dt * 6);
      if (this.ignitionOn && this.fuelPercent > 0 && this.crankElapsedSeconds >= 0.75) {
        this.engineRunning = true;
        this.rpm = 1750;
      }
    } else if (this.engineRunning && this.ignitionOn && this.fuelPercent > 0) {
      const targetRpm = 1920 + Math.pow(throttlePct / 100, 0.92) * 6500;
      const vibration = Math.sin(now * 0.025) * 18 + (Math.random() - 0.5) * 24;
      const responseRate = targetRpm > this.rpm ? 2.8 : 2.0;
      this.rpm += (targetRpm - this.rpm) * Math.min(1, dt * responseRate) + vibration * dt * 6;
      this.rpm = Math.max(1650, this.rpm);
      this.runTimeSeconds += dt;

      const burnPerSec = 0.012 + (throttlePct / 100) * 0.065;
      this.fuelPercent = Math.max(0, this.fuelPercent - burnPerSec * dt);
    } else {
      this.engineRunning = false;
      this.rpm = Math.max(0, this.rpm - (1500 + this.rpm * 1.45) * dt);
    }

    this.hallRpm = Math.max(0, this.rpm + (this.rpm > 120 ? (Math.random() - 0.5) * 16 : 0));
    this.rawRpm =
      this.engineRunning && Math.random() < 0.05 ? this.rpm + 1900 + Math.random() * 2200 : this.rpm;
    this.peakRpm = Math.max(this.peakRpm, this.rpm);

    const targetSpeed = this.engineRunning
      ? Math.max(0, ((this.rpm - 1700) / 6800) * 138)
      : 0;
    this.speedKmh += (targetSpeed - this.speedKmh) * Math.min(1, dt * 1.4);
    if (this.speedKmh < 0.2) this.speedKmh = 0;

    const targetTemp = this.engineRunning ? 116 + (throttlePct / 100) * 86 : 28.4;
    const tempRate = this.engineRunning ? 0.09 + (throttlePct / 100) * 0.08 : 0.04;
    const prevTemp = this.temperatureC;
    this.temperatureC +=
      (targetTemp - this.temperatureC) * Math.min(1, dt * tempRate) + (Math.random() - 0.5) * 0.12;
    this.temperatureTrendCPerSec = (this.temperatureC - prevTemp) / dt;

    this.windPhase += dt;
    const targetWind =
      14.0 + Math.sin(this.windPhase * 0.35) * 4.5 + Math.sin(this.windPhase * 1.1) * 1.8;
    this.windSpeedKmh += (targetWind - this.windSpeedKmh) * Math.min(1, dt * 1.6);
    this.windDirectionDegrees =
      (315 + Math.round(Math.sin(this.windPhase * 0.2) * 14) + 360) % 360;

    if (this.speedKmh > 1) {
      this.headingDegrees = (this.headingDegrees + dt * 3.5) % 360;
      const rad = (this.headingDegrees * Math.PI) / 180;
      const stepDeg = (this.speedKmh / 3600) * dt * 0.009;
      this.latitude += Math.cos(rad) * stepDeg;
      this.longitude += Math.sin(rad) * stepDeg;
      this.altitudeMeters = 42.5 + (this.speedKmh / 140) * 75;
    }
  }

  private buildSnapshot(): TelemetrySnapshot {
    const activeUs =
      this.throttleAuthority === 'SW_OVERRIDE' ? this.softwareThrottleUs : this.knobUs;
    const span = Math.max(1, this.throttleMaxUs - this.knobIdleUs);
    const throttlePercent = Math.max(
      0,
      Math.min(100, ((activeUs - this.knobIdleUs) / span) * 100)
    );

    let temperatureFault: TemperatureFault = 'NOMINAL';
    if (this.temperatureC >= DEFAULT_THRESHOLDS.tempCritC) {
      temperatureFault = 'OVERHEAT';
    } else if (this.temperatureC >= DEFAULT_THRESHOLDS.tempWarnC) {
      temperatureFault = 'WARN_HIGH';
    }

    let enginePhase: EnginePhase = 'STOPPED';
    if (this.estopLatched) enginePhase = 'E-STOP';
    else if (this.starterCranking && !this.engineRunning) enginePhase = 'CRANKING';
    else if (this.engineRunning) {
      if (throttlePercent >= 85) enginePhase = 'WOT';
      else if (throttlePercent <= 8) enginePhase = 'IDLE';
      else enginePhase = 'RUNNING';
    }

    return {
      timestampMs: Date.now(),
      source: 'SIM',
      heartbeatMs: Math.round(14 + Math.random() * 8),
      enginePhase,
      runTimeSeconds: Math.round(this.runTimeSeconds * 10) / 10,
      speedKmh: Math.round(this.speedKmh * 10) / 10,
      speedKnots: Math.round(this.speedKmh * 0.539957 * 10) / 10,
      rpm: Math.round(this.rpm),
      rawRpm: Math.round(this.rawRpm),
      hallRpm: Math.round(this.hallRpm),
      peakRpm: Math.round(this.peakRpm),
      temperatureC: Math.round(this.temperatureC * 10) / 10,
      temperatureTrendCPerSec: Math.round(this.temperatureTrendCPerSec * 100) / 100,
      temperatureFault,
      throttlePercent: Math.round(throttlePercent * 10) / 10,
      throttleUs: activeUs,
      knobUs: this.knobUs,
      knobIdleUs: this.knobIdleUs,
      throttleMaxUs: this.throttleMaxUs,
      throttleAuthority: this.throttleAuthority,
      fuelPercent: Math.round(this.fuelPercent * 10) / 10,
      windSpeedKmh: Math.round(this.windSpeedKmh * 10) / 10,
      windDirectionDegrees: this.windDirectionDegrees,
      gps: {
        fix: '3D_FIX',
        satellites: 14,
        hdop: 0.72,
        latitude: Number(this.latitude.toFixed(6)),
        longitude: Number(this.longitude.toFixed(6)),
        altitudeMeters: Math.round(this.altitudeMeters * 10) / 10,
        headingDegrees: Math.round(this.headingDegrees),
      },
      interlocks: {
        edgeLinkOnline: this.edgeLinkOnline,
        knobAtIdle: this.isKnobAtIdle(),
        armed: this.armed,
        ignitionOn: this.ignitionOn,
        starterCranking: this.starterCranking,
        estopLatched: this.estopLatched,
        buttonACdi: 'up',
        buttonBStarter: this.starterCranking ? 'DOWN' : 'up',
      },
    };
  }
}

export class PassiveEspTransport implements EspTelemetryTransport {
  readonly source = 'ESP32' as const;

  start(): void {}

  stop(): void {}

  sendCommand(command: TelemetryCommand): CommandAck {
    return { accepted: false, reason: `Waiting for ESP32 (${command.type})` };
  }
}
