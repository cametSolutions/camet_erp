import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import api from "@/api/api";
import Logo from '../../../assets/images/hill.png';

const HotelBillPrint = () => {
  // Router and Redux state
  const location = useLocation();
  const navigate = useNavigate();
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );

  // Props from location state
  const selectedCheckOut = location.state?.selectedCheckOut;
  const selectedCustomerId = location.state?.customerId;
  const isForPreview = location.state?.isForPreview;

  // Component state
  const [outStanding, setOutStanding] = useState([]);
  const [kotData, setKotData] = useState([]);
  const [selectedCustomerData, setSelectedCustomerData] = useState({});
  const [selectedCheckOutData, setSelectedCheckOutData] = useState({});
  const [dateWiseDisplayedData, setDateWiseDisplayedData] = useState([]);
  const [taxAmountForRoom, setTaxAmountForRoom] = useState(0);
  const [taxAmountForFood, setTaxAmountForFood] = useState(0);
  const [foodPlanAmount, setFoodPlanAmount] = useState(0);
  const [additionalPaxAmount, setAdditionalPaxAmount] = useState(0);
  const printReference = useRef(null);

  // Utility function to transform checkout data
  const transformCheckOutData = (selectedCheckOut) => {
    let result = [];

    selectedCheckOut.forEach((item) => {
      item.selectedRooms.forEach((room) => {
        const stayDays = room.stayDays || 1;
        const perDayAmount = room.baseAmountWithTax / stayDays;
        const baseAmount = room.baseAmount / stayDays;
        const taxAmount = room.taxAmount / stayDays;
        const foodPlanAmountWithTax = room.foodPlanAmountWithTax / stayDays;
        const foodPlanAmountWithOutTax = room.foodPlanAmountWithOutTax / stayDays;
        const additionalPaxDataWithTax = room.additionalPaxAmountWithTax / stayDays;
        const additionalPaxDataWithOutTax = room.additionalPaxAmountWithOutTax / stayDays;

        const startDate = new Date(item.arrivalDate);
        const endDate = new Date(item.checkOutDate);

        for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
          const formattedDate = d.toLocaleDateString("en-GB").replace(/\//g, "-");

          result.push({
            date: formattedDate,
            description: `Room Rent - Room ${room.roomName}`,
            docNo: item.voucherNumber,
            amount: baseAmount,
            baseAmountWithTax: perDayAmount,
            baseAmount: baseAmount,
            taxAmount,
            voucherNumber: item.voucherNumber,
            roomName: room.roomName,
            hsn: room?.hsnDetails?.hsn,
            customerName: item.customerId?.partyName,
            foodPlanAmountWithTax,
            foodPlanAmountWithOutTax,
            additionalPaxDataWithTax,
            additionalPaxDataWithOutTax,
          });
        }
      });
    });

    return result;
  };

  // API call to fetch debit data
  const fetchDebitData = async (data) => {
    try {
      const res = await api.post(
        `/api/sUsers/fetchOutStandingAndFoodData`,
        { data: data },
        { withCredentials: true }
      );

      if (res.data.success) {
        setOutStanding(res.data.data);
        setKotData(res.data.kotData);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error fetching debit data:", error);
    }
  };

  // Utility function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate totals - FIXED VERSION
  const calculateTotals = () => {
    const roomTariffTotal = dateWiseDisplayedData.reduce(
      (total, order) => total + (order.baseAmount || 0),
      0
    );

    const planAmount = dateWiseDisplayedData.reduce(
      (total, order) => total + (order?.foodPlanAmountWithOutTax || 0),
      0
    );

    const additionalPaxAmount = dateWiseDisplayedData.reduce(
      (total, order) => total + (order?.additionalPaxDataWithOutTax || 0),
      0
    );

    const advanceTotal = outStanding?.reduce(
      (total, transaction) => total + (transaction?.bill_amount || 0),
      0
    ) || 0;

    const kotTotal = kotData?.reduce((total, kot) => total + (kot?.total || 0), 0) || 0;

    const sgstAmount = taxAmountForRoom;
    const cgstAmount = taxAmountForRoom;
    const totalTaxAmount = sgstAmount + cgstAmount;

    const grandTotal = roomTariffTotal + planAmount + additionalPaxAmount + totalTaxAmount + kotTotal;
    const netPay = grandTotal - advanceTotal;

    return {
      roomTariffTotal,
      advanceTotal,
      kotTotal,
      sgstAmount,
      cgstAmount,
      totalTaxAmount,
      grandTotal,
      netPay,
      planAmount,
      additionalPaxAmount
    };
  };

  // Add keyboard shortcut for printing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Print handler
  const handlePrint = useReactToPrint({
    content: () => printReference.current,
    documentTitle: "Hotel Bill",
    removeAfterPrint: true,
  });

  // Main effect to process checkout data - FIXED VERSION
  useEffect(() => {
    if (selectedCustomerId && selectedCheckOut?.length > 0) {
      const findCustomerFullData = selectedCheckOut.find(
        (item) => item.customerId?._id === selectedCustomerId
      );

      if (findCustomerFullData) {
        setSelectedCustomerData(findCustomerFullData.customerId);
        setSelectedCheckOutData(findCustomerFullData);

        const selectedCheckOutData = transformCheckOutData(selectedCheckOut);
        setDateWiseDisplayedData(selectedCheckOutData);

        const taxAmountBasedOnRoom = selectedCheckOutData.reduce(
          (acc, item) => acc + Number(item.taxAmount || 0),
          0
        );
        setTaxAmountForRoom(taxAmountBasedOnRoom);

        const foodPlanAmountWithOutTax = selectedCheckOutData.reduce(
          (acc, item) => acc + Number(item.foodPlanAmountWithOutTax || 0),
          0
        );
        const paxAmount = selectedCheckOutData.reduce(
          (acc, item) => acc + Number(item.additionalPaxDataWithTax || 0),
          0
        );
        setFoodPlanAmount(foodPlanAmountWithOutTax);
        setAdditionalPaxAmount(paxAmount);

        const foodPlanTaxAmount = selectedCheckOutData.reduce(
          (acc, item) =>
            acc + Number(item.foodPlanAmountWithOutTax || 0) - Number(item.taxAmountForFoodPlan || 0),
          0
        );

        setTaxAmountForFood(foodPlanTaxAmount - foodPlanAmountWithOutTax);
      }
    }
  }, [selectedCustomerId, selectedCheckOut]);

  // Effect to fetch debit data
  useEffect(() => {
    if (selectedCheckOut?.length > 0) {
      fetchDebitData(selectedCheckOut);
    }
  }, [selectedCheckOut]);

  const totals = calculateTotals();
  
console.log(location.state)
console.log(outStanding)
console.log(selectedCheckOutData)
console.log(dateWiseDisplayedData)
  // Dynamic bill data based on fetched information - FIXED VERSION
  const billData = {
    hotel: {
      name: organization?.name ,
      address: `${organization?.flat || ''} ${organization?.road || ''} ${organization?.landmark || ''}`.trim() || 'Erattayar road, Kattapana, Kerala India',
      phone: organization?.mobile ,
      email: organization?.email,
      website: organization?.website,
      pan: organization?.pan ,
      gstin: organization?.gstNum ,
      sacCode: '996311'
    },
    guest: {
      name: selectedCustomerData?.partyName ,
      roomNo: selectedCheckOutData?.selectedRooms?.map(room => room.roomName).join(', ') ,
      billNo: selectedCheckOutData?.voucherNumber,
      travelAgent: selectedCheckOutData?.agentId?.name,
      address: selectedCustomerData?.address || '',
      phone: selectedCustomerData?.mobileNumber || '',
      gstNo: selectedCustomerData?.gstNo || ''
    },
    stay: {
      billDate: formatDate(new Date()),
      arrival: `${formatDate(selectedCheckOutData?.arrivalDate)} ${selectedCheckOutData?.arrivalTime || ''}`,
      departure: `${formatDate(new Date())} ${new Date().toLocaleTimeString()}`,
      days: selectedCheckOutData?.selectedRooms?.[0]?.stayDays,
      plan: selectedCheckOutData?.foodPlanAmount ,
      pax: selectedCheckOutData?.selectedRooms?.reduce((acc, curr) => acc + Number(curr.pax || 0), 0) || 1,
      tariff: selectedCheckOutData?.selectedRooms?.[0]?.baseAmount || 0
    },
    
    charges: [
      // Room charges from dateWiseDisplayedData
      ...dateWiseDisplayedData.map(item => ({
        date: item.date,
        description: item.description,
        docNo: item.docNo || '-',
        amount: item.baseAmount || 0,
        taxes:selectedCheckOutData?.selectedRooms?.map(room => room.taxAmount).join(', ') ,
        Advance:selectedCheckOutData?.advanceAmount ,
        balance:selectedCheckOutData?.balanceToPay ,
      })),
      // Advance entries from outStanding
      ...outStanding.map(transaction => ({
        date: formatDate(transaction.bill_date),
        description: 'Advance',
        docNo: transaction.bill_no,
        amount: -Math.abs(transaction.bill_amount || 0) ,// Negative for advance
        taxes:transaction.tax,
        Advance:transaction.advanceAmount,
        balance:transaction.balance
      })),
      // Tax charges
      ...(totals.cgstAmount > 0 ? [{
        date: formatDate(new Date()),
        description: 'CGST on Rent',
        docNo: '-',
        amount: totals.cgstAmount,

      }] : []),
      ...(totals.sgstAmount > 0 ? [{
        date: formatDate(new Date()),
        description: 'SGST on Rent @6%',
        docNo: '-',
        amount: totals.sgstAmount
      }] : []),
      // Restaurant charges from kotData
      ...kotData.map(kot => ({
        date: formatDate(kot.createdAt),
        description: kot.description,
        docNo: kot.voucherNumber,
        amount: kot.total || 0
      })),
      // Food plan charges if any
      ...(totals.planAmount > 0 ? [{
        date: formatDate(new Date()),
        description: 'Food Plan',
        docNo: '-',
        amount: totals.planAmount
      }] : []),
      // Additional pax charges if any
      ...(totals.additionalPaxAmount > 0 ? [{
        date: formatDate(new Date()),
        description: 'Additional Pax',
        docNo: '-',
        amount: totals.additionalPaxAmount
      }] : [])
    ],
    summary: {
      roomRent: totals.roomTariffTotal,
      sgst: totals.sgstAmount,
      cgst: totals.cgstAmount,
      restaurant: totals.kotTotal,
      roomService: 0,
      foodPlan: totals.planAmount,
      additionalPax: totals.additionalPaxAmount,
      total: totals.grandTotal,
      totalWords: convertNumberToWords(totals.grandTotal)
    },
    payment: {
      mode: 'Credit',
      total: totals.grandTotal,
      advance: totals.advanceTotal,
      netPay: totals.netPay
    }
  };

  // Function to convert number to words (simplified version)
  function convertNumberToWords(amount) {
    // This is a simplified version - you might want to use a proper number-to-words library
    return `${Math.round(amount)} Rupees Only`;
  }
console.log(billData)
  return (
    <div className="font-sans bg-gray-100 p-5 min-h-screen" ref={printReference}>
      <style jsx>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
          }
          
          .print-header {
            display: none !important;
          }
          
          .print-container {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: none !important;
          }
          
          .bill-content {
            padding: 20px !important;
          }
          
          .charges-table {
            box-shadow: none !important;
          }
          
          .info-section, .summary-section, .payment-section {
            background: white !important;
            border: 1px solid #ddd !important;
          }
          
          .bg-gradient-to-br {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
      
      <div className="print-header text-white text-right">
        <button 
          onClick={handlePrint}
          className="bg-green-500 hover:bg-green-600 text-white border-none py-3 px-6 text-base rounded cursor-pointer mb-2 transition-colors duration-300"
        >
          🖨️ Print Bill
        </button>
      </div>

      <div className="print-container mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Bill Content */}
        <div className="bill-content">
          <div className="flex justify-between border-b-4 pb-5 mb-6">
            {/* Logo */}
            <div>
              <img src={Logo} alt="Logo" className="w-30 h-35" />
            </div>

            {/* Hotel Header */}
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {billData.hotel.name}
              </div>
              <div className="text-gray-600 text-sm leading-relaxed mb-3">
                {billData.hotel.address}<br/>
                Phone: {billData.hotel.phone}<br/>
                Email: {billData.hotel.email} | Website: {billData.hotel.website}
              </div>
              <div className="text-gray-500 text-xs leading-tight">
                PAN NO: {billData.hotel.pan} | GSTIN: {billData.hotel.gstin} | SAC CODE: {billData.hotel.sacCode}
              </div>
            </div>
          </div>

          {/* Bill Information Grid */}
          <div className="grid grid-cols-1 border border-black md:grid-cols-2 gap-8 mb-8">
            {/* Guest Information */}
            <div className="info-section bg-gray-50 p-4 rounded-lg border-l-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">GRC No:</span>
                  <span className="text-gray-800 font-semibold">{billData.guest.billNo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Guest Name:</span>
                  <span className="text-gray-800 font-semibold">{billData.guest.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Address:</span>
                  <span className="text-gray-800 font-semibold">{billData.guest.address}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Phone:</span>
                  <span className="text-gray-800 font-semibold">{billData.guest.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Gst No:</span>
                  <span className="text-gray-800 font-semibold">{billData.guest.gstNo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Travel Agent:</span>
                  <span className="text-gray-800 font-semibold">{billData.guest.travelAgent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Room No:</span>
                  <span className="text-gray-800 font-semibold">{billData.guest.roomNo}</span>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="info-section bg-gray-50 p-4 rounded-lg border-l-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Bill Date:</span>
                  <span className="text-gray-800 font-semibold">{billData.stay.billDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Bill No:</span>
                  <span className="text-gray-800 font-semibold">{billData.guest.billNo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Arrival:</span>
                  <span className="text-gray-800 font-semibold">{billData.stay.arrival}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Departure:</span>
                  <span className="text-gray-800 font-semibold">{billData.stay.departure}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">No. of Days:</span>
                  <span className="text-gray-800 font-semibold">{billData.stay.days}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Pax:</span>
                  <span className="text-gray-800 font-semibold">{billData.stay.pax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Tariff:</span>
                  <span className="text-gray-800 font-semibold">{billData.stay.tariff?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Plan:</span>
                  <span className="text-gray-800 font-semibold">{billData.stay.plan}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charges Table */}
          <div className="charges-table overflow-hidden rounded-lg border border-black shadow-sm mb-6">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gradient-to-r bg-red-50 text-black">
                  <th className="p-4 text-left font-semibold text-sm">Date</th>
                  <th className="p-4 text-left font-semibold text-sm">Description</th>
                  <th className="p-4 text-left font-semibold text-sm">Doc No</th>
                  <th className="p-4 text-right font-semibold text-sm">Amount (₹)</th>
                   <th className="p-4 text-right font-semibold text-sm">Taxes (₹)</th>
                    <th className="p-4 text-right font-semibold text-sm">Balance (₹)</th>
                     <th className="p-4 text-right font-semibold text-sm">Advance (₹)</th>
                </tr>
              </thead>
              <tbody>
                {billData.charges.map((charge, index) => (
                  <tr 
                    key={index} 
                    className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="p-3 text-sm border-b border-gray-200">{charge.date}</td>
                    <td className="p-3 text-sm border-b border-gray-200">{charge.description}</td>
                    <td className="p-3 text-sm border-b border-gray-200">{charge.docNo}</td>
                    <td className="p-3 text-sm border-b border-gray-200 text-right font-semibold">
                      {charge.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                     <td className="p-3 text-sm border-b border-gray-200">{charge.taxes}</td> 
                     <td className="p-3 text-sm border-b border-gray-200">{charge.balance}</td>
                      <td className="p-3 text-sm border-b border-gray-200">{charge.Advance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="summary-section bg-white p-5 rounded-lg border border-black">
            <div className="flex justify-between items-start mb-4">
              <div className="text-lg font-bold text-gray-800">Summary</div>
              <div className="text-lg font-bold text-gray-800">Amount</div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Room Rent</span>
                <span className="text-gray-700">{billData.summary.roomRent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {billData.summary.foodPlan > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-700">Food Plan</span>
                  <span className="text-gray-700">{billData.summary.foodPlan.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {billData.summary.additionalPax > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-700">Additional Pax</span>
                  <span className="text-gray-700">{billData.summary.additionalPax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-gray-700">SGST on Rent</span>
                <span className="text-gray-700">{billData.summary.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">CGST on Rent</span>
                <span className="text-gray-700">{billData.summary.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Ac Restaurant</span>
                <span className="text-gray-700">{billData.summary.restaurant.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Room Service</span>
                <span className="text-gray-700">{billData.summary.roomService.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              
              {/* Total Row */}
              <div className="flex justify-between py-1 pt-2 border-t border-gray-300">
                <span className="text-gray-800 font-bold">Total</span>
                <span className="text-gray-800 font-bold">{billData.summary.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="payment-section border border-black mt-6">
            <div className="bg-white p-2 border-b font-bold text-gray-800">
              Payment Details
            </div>
            
            <div className="bg-white">
              <div className="flex border-b border-gray-800">
                <div className="w-32 p-2 font-semibold text-sm">PAYMODE</div>
                <div className="w-24 p-2 font-semibold text-sm text-center">AMOUNT</div>
                <div className="flex-1 p-2 text-sm"></div>
                <div className="w-32 p-2 text-right">
                  <div className="font-semibold text-sm">Total :</div>
                  <div className="font-semibold text-sm">Less Advance:</div>
                </div>
                <div className="w-24 p-2 text-right">
                  <div className="font-semibold text-sm">{billData.payment.total.toFixed(2)}</div>
                  <div className="font-semibold text-sm">{billData.payment.advance.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="flex">
                <div className="w-32 p-2 text-sm">{billData.payment.mode}</div>
                <div className="w-24 p-2 text-sm text-right">{billData.payment.netPay.toLocaleString('en-IN')}</div>
                <div className="flex-1 p-2 text-sm font-semibold">{billData.guest.name}</div>
                <div className="w-32 p-2"></div>
                <div className="w-24 p-2"></div>
              </div>
              
              <div className="flex">
                <div className="flex-1 p-2"></div>
                <div className="w-32 p-2 text-right">
                  <div className="font-bold text-sm">Net Pay :</div>
                </div>
                <div className="w-24 p-2 text-right">
                  <div className="font-bold text-sm">{billData.payment.netPay.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="border-t border-gray-800 p-2">
                <div className="text-sm font-medium">{billData.summary.totalWords}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="footer-section border border-gray-800 mt-6">
            <div className="flex border-b border-gray-800">
              <div className="w-1/2 p-3 border-r border-gray-800">
                <div className="font-bold text-sm mb-2">Please Deposit Your Room and Locker Keys</div>
              </div>
              <div className="w-1/2 p-3">
                <div className="text-sm">
                  Regardless of charge instructions, I agree to be held personally liable for the payment of total amount of bill. Please collect receipt if you have paid cash.
                </div>
              </div>
            </div>
            
            <div className="flex">
              <div className="w-1/3 p-3 border-r border-gray-800">
                <div className="text-sm mb-1 font-semibold">Prepared By</div>
                <div className="text-sm">FO</div>
              </div>
              <div className="w-1/3 p-3 border-r border-gray-800">
                <div className="text-sm mb-1 font-semibold">Manager</div>
              </div>
              <div className="w-1/3 p-3">
                <div className="text-sm mb-1 font-semibold">Guest Signature & Date</div>
              </div>
            </div>
            
            <div className="flex border-t border-gray-800">
              <div className="flex-1 p-3 border-r border-gray-800">
                <div className="text-sm italic">We hope you enjoyed your stay and would like to welcome you back...</div>
              </div>
              <div className="p-3">
                <div className="text-sm">Original Bill - Page 1</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelBillPrint;