import React, { forwardRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface DatePickerProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  [key: string]: any;
}

const CustomInput = forwardRef<HTMLInputElement, any>(
  ({ value, onClick, onChange, placeholder, required, error, onBlur }, ref) => (
    <div className="relative w-full">
      <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 pointer-events-none">
        <FiCalendar />
      </span>
      <input
        value={value}
        onClick={onClick}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        placeholder={placeholder}
        required={required}
        style={{ fontFamily: "'Roboto', sans-serif" }}
        className={`w-full pl-11 pr-4 py-2.5 rounded-xl border ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-primary/30 hover:border-gray-400'} focus:border-primary focus:outline-none focus:ring-2 transition-all font-normal text-sm bg-white cursor-pointer`}
      />
    </div>
  )
);

export const DatePicker: React.FC<DatePickerProps> = ({ 
  label, 
  error, 
  required,
  className = '', 
  ...props 
}) => {
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');

  const handleDateChange = (date: any, event: any) => {
    if (props.onChange) props.onChange(date, event);
    
    // Automatically transition to the next granular view
    if (view === 'years') setView('months');
    else if (view === 'months') setView('days');
  };

  const toggleView = () => {
    if (view === 'days') setView('months');
    else if (view === 'months') setView('years');
    else setView('days');
  };

  return (
    <div className={`flex flex-col gap-1.5 mb-6 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 block">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="w-full">
        <ReactDatePicker
          customInput={<CustomInput error={error} required={required} />}
          wrapperClassName="w-full"
          dateFormat="dd/MM/yyyy HH:mm"
          showYearPicker={view === 'years'}
          showMonthYearPicker={view === 'months'}
          shouldCloseOnSelect={view === 'days'}
          onCalendarClose={() => {
            setView('days');
            if (props.onCalendarClose) props.onCalendarClose();
          }}
          renderCustomHeader={({
            date,
            decreaseMonth,
            increaseMonth,
            decreaseYear,
            increaseYear,
          }) => (
            <div className="flex justify-between items-center px-2 py-1">
              <button
                type="button"
                onClick={view === 'years' || view === 'months' ? decreaseYear : decreaseMonth}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors text-gray-500 cursor-pointer"
              >
                <FiChevronLeft size={20} />
              </button>
              
              <button
                type="button"
                onClick={toggleView}
                className="font-bold text-[#0A2656] text-[0.95rem] hover:bg-gray-100 px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {view === 'years' 
                  ? format(date, 'yyyy', { locale: id }) 
                  : format(date, 'MMMM yyyy', { locale: id })}
              </button>

              <button
                type="button"
                onClick={view === 'years' || view === 'months' ? increaseYear : increaseMonth}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors text-gray-500 cursor-pointer"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          )}
          {...(props as any)}
          onChange={handleDateChange}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
