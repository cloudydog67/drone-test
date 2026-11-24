import React from 'react';
import { Compass, Satellite } from 'lucide-react';
import { PanelCard } from './ui/PanelCard';
import { StatusPill, type PillTone } from './ui/StatusPill';
import type { TelemetrySnapshot } from '../telemetry/telemetryTypes';

export interface GpsStatusCardProps {
  snapshot: TelemetrySnapshot;
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
      title="GPS NAVIGATION"
      testId="gps-card"
      badge={
        <StatusPill
          icon={<Satellite size={12} />}
          label={`${gps.fix.replace('_', ' ')} • ${gps.satellites} SAT`}
          tone={fixTone}
        />
      }
    >
      <div className="gps-card-content">
        <div className="gps-top-row">
          <div className="gps-coords">
            <div className="coord-item">
              <span className="substat-label">LATITUDE</span>
              <span className="coord-value mono" data-testid="gps-lat">
                {gps.latitude.toFixed(6)}°
              </span>
            </div>
            <div className="coord-item">
              <span className="substat-label">LONGITUDE</span>
              <span className="coord-value mono" data-testid="gps-lon">
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
              stroke="#38bdf8"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx={arrowX} cy={arrowY} r="3.5" fill="#ef4444" />
            <circle cx="48" cy="48" r="3" fill="#f8fafc" />
          </svg>
        </div>

        <div className="gps-metrics-row">
          <div className="substat">
            <span className="substat-label">ALTITUDE</span>
            <span className="substat-value mono" data-testid="gps-alt">
              {gps.altitudeMeters.toFixed(1)} M
            </span>
          </div>
          <div className="substat">
            <span className="substat-label">HEADING</span>
            <span className="substat-value mono" data-testid="gps-hdg">
              <Compass size={12} /> {String(gps.headingDegrees).padStart(3, '0')}°
            </span>
          </div>
          <div className="substat">
            <span className="substat-label">HDOP</span>
            <span className="substat-value mono">{gps.hdop.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </PanelCard>
  );
};
