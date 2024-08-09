import React from 'react';

const PrintButton = ({ salesId }) => {
  const handlePrint = () => {
    // The URL should point to your Node.js server endpoint
    const printUrl = `my.bluetoothprint.scheme://http:///localhost:7000/api/print/${salesId}`;
    window.location.href = printUrl;
  };

  return (
    <button onClick={handlePrint}>
      Print Invoice
    </button>
  );
};

export default PrintButton;