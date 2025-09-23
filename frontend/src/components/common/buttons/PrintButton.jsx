import React from 'react';
import { toast } from 'sonner';
import api from '../../../api/api';

const PrintButton = ({ salesId }) => {
  const handlePrint = async () => {
    try {
      // Fetch invoice details
      const response = await api.get(`/api/sUsers/print-data/${salesId}`, {
        withCredentials: true,
      });

      // Construct response URL (ensure it is properly encoded if necessary)
      const responseUrl = `https://www.erp.camet.in/api/sUsers/print-data/${salesId}`;
      const bluetoothPrintUrl = `my.bluetoothprint.scheme://${responseUrl}`;

      // Open the link to trigger the Bluetooth Print app
      window.location.href = bluetoothPrintUrl;
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'An error occurred while trying to print.');
    }
  };

  return (
    <button onClick={handlePrint}>
      Print Invoice
    </button>
  );
};

export default PrintButton;
