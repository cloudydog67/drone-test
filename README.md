# drone-engine-gcs

Single-screen, high-legibility tactical Ground Control Station UI for a twin-cylinder gasoline drone engine test stand.

## Telemetry Coverage
- **RPM**: Radial tachometer (`0–10,000 RPM`), redline arc, Peak RPM, Hall backup RPM.
- **SPEED**: Ground/Air speed (`KM/H` and `KT`) with range bar.
- **GPS**: Fix mode (`NO_FIX` / `2D_FIX` / `3D_FIX` / `RTK_FIX`), satellites, HDOP, Latitude, Longitude, Altitude (`M`), Heading (`°`), compass ring.
- **TEMP**: Cylinder Head Temperature (`°C`), thermal rate (`°C/s`), warning/overheat markers, MAX6675 probe fault alerts.
- **THROTTLE**: Percentage (`%`), raw PWM (`µS`), physical knob reference, non-blocking `HW_KNOB` / `SW_OVERRIDE` control.

## Run Locally
```powershell
npm install
npm run dev
```

## ESP32 Integration Contract (For Follow-Up Agents)
No blocking modals or hardware-waiting UI gates exist. Feed live ESP32 data from WebSerial, WebSocket, or a serial bridge through `src/telemetry/telemetryBus.ts`:

```ts
import { espTelemetryBus } from './src/telemetry/telemetryBus';

espTelemetryBus.pushSnapshot({
  source: 'ESP32',
  rpm: 4250,
  speedKmh: 62.4,
  temperatureC: 154.2,
  throttlePercent: 42,
  throttleUs: 1428,
  gps: {
    fix: '3D_FIX',
    satellites: 13,
    hdop: 0.8,
    latitude: -6.2088,
    longitude: 106.8456,
    altitudeMeters: 55.0,
    headingDegrees: 92,
  },
});
```

Or implement `EspTelemetryTransport` from `src/telemetry/telemetryTypes.ts` and call `espTelemetryBus.attachTransport(yourEspTransport)`. Also exposed globally on `window.espTelemetryBus`.
