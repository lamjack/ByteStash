import React, { forwardRef } from 'react';

export interface IconButtonProps {
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  label?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'action' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  showLabel?: boolean;
  pressed?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  onClick,
  label,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  showLabel = false,
  pressed,
}, ref) => {
  const baseClasses = 'flex items-center justify-center gap-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary focus-visible:ring-offset-1 focus-visible:ring-offset-light-bg dark:focus-visible:ring-offset-dark-bg';
  const variantClasses = {
    primary: 'bg-light-hover dark:bg-dark-hover hover:bg-light-hover dark:hover:bg-dark-hover text-light-text dark:text-dark-text',
    secondary: 'bg-light-surface dark:bg-dark-surface hover:bg-light-hover dark:hover:bg-dark-hover text-light-text dark:text-dark-text',
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white',
    action: 'bg-light-primary dark:bg-dark-primary hover:opacity-90 text-white',
    custom: ''
  };
  const sizeClasses = {
    sm: label ? 'min-h-9 min-w-9 px-2 text-sm' : 'h-9 w-9',
    md: label ? 'min-h-10 px-3 text-base' : 'h-10 w-10',
    lg: label ? 'min-h-11 px-4 text-lg' : 'h-11 w-11'
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(e);
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      disabled={disabled}
      type={type}
      aria-pressed={pressed}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      title={label}
      aria-label={label}
    >
      {icon}
      {(label && showLabel) && <span className="whitespace-nowrap">{label}</span>}
    </button>
  );
});

IconButton.displayName = 'IconButton';
