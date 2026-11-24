import React from 'react';
import clsx from 'clsx';

export interface PanelCardProps {
  title?: string;
  badge?: React.ReactNode;
  className?: string;
  testId?: string;
  children: React.ReactNode;
}

export const PanelCard: React.FC<PanelCardProps> = ({
  title,
  badge,
  className,
  testId,
  children,
}) => {
  return (
    <section className={clsx('panel-card', className)} data-testid={testId}>
      {(title || badge) && (
        <header className="panel-header">
          {title ? <h2 className="panel-title">{title}</h2> : <span />}
          {badge && <div className="panel-badge">{badge}</div>}
        </header>
      )}
      <div className="panel-body">{children}</div>
    </section>
  );
};
