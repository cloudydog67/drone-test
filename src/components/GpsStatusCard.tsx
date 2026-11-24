import React from 'react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill, type PillTone } from './ui/StatusPill';
import type { GpsFixMode, TelemetrySnapshot } from '../telemetry/telemetryTypes';

export interface GpsStatusCardProps {
  snapshot: TelemetrySnapshot;
}

function formatFix(fix: GpsFixMode): string {
  switch (fix) {
    case 'NO_FIX':
      return 'No Fix';
    case '2D_FIX':
      return '2D Fix';
    case '3D_FIX':
      return '3D Fix';
    case 'RTK_FIX':
      return 'RTK Fix';
  }
}

export const GpsStatusCard: React.FC<GpsStatusCardProps> = ({ snapshot }) => {
  const { gps } = snapshot;

  const fixTone: PillTone =
    gps.fix === '3D_FIX' || gps.fix === 'RTK_FIX'
      ? 'go'
      : gps.fix === '2D_FIX'
      ? 'warn'
      : 'danger';

  const headingRad = ((gps.headingDegrees - 90) * Math.PI) / 180;
  const arrowX = 48 + Math.cos(headingRad) * 32;
  const arrowY = 48 + Math.sin(headingRad) * 32;

  return (
    <PanelCard
      title="GPS"
      testId="gps-card"
      badge={
        <StatusPill
          label={`${formatFix(gps.fix)} · ${gps.satellites} sat`}
          tone={fixTone}
          dot
        />
      }
    >
      <div className="gps-card-content">
        <div className="gps-top-row">
          <div className="gps-coords">
            <div className="coord-item">
              <span className="substat-label">Latitude</span>
              <span className="coord-value num" data-testid="gps-lat">
                {gps.latitude.toFixed(6)}°
              </span>
            </div>
            <div className="coord-item">
              <span className="substat-label">Longitude</span>
              <span className="coord-value num" data-testid="gps-lon">
                {gps.longitude.toFixed(6)}°
              </span>
            </div>
          </div>

          <svg viewBox="0 0 96 96" className="gps-compass-svg" aria-label="GPS Heading">
            <circle cx="48" cy="48" r="42" className="compass-ring" />
            <circle cx="48" cy="48" r="24" className="compass-inner" />
            <line x1="48" y1="8" x2="48" y2="88" className="compass-axis" />
            <line x1="8" y1="48" x2="88" y2="48" className="compass-axis" />
            <text x="48" y="16" textAnchor="middle" className="compass-cardinal">
              N
            </text>
            <text x="48" y="86" textAnchor="middle" className="compass-cardinal">
              S
            </text>
            <text x="14" y="51" textAnchor="middle" className="compass-cardinal">
              W
            </text>
            <text x="82" y="51" textAnchor="middle" className="compass-cardinal">
              E
            </text>
            <line
              x1="48"
              y1="48"
              x2={arrowX}
              y2={arrowY}
              stroke="#3b82f6"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx={arrowX} cy={arrowY} r="3.5" fill="#ef4444" />
            <circle cx="48" cy="48" r="3" fill="#f9fafb" />
          </svg>
        </div>

        <div className="gps-metrics-row">
          <div className="substat">
            <span className="substat-label">Altitude</span>
            <span className="substat-value num" data-testid="gps-alt">
              {gps.altitudeMeters.toFixed(1)} m
            </span>
          </div>
          <div className="substat">
            <span className="substat-label">Heading</span>
            <span className="substat-value num" data-testid="gps-hdg">
              {String(gps.headingDegrees).padStart(3, '0')}°
            </span>
          </div>
          <div className="substat">
            <span className="substat-label">HDOP</span>
            <span className="substat-value num">{gps.hdop.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </PanelCard>
  );
};
