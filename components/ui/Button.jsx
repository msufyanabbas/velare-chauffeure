import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  size = 'md',
  variant = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-4 text-xl'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-gray-900 font-semibold',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        rounded-lg font-medium transition-all duration-200 
        transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;