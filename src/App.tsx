import { useState } from 'react';
import { useTelemetry } from './telemetry/useTelemetry';
import { CommandHeader } from './components/CommandHeader';
import { RpmGaugeCard } from './components/RpmGaugeCard';
import { SpeedCard } from './components/SpeedCard';
import { TemperatureCard } from './components/TemperatureCard';
import { ThrottleCard } from './components/ThrottleCard';
import { FuelCard } from './components/FuelCard';
import { WindCard } from './components/WindCard';
import { GpsStatusCard } from './components/GpsStatusCard';
import { TelemetryTrendChart } from './components/TelemetryTrendChart';
import { EngineControlDeck } from './components/EngineControlDeck';

export function App() {
  const [daylightMode, setDaylightMode] = useState(false);

  const {
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
  } = useTelemetry();

  const ambientTone = snapshot.interlocks.estopLatched
    ? 'ambient-danger'
    : snapshot.enginePhase === 'WOT'
    ? 'ambient-warn'
    : snapshot.enginePhase === 'RUNNING' || snapshot.enginePhase === 'IDLE'
    ? 'ambient-running'
    : '';

  const rootClass = [
    'gcs-screen',
    ambientTone,
    daylightMode ? 'theme-daylight' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} data-testid="gcs-root">
      <CommandHeader
        snapshot={snapshot}
        sourceMode={sourceMode}
        watchdogAgeMs={watchdogAgeMs}
        recording={recording}
        recordingSeconds={recordingSeconds}
        lastAck={lastAck}
        daylightMode={daylightMode}
        onToggleDaylight={() => setDaylightMode((v) => !v)}
        onSwitchSource={switchSourceMode}
        onToggleRecord={toggleRecording}
        onEstop={() => sendCommand({ type: 'ESTOP' })}
        onClearEstop={() => sendCommand({ type: 'CLEAR_ESTOP' })}
      />

      <main className="gcs-grid">
        <section className="telemetry-row">
          <RpmGaugeCard snapshot={snapshot} />
          <SpeedCard snapshot={snapshot} />
          <TemperatureCard snapshot={snapshot} />
          <ThrottleCard
            snapshot={snapshot}
            onSetAuthority={(authority) =>
              sendCommand({ type: 'SET_THROTTLE_AUTHORITY', authority })
            }
            onSetThrottleUs={(microseconds) =>
              sendCommand({ type: 'SET_THROTTLE_US', microseconds })
            }
          />
        </section>

        <section className="operations-row">
          <TelemetryTrendChart
            history={history}
            paused={chartPaused}
            onTogglePause={toggleChartPaused}
          />

          <div className="middle-stack">
            <div className="env-pair-row">
              <FuelCard snapshot={snapshot} />
              <WindCard snapshot={snapshot} />
            </div>
            <GpsStatusCard snapshot={snapshot} />
          </div>

          <EngineControlDeck
            snapshot={snapshot}
            sourceMode={sourceMode}
            onToggleArm={() =>
              sendCommand({ type: 'SET_ARMED', armed: !snapshot.interlocks.armed })
            }
            onToggleIgnition={() =>
              sendCommand({
                type: 'SET_IGNITION',
                on: !snapshot.interlocks.ignitionOn,
              })
            }
            onStarterStart={() => sendCommand({ type: 'SET_STARTER', active: true })}
            onStarterStop={() => sendCommand({ type: 'SET_STARTER', active: false })}
            onSimKnobChange={(microseconds) =>
              sendCommand({ type: 'SET_SIM_KNOB_US', microseconds })
            }
          />
        </section>
      </main>
    </div>
  );
}

export default App;
