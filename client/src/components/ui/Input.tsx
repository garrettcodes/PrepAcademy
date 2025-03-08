import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  fullWidth = true,
  id,
  ...props
}) => {
  // Generate a random ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';
  
  // Error style
  const errorStyle = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary focus:border-primary';
  
  return (
    <div className={widthStyle}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`shadow-sm appearance-none rounded-md relative block ${widthStyle} px-3 py-2 border ${errorStyle} placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 sm:text-sm ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input; 