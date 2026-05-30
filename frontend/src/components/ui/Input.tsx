import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', required, ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 mb-6 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
            {icon}
          </span>
        )}
        <input
          style={{ fontFamily: "'Roboto', sans-serif" }}
          className={`w-full ${icon ? 'pl-11 pr-4' : 'px-4'} py-2.5 rounded-xl border ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/30'} focus:border-primary focus:outline-none focus:ring-2 transition-all font-normal text-sm`}
          required={required}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
