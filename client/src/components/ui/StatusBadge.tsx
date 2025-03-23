import React, { ReactNode } from 'react';

export interface StatusBadgeProps {
  children: ReactNode;
  variant?: 'success' | 'primary' | 'secondary' | 'warning' | 'danger' | 'outline' | 'ghost';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className = '' 
}) => {
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    secondary: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    outline: 'bg-transparent border-gray-300 text-gray-700',
    ghost: 'bg-transparent text-gray-700'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default StatusBadge; 