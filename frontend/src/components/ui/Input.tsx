import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1 mb-4 ${className}`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        style={{ fontFamily: "'Roboto', sans-serif" }}
        className={`px-4 py-2 rounded-lg border ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/30'} focus:border-primary focus:outline-none focus:ring-2 transition-all`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
