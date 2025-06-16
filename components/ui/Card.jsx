import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'md',
  ...props 
}) => {
  const baseClasses = 'rounded-lg';
  
  const variants = {
    default: 'bg-gray-800 border border-gray-700',
    dark: 'bg-gray-900 border border-gray-800',
    luxury: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gold-500/20',
  };

  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: '',
  };

  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;