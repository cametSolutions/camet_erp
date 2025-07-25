import React from "react";
import { Loader2 } from "lucide-react";

const ToggleSwitch = ({ enabled, onToggle, label, size = "sm", loading = false }) => {
  const sizeClasses = {
    sm: "w-10 h-5",
    md: "w-12 h-6"
  };
  
  const thumbClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5"
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">{label}</span>
      <button
        onClick={onToggle}
        disabled={loading}
        className={`${sizeClasses[size]} rounded-full p-1 transition-colors duration-200 ease-in-out relative ${
          enabled ? 'bg-blue-500' : 'bg-gray-300'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div
          className={`${thumbClasses[size]} rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-3 h-3 animate-spin text-gray-600" />
          </div>
        )}
      </button>
    </div>
  );
};

export default ToggleSwitch;