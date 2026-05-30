import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-2.5 rounded-xl font-medium transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md",
    outline: "border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
