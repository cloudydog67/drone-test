import React from 'react';
import clsx from 'clsx';

export interface MomentaryButtonProps {
  active: boolean;
  disabled?: boolean;
  onPressStart: () => void;
  onPressEnd: () => void;
  className?: string;
  testId?: string;
  children: React.ReactNode;
}

export const MomentaryButton: React.FC<MomentaryButtonProps> = ({
  active,
  disabled = false,
  onPressStart,
  onPressEnd,
  className,
  testId,
  children,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      data-testid={testId}
      className={clsx('momentary-btn', active && 'is-active', className)}
      onPointerDown={(event) => {
        if (disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        onPressStart();
      }}
      onPointerUp={onPressEnd}
      onPointerCancel={onPressEnd}
      onLostPointerCapture={onPressEnd}
      onBlur={onPressEnd}
    >
      {children}
    </button>
  );
};
