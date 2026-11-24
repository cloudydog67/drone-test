# drone-engine-gcs

Single-screen, high-legibility Ground Control Station UI for a twin-cylinder gasoline drone engine test stand.

## Telemetry Coverage
- **RPM**: Radial tachometer (`0–10,000 RPM`), redline arc, Peak RPM.
- **Speed**: Ground/Air speed (`km/h` and `knots`) with 16-segment illuminated meter.
- **Temperature**: Cylinder Head Temperature (`°C`) with Green → Amber → Red thermal spectrum bar and fault detection.
- **Throttle**: Percentage (`%`), tick-ruler control slider, non-blocking `HW_KNOB` / `SW_OVERRIDE` switching.
- **Fuel**: Fuel tank percentage (`%`) with low/critical fuel markers (`≤25%` Low, `≤12%` Critical).
- **Wind Speed**: Ambient wind speed (`km/h` and `m/s`) with direction (`N/NE/...` & degrees) and Calm/Breeze/Strong/High status.
- **GPS**: Lock state, satellite signal bars, Latitude, Longitude, Altitude (`m`), and live heading compass.

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
  fuelPercent: 78.5,
  windSpeedKmh: 16.2,
  windDirectionDegrees: 310,
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
