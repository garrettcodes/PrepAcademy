import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  headerAction?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  footer,
  headerAction,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Card Header (if title or headerAction exists) */}
      {(title || headerAction) && (
        <div className="border-b px-4 py-3 flex justify-between items-center">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      
      {/* Card Body */}
      <div className="px-4 py-5 sm:p-6">{children}</div>
      
      {/* Card Footer (if exists) */}
      {footer && <div className="border-t px-4 py-3 bg-gray-50">{footer}</div>}
    </div>
  );
};

export default Card; 