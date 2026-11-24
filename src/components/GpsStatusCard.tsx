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
  const headingRad = ((gps.headingDegrees - 90) * Math.PI) / 180;
  const tipX = 32 + Math.cos(headingRad) * 20;
  const tipY = 32 + Math.sin(headingRad) * 20;

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
          <svg viewBox="0 0 64 64" className="mini-compass" aria-hidden="true">
            <circle cx="32" cy="32" r="28" fill="#101216" stroke="#2a2f3a" strokeWidth="1.5" />
            <text x="32" y="13" textAnchor="middle" fill="#6b7280" fontSize="8" fontWeight="600">
              N
            </text>
            <line
              x1="32"
              y1="32"
              x2={tipX}
              y2={tipY}
              stroke="#38bdf8"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx={tipX} cy={tipY} r="3" fill="#ef4444" />
            <circle cx="32" cy="32" r="2.5" fill="#f9fafb" />
          </svg>

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
