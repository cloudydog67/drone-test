import React from 'react';
import clsx from 'clsx';
import type { PillTone } from './StatusPill';

export interface BarMarker {
  percent: number;
  tone: PillTone;
  title?: string;
}

export interface MetricBarProps {
  percent: number;
  tone?: PillTone;
  markers?: BarMarker[];
  height?: number;
}

export const MetricBar: React.FC<MetricBarProps> = ({
  percent,
  tone = 'accent',
  markers = [],
  height = 8,
}) => {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="metric-bar-track" style={{ height }}>
      <div
        className={clsx('metric-bar-fill', `fill-${tone}`)}
        style={{ width: `${clamped}%` }}
      />
      {markers.map((marker, index) => (
        <span
          key={index}
          title={marker.title}
          className={clsx('metric-bar-marker', `fill-${marker.tone}`)}
          style={{ left: `${Math.max(0, Math.min(100, marker.percent))}%` }}
        />
      ))}
    </div>
  );
};
