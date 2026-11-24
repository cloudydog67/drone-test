import React from 'react';
import clsx from 'clsx';

export type PillTone = 'neutral' | 'go' | 'warn' | 'danger' | 'accent';

export interface StatusPillProps {
  label: string;
  tone?: PillTone;
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
  testId?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  tone = 'neutral',
  dot = false,
  icon,
  className,
  testId,
}) => {
  return (
    <span className={clsx('status-pill', `tone-${tone}`, className)} data-testid={testId}>
      {dot && <span className={clsx('pill-dot', `dot-${tone}`)} />}
      {icon}
      <span>{label}</span>
    </span>
  );
};
