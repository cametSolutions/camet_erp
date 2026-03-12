import { useState } from 'react';
import { Printer } from 'lucide-react';

export default function PrintModal({ onSubmit }) {
  const [isOpen, setIsOpen] = useState(true);

  const handleCancel = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md shadow-xl max-w-sm w-full p-6 border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-md bg-blue-600 text-white">
              <Printer size={22} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Do you need to print?
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-6">
          Would you like to print this checkout now, or continue working?
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Print Now
          </button>
        </div>
      </div>
    </div>
  );
}
