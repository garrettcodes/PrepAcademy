import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactElement;
  isOpen?: boolean;
  onClose?: () => void;
  highlight?: boolean;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  isOpen: controlledIsOpen,
  onClose,
  highlight = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(controlledIsOpen || false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);
  
  // Handle controlled component
  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        childRef.current &&
        !childRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
        if (onClose) onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  const handleToggle = () => {
    if (controlledIsOpen === undefined) {
      setIsOpen(!isOpen);
    } else if (onClose && isOpen) {
      onClose();
    }
  };
  
  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };
  
  // Arrow classes
  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-[-6px] left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent';
      case 'right':
        return 'left-[-6px] top-1/2 transform -translate-y-1/2 border-t-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'top-[-6px] left-1/2 transform -translate-x-1/2 border-l-transparent border-t-transparent border-r-transparent';
      case 'left':
        return 'right-[-6px] top-1/2 transform -translate-y-1/2 border-t-transparent border-l-transparent border-b-transparent';
      default:
        return 'bottom-[-6px] left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent';
    }
  };
  
  // Clone the child element to add necessary props
  const childElement = React.cloneElement(children, {
    ref: childRef,
    onClick: (e: React.MouseEvent) => {
      handleToggle();
      if (children.props.onClick) {
        children.props.onClick(e);
      }
    },
    className: `${children.props.className || ''} ${
      highlight ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white' : ''
    }`,
  });
  
  return (
    <div className="relative inline-block">
      {childElement}
      
      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${getPositionClasses()} ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white shadow-lg rounded-md p-3 relative max-w-xs">
            <div
              className={`absolute border-4 border-white ${getArrowClasses()}`}
            ></div>
            <div className="text-gray-700 text-sm">{content}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip; 