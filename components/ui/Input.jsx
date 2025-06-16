import React from 'react';

const Input = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  icon: Icon, 
  error, 
  required, 
  type = 'text',
  className = '' 
}) => (
  <div className={`space-y-2 ${className}`}>
    <label className="block text-sm font-medium text-gray-200">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-200 ${error ? 'border-red-400' : ''}`}
      />
    </div>
    {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
  </div>
);

export default Input;