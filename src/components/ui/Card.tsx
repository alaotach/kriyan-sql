import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, hoverable = false, onClick, className = '' }: CardProps) {
  const baseStyles = 'bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 transition-all duration-150';
  const hoverStyles = hoverable
    ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-98'
    : '';

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
