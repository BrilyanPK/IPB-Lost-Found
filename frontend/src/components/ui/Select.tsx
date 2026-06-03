import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  name?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
  error?: string;
  searchable?: boolean;
}

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onChange, 
  options, 
  name,
  disabled = false, 
  className = '',
  placeholder = 'Pilih opsi...',
  required = false,
  label,
  error,
  searchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    // Simulate event to maintain compatibility with existing handlers
    onChange({
      target: { name, value: optionValue }
    } as unknown as React.ChangeEvent<HTMLSelectElement>);
    setIsOpen(false);
    setSearchQuery('');
  };

  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <div className={`flex flex-col gap-1.5 mb-6 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative w-full" ref={containerRef}>
        {/* Hidden native select for form validation/accessibility if needed */}
        <select 
          name={name}
          value={value} 
        onChange={onChange} 
        className="hidden" 
        required={required}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Custom Trigger */}
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 rounded-xl border transition-all bg-white flex items-center justify-between cursor-pointer font-normal text-sm
          ${disabled 
            ? 'opacity-60 bg-gray-50 cursor-not-allowed border-gray-300' 
            : error 
              ? 'border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-500' 
              : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-gray-400'
          }
          ${isOpen 
            ? (error ? 'ring-2 ring-red-200 border-red-500' : 'ring-2 ring-primary/30 border-primary') 
            : ''
          }
        `}
        style={{ fontFamily: "'Roboto', sans-serif" }}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <FiChevronDown 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </div>

      {/* Custom Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 z-50 animate-in fade-in zoom-in-95 origin-top max-h-60 overflow-y-auto custom-scrollbar" style={{ fontFamily: "'Roboto', sans-serif" }}>
          {searchable && (
            <div className="p-2 sticky top-0 bg-white z-10 border-b border-gray-100 mb-1">
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">Tidak ditemukan</div>
          ) : (
            filteredOptions.map((opt, index) => (
              <React.Fragment key={opt.value}>
              <div 
                onClick={() => handleSelect(opt.value)}
                className={`px-4 py-2.5 text-sm font-normal rounded-lg cursor-pointer transition-colors flex items-center justify-between
                  ${value === opt.value ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                {opt.label}
              </div>
              {/* Optional divider between items, except last one */}
              {index < filteredOptions.length - 1 && (
                <div className="h-px bg-gray-50 my-0.5 mx-2"></div>
              )}
            </React.Fragment>
          ))
          )}
        </div>
      )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
