import { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'outlined';
  size?: 'sm' | 'md';
  className?: string;
}

export function Chip({
  children,
  active = false,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
}: ChipProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 whitespace-nowrap';

  const variants = {
    default: active
      ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700',
    primary: 'bg-sky-500 text-white hover:bg-sky-600',
    outlined: 'border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
  };

  const clickableStyles = onClick ? 'cursor-pointer active:scale-95' : '';

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
