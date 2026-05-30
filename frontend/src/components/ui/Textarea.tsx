import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', required, ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 mb-6 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        style={{ fontFamily: "'Roboto', sans-serif" }}
        className={`px-4 py-2 rounded-lg border min-h-[120px] resize-y ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/30'} focus:border-primary focus:outline-none focus:ring-2 transition-all`}
        required={required}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
