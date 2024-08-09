import React from 'react';
import { toast } from 'react-toastify';
import api from '../../../api/api';

const PrintButton = ({ salesId }) => {
//   const handlePrint = () => {
//     // The URL should point to your Node.js server endpoint
//     const printUrl = `my.bluetoothprint.scheme://http:///localhost:7000/api/print/${salesId}`;
//     window.location.href = printUrl;
//   };


  const handlePrint = async () => {
    try {
      // Fetch invoice details
    //   const res = await api.get(`/api/sUsers/print-data/${salesId}`, {
    //     withCredentials: true,
    //   });
const responceUrl="http://www.erp.camet.in/api/sUsers/print-data/salesId"
      const bluetoothPrintUrl = `my.bluetoothprint.scheme://${responceUrl}`;

        // Open the link to trigger the Bluetooth Print app
    window.location.href = bluetoothPrintUrl;

      

      
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <button onClick={handlePrint}>
      Print Invoice
    </button>
  );
};

export default PrintButton;