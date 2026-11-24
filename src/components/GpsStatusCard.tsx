import React from 'react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill, type PillTone } from './ui/StatusPill';
import type { GpsFixMode, TelemetrySnapshot } from '../telemetry/telemetryTypes';

export interface GpsStatusCardProps {
  snapshot: TelemetrySnapshot;
}

function compassDirection(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
  return dirs[idx];
}

function formatFix(fix: GpsFixMode): { label: string; tone: PillTone } {
  if (fix === '3D_FIX' || fix === 'RTK_FIX') {
    return { label: 'Locked', tone: 'go' };
  }
  if (fix === '2D_FIX') {
    return { label: 'Weak', tone: 'warn' };
  }
  return { label: 'No Signal', tone: 'danger' };
}

export const GpsStatusCard: React.FC<GpsStatusCardProps> = ({ snapshot }) => {
  const { gps } = snapshot;
  const fixStatus = formatFix(gps.fix);
  const signalBars = Math.min(5, Math.max(0, Math.round(gps.satellites / 3)));
  const locked = gps.fix === '3D_FIX' || gps.fix === 'RTK_FIX';

  return (
    <PanelCard
      title="GPS"
      testId="gps-card"
      badge={
        <div className="gps-badge-group">
          <div className="signal-bars" aria-label={`GPS signal ${signalBars} of 5`}>
            {[1, 2, 3, 4, 5].map((level) => (
              <span
                key={level}
                className={level <= signalBars ? 'sig-bar is-active' : 'sig-bar'}
                style={{ height: 4 + level * 2.2 }}
              />
            ))}
          </div>
          <StatusPill label={`${fixStatus.label} · ${gps.satellites}`} tone={fixStatus.tone} dot />
        </div>
      }
    >
      <div className="gps-wide-body">
        <div className="gps-wide-left">
          <div className="radar-shell" aria-hidden="true">
            {locked && <div className="radar-sweep" />}
            <svg viewBox="0 0 72 72" className="radar-svg">
              <circle cx="36" cy="36" r="32" fill="none" stroke="#283142" strokeWidth="1.2" />
              <circle cx="36" cy="36" r="21" fill="none" stroke="#1c2230" strokeWidth="1" />
              <circle cx="36" cy="36" r="10" fill="none" stroke="#1c2230" strokeWidth="1" />
              <line x1="36" y1="4" x2="36" y2="68" stroke="#1c2230" strokeWidth="1" />
              <line x1="4" y1="36" x2="68" y2="36" stroke="#1c2230" strokeWidth="1" />
              <g
                style={{
                  transformOrigin: '36px 36px',
                  transform: `rotate(${gps.headingDegrees}deg)`,
                  transition: 'transform 0.3s ease',
                }}
              >
                <polygon points="36,24 30.5,41 36,37.5 41.5,41" fill="#38bdf8" />
              </g>
            </svg>
          </div>

          <div className="gps-direction-block">
            <span className="gps-heading-big num" data-testid="gps-hdg">
              {compassDirection(gps.headingDegrees)} {gps.headingDegrees}°
            </span>
            <span className="muted-label num" data-testid="gps-alt">
              Altitude {gps.altitudeMeters.toFixed(0)} m
            </span>
          </div>
        </div>

        <div className="gps-coords-box">
          <div className="gps-row">
            <span className="muted-label">Latitude</span>
            <span className="gps-val num" data-testid="gps-lat">
              {gps.latitude.toFixed(5)}°
            </span>
          </div>
          <div className="gps-row">
            <span className="muted-label">Longitude</span>
            <span className="gps-val num" data-testid="gps-lon">
              {gps.longitude.toFixed(5)}°
            </span>
          </div>
        </div>
      </div>
    </PanelCard>
  );
};
