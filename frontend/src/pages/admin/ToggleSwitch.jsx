/* eslint-disable react/prop-types */
import { Loader2 } from 'lucide-react';

const ToggleSwitch = ({ 
  enabled, 
  onToggle, 
  label, 
  loading = false, 
  variant = 'default',
  size = 'default' 
}) => {
  const getVariantStyles = () => {
    const variants = {
      default: {
        enabled: 'bg-gradient-to-r from-blue-500 to-blue-600 focus:ring-blue-500',
        disabled: 'bg-slate-300 focus:ring-slate-400'
      },
      success: {
        enabled: 'bg-gradient-to-r from-green-500 to-green-600 focus:ring-green-500',
        disabled: 'bg-slate-300 focus:ring-slate-400'
      },
      danger: {
        enabled: 'bg-gradient-to-r from-red-500 to-red-600 focus:ring-red-500',
        disabled: 'bg-slate-300 focus:ring-slate-400'
      },
      warning: {
        enabled: 'bg-gradient-to-r from-yellow-500 to-yellow-600 focus:ring-yellow-500',
        disabled: 'bg-slate-300 focus:ring-slate-400'
      }
    };
    
    return enabled ? variants[variant].enabled : variants[variant].disabled;
  };

  const getSizeStyles = () => {
    const sizes = {
      small: {
        switch: 'w-10 h-5',
        toggle: 'w-4 h-4',
        translate: 'translate-x-5'
      },
      default: {
        switch: 'w-12 h-6',
        toggle: 'w-5 h-5',
        translate: 'translate-x-6'
      },
      large: {
        switch: 'w-14 h-7',
        toggle: 'w-6 h-6',
        translate: 'translate-x-7'
      }
    };
    
    return sizes[size];
  };

  const sizeStyles = getSizeStyles();

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <button
          onClick={onToggle}
          disabled={loading}
          className={`
            relative inline-flex ${sizeStyles.switch} rounded-full p-1 
            transition-all duration-300 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${getVariantStyles()}
            ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
          `}
        >
          <span className="sr-only">{label}</span>
          <div
            className={`
              inline-block ${sizeStyles.toggle} rounded-full bg-white shadow-lg
              transform transition-all duration-300 ease-in-out
              flex items-center justify-center
              ${enabled ? sizeStyles.translate : 'translate-x-0'}
            `}
          >
            {loading && (
              <Loader2 className="w-3 h-3 animate-spin text-slate-600" />
            )}
          </div>
        </button>
      </div>
      
      {/* Status indicator */}
      {/* <div className="flex items-center justify-end">
        <span className={`text-xs font-medium px-2 py-1 rounded-full transition-colors duration-200 ${
          enabled 
            ? variant === 'danger' 
              ? 'text-red-700 bg-red-100' 
              : variant === 'success'
              ? 'text-green-700 bg-green-100'
              : 'text-blue-700 bg-blue-100'
            : 'text-slate-600 bg-slate-100'
        }`}>
          {loading ? 'Updating...' : enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div> */}
    </div>
  );
};

export default ToggleSwitch;