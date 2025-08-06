import React, { useState, useEffect } from 'react';

const KOTPrintFormat = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatPrintTime = (date) => {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sample data - you can replace this with props or state
  const kotData = {
    companyName: "ABC RESTAURANT",
    kotNumber: "KOT-001",
    tableNumber: "Table 5",
    items: [
      { sl: 1, name: "Chicken Biryani", qty: 2 },
      { sl: 2, name: "Mutton Curry", qty: 1 },
      { sl: 3, name: "Naan Bread", qty: 3 },
      { sl: 4, name: "Mango Lassi", qty: 2 }
    ]
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-5">
      <div className="w-72 bg-white p-4 font-mono text-xs leading-tight border-2 border-dashed border-gray-800 shadow-lg">
        
        {/* Header */}
        <div className="text-center border-b border-dashed border-black pb-3 mb-3">
          <div className="text-lg font-bold mb-1 tracking-wide">
            {kotData.companyName}
          </div>
          <div className="text-sm font-bold my-2 tracking-wide">
            KITCHEN ORDER TICKET
          </div>
        </div>
        
        {/* KOT Info */}
        <div className="mb-3 leading-relaxed flex flex-wrap justify-between">
          <div className="flex items-center">
            <span className="font-bold mr-2">KOT No:</span>
            <span>{kotData.kotNumber}</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold mr-2">Date:</span>
            <span>{formatDate(currentDateTime)}</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold mr-2">Time:</span>
            <span>{formatTime(currentDateTime)}</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold mr-2">Table:</span>
            <span>{kotData.tableNumber}</span>
          </div>
        </div>
        
        {/* Items Table */}
        <table className="w-full border-collapse my-3">
          <thead>
            <tr>
              <th className="text-center w-1/6 py-1 px-1 border-b border-black font-bold text-xs">
                SL
              </th>
              <th className="text-left w-3/5 py-1 px-1 border-b border-black font-bold text-xs">
                ITEM
              </th>
              <th className="text-right w-1/4 py-1 px-1 border-b border-black font-bold text-xs">
                QTY
              </th>
            </tr>
          </thead>
          <tbody>
            {kotData.items.map((item) => (
              <tr key={item.sl}>
                <td className="text-center py-1 px-1 border-b border-dotted border-gray-300 text-xs">
                  {item.sl}
                </td>
                <td className="text-left py-1 px-1 border-b border-dotted border-gray-300 text-xs">
                  {item.name}
                </td>
                <td className="text-right py-1 px-1 border-b border-dotted border-gray-300 text-xs">
                  {item.qty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Footer */}
        <div className="text-center mt-4 pt-2 border-t border-dashed border-black text-xs">
          <div className="font-bold mb-1">** KITCHEN COPY **</div>
          <div className="mb-2">Prepare items as per order</div>
          <div className="text-xs text-gray-600">
            Printed: {formatPrintTime(currentDateTime)}
          </div>
        </div>
      </div>

      {/* Print Button */}
      <button
        onClick={() => window.print()}
        className="fixed bottom-5 right-5 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors print:hidden"
      >
        Print KOT
      </button>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default KOTPrintFormat;