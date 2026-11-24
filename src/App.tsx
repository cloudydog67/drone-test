import { useTelemetry } from './telemetry/useTelemetry';
import { CommandHeader } from './components/CommandHeader';
import { RpmGaugeCard } from './components/RpmGaugeCard';
import { SpeedThrottleCard } from './components/SpeedThrottleCard';
import { TemperatureCard } from './components/TemperatureCard';
import { GpsStatusCard } from './components/GpsStatusCard';
import { TelemetryTrendChart } from './components/TelemetryTrendChart';
import { EngineControlDeck } from './components/EngineControlDeck';

export function App() {
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

  return (
    <div className="gcs-screen" data-testid="gcs-root">
      <CommandHeader
        snapshot={snapshot}
        sourceMode={sourceMode}
        watchdogAgeMs={watchdogAgeMs}
        recording={recording}
        recordingSeconds={recordingSeconds}
        lastAck={lastAck}
        onSwitchSource={switchSourceMode}
        onToggleRecord={toggleRecording}
        onEstop={() => sendCommand({ type: 'ESTOP' })}
        onClearEstop={() => sendCommand({ type: 'CLEAR_ESTOP' })}
      />

      <main className="gcs-grid">
        <section className="telemetry-row">
          <RpmGaugeCard
            snapshot={snapshot}
            onResetPeak={() => sendCommand({ type: 'RESET_PEAK_RPM' })}
          />
          <SpeedThrottleCard
            snapshot={snapshot}
            onSetAuthority={(authority) =>
              sendCommand({ type: 'SET_THROTTLE_AUTHORITY', authority })
            }
            onSetThrottleUs={(microseconds) =>
              sendCommand({ type: 'SET_THROTTLE_US', microseconds })
            }
          />
          <TemperatureCard snapshot={snapshot} />
          <GpsStatusCard snapshot={snapshot} />
        </section>

        <section className="operations-row">
          <TelemetryTrendChart
            history={history}
            paused={chartPaused}
            onTogglePause={toggleChartPaused}
          />
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
