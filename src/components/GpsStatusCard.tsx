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

  return (
    <PanelCard
      title="GPS"
      testId="gps-card"
      badge={<StatusPill label={fixStatus.label} tone={fixStatus.tone} dot />}
    >
      <div className="simple-metric-body">
        <div className="gps-simple-list">
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
          <div className="gps-row">
            <span className="muted-label">Altitude</span>
            <span className="gps-val num" data-testid="gps-alt">
              {gps.altitudeMeters.toFixed(0)} m
            </span>
          </div>
          <div className="gps-row">
            <span className="muted-label">Direction</span>
            <span className="gps-val num" data-testid="gps-hdg">
              {compassDirection(gps.headingDegrees)} ({gps.headingDegrees}°)
            </span>
          </div>
        </div>

        <div className="card-footer-line">
          <span className="muted-label">Satellites</span>
          <span className="footer-val num">{gps.satellites} connected</span>
        </div>
      </div>
    </PanelCard>
  );
};
