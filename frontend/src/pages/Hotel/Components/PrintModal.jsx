import { useState } from 'react';
import { Printer } from 'lucide-react';

export default function PrintModal({onSubmit}) {
  const [isOpen, setIsOpen] = useState(true);


  const handleCancel = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-8 animate-in slide-in-from-bottom-4 duration-400">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-black rounded-xl p-4 text-white">
            <Printer size={32} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-3">
          Do you need to print?
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center text-sm mb-8 leading-relaxed">
          Would you like to print this checkout now, or continue working?
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSubmit()}
            className="w-full bg-gradient-to-r from-blue-400 to-black hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            Print Checkout
          </button>
          <button
            onClick={handleCancel}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}