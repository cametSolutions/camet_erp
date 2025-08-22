import React from 'react';
import Logo from '../../../assets/images/sattva.jpg' 
export default function SattvaInvoice() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="no-print mb-4">
        <button 
          onClick={handlePrint}
          className="bg-blue-500 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium"
        >
          🖨️ Print Invoice
        </button>
      </div>
      
      <div className="max-w-4xl mx-auto bg-white border-2 border-black p-2 text-sm print-container">
        {/* Print Header - Will appear on every page */}
        <div className="print-header">
          <div className="flex items-center justify-between border-black pb-4">
            {/* Logo on left */}
            <div className="w-24 h-24 flex-shrink-0">
              <div className="bg-gray-200 h-full w-full flex items-center justify-center text-xs">
                <img src={Logo} alt="Sattva Logo"  />
              </div>
            </div>
            {/* Header text on right */}
            <div className="text-right flex-1 ml-4">
              <div className="text-xl font-bold mb-2">SATTVA, THE AWAKENING GARDEN</div>
              <div className="mb-2">Kakkadampoyyil, Kozhikode, Kerala</div>
              <div className="text-xs mb-1">GSTIN: 32AEHPM4090F2ZO</div>
              <div className="text-xs mb-1">State Name: Kerala, Code: 32</div>
              <div className="text-xs">E-Mail: info@sattvameditationresort.com</div>
            </div>
          </div>
        </div>

        {/* Print Content Area */}
        <div className="print-content">
          {/* Invoice Details */}
          <div className="grid grid-cols-4 p-2 text-xs border border-black">
            <div className="space-y-1">
              <div className="flex"><span className="w-20 font-bold">GRC No:</span><span>15211</span></div>
              <div className="flex"><span className="w-20 font-bold">Pax:</span><span>8</span></div>
              <div className="flex"><span className="w-20 font-bold">Guest:</span><span>Nasif P T</span></div>
              <div className="flex"><span className="w-20 font-bold">Agent:</span><span>Walk-In Customer</span></div>
            </div>
            <div className="space-y-1">
              <div className="flex"><span className="w-24 font-bold">Room No:</span><span>107</span></div>
              <div className="flex"><span className="w-24 font-bold">Room Type:</span><span>DELUX AC</span></div>
            </div>
            <div className="space-y-1">
              <div className="flex"><span className="w-20 font-bold">Bill No:</span><span>C-OT\352</span></div>
              <div className="flex"><span className="w-20 font-bold">Arrival:</span><span>30-Jun-23 / 16.00</span></div>
              <div className="flex"><span className="w-20 font-bold">Plan:</span><span>CP</span></div>
            </div>
            <div className="space-y-1">
              <div className="flex"><span className="w-20 font-bold">Bill Date:</span><span>1-Jul-23</span></div>
              <div className="flex"><span className="w-20 font-bold">Departure:</span><span>1-Jul-23 / 18:59:47</span></div>
              <div className="flex"><span className="w-20 font-bold">Tariff:</span><span>₹ 19,525.00</span></div>
            </div>
          </div>

          {/* Single Unified Table */}
          <div className="mb-3">
            <table className="w-full border border-black">
              <thead>
                <tr className="bg-gray-100 text-xs">
                  <th className="border border-black p-2 text-center font-bold">DATE</th>
                  <th className="border border-black p-2 text-center font-bold">VOUCHER</th>
                  <th className="border border-black p-2 text-center font-bold">DESCRIPTION</th>
                  <th className="border border-black p-2 text-center font-bold">HSN</th>
                  <th className="border border-black p-2 text-center font-bold">DEBIT</th>
                  <th className="border border-black p-2 text-center font-bold">CREDIT</th>
                  <th className="border border-black p-2 text-center font-bold">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {/* Payment History Section */}
                <tr>
                  <td className="border-r border-black p-1">26-Jun-23</td>
                  <td className="border-r border-black p-1">BA\294</td>
                  <td className="border-r border-black p-1">Booking Advance</td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1">5,000.00</td>
                  <td className="border-r border-black text-right p-1"></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1">30-Jun-23</td>
                  <td className="border-r border-black p-1">CA\343</td>
                  <td className="border-r border-black p-1">Check In Advance [Federal Bank AC Xx9412]</td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1">20,648.00</td>
                  <td className="border-r border-black text-right p-1"></td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1">1-Jul-23</td>
                  <td className="border-r border-black p-1">CC\369</td>
                  <td className="border-r border-black p-1">Check Out Collection [Federal Bank AC Xx9412]</td>
                  <td className="border-r border-black p-1"></td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1">6,248.00</td>
                  <td className="border-r border-black text-right p-1"></td>
                </tr>

                {/* Room Charges Section */}
                <tr>
                  <td className="border-r border-black p-1">30-Jun-23</td>
                  <td className="border-r border-black p-1">C-OT\352</td>
                  <td className="border-r border-black p-1">Room Tariff [107 - Nasif P T]</td>
                  <td className="border-r border-black p-1">99631</td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1">5,050.00</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1">30-Jun-23</td>
                  <td className="border-r border-black p-1">C-OT\352</td>
                  <td className="border-r border-black p-1">Room Tariff [108 - Nasif P T]</td>
                  <td className="border-r border-black p-1">99631</td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1">4,725.00</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1">30-Jun-23</td>
                  <td className="border-r border-black p-1">C-OT\352</td>
                  <td className="border-r border-black p-1">Room Tariff [109 - Nasif P T]</td>
                  <td className="border-r border-black p-1">99631</td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1">4,400.00</td>
                </tr>
                <tr>
                  <td className="border-r border-b border-black p-1">30-Jun-23</td>
                  <td className="border-r border-b border-black p-1">C-OT\352</td>
                  <td className="border-r border-b border-black p-1">Room Tariff [110 - Nasif P T]</td>
                  <td className="border-r border-b border-black p-1">99631</td>
                  <td className="border-r border-b border-black text-right p-1"></td>
                  <td className="border-r border-b border-black text-right p-1"></td>
                  <td className="border-r border-b border-black text-right p-1">5,350.00</td>
                </tr>
                <tr className="bg-gray-100">
                  <td colSpan="6" className="text-right p-2 border-r border-black">Room Tariff Assessable Value</td>
                  <td className="p-2 text-right">19,525.00</td>
                </tr>
                <tr>
                  <td colSpan="6" className="text-right p-2 border-r border-black">Food Plan Sales @ 5%</td>
                  <td className="p-2 text-right">3,600.00</td>
                </tr>
                <tr>
                  <td colSpan="6" className="text-right p-2 border-r border-black">CGST</td>
                  <td className="p-2 text-right">1,261.50</td>
                </tr>
                <tr>
                  <td colSpan="6" className="text-right p-2 border-r border-b border-black">SGST</td>
                  <td className="border-b border-black p-2 text-right">1,261.50</td>
                </tr>

                {/* Room Service Section */}
                <tr className="bg-green-50 border-black">
                  <td colSpan="7" className="border-b-2 p-2 font-bold text-center">ROOM SERVICE BILL DETAILS</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1">30-Jun-23</td>
                  <td className="border-r border-black p-1">POS\699</td>
                  <td className="border-r border-black p-1">POS [Restaurant - HSN: 996332]</td>
                  <td className="border-r border-black p-1">996332</td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1">294.00</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1">30-Jun-23</td>
                  <td className="border-r border-black p-1">POS\700</td>
                  <td className="border-r border-black p-1">POS [Restaurant - HSN: 996332]</td>
                  <td className="border-r border-black p-1">996332</td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1">2,930.00</td>
                </tr>
                <tr>
                  <td className="border-r border-black p-1">30-Jun-23</td>
                  <td className="border-r border-black p-1">POS\710</td>
                  <td className="border-r border-black p-1">POS [Restaurant - HSN: 996332]</td>
                  <td className="border-r border-black p-1">996332</td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1"></td>
                  <td className="border-r border-black text-right p-1">3,024.00</td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan="5" className="border border-black p-1">Total</td>
                  <td className="border border-black text-right p-1">6,248.00</td>
                  <td className="border border-black text-right p-1">6,248.00</td>
                </tr>

                {/* Tax Summary */}
                <tr className="bg-red-50">
                  <td colSpan="6" className="border border-black font-bold text-right p-1">Round off</td>
                  <td className="border border-black p-1"></td>
                </tr>
                <tr className="bg-red-50">
                  <td colSpan="6" className="border border-black font-bold text-right p-1">TOTAL INVOICE AMOUNT</td>
                  <td className="border border-black p-2 text-right">6,248.00</td>
                </tr>
              </tbody>
            </table>

            {/* Tax Breakdown Table */}
            <div className="flex justify-end border-b border-l border-black">
              <table className="w-1/2 border border-black text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-center">Taxable</th>
                    <th className="border border-black p-1 text-center">CGST</th>
                    <th className="border border-black p-1 text-center"></th>
                    <th className="border border-black p-1 text-center">SGST/UTGST</th>
                    <th className="border border-black p-1 text-center"></th>
                    <th className="border border-black p-1 text-center">Total Tax Amount</th>
                  </tr>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-center">Amount</th>
                    <th className="border border-black p-1 text-center">Rate</th>
                    <th className="border border-black p-1 text-center">Amount</th>
                    <th className="border border-black p-1 text-center">Rate</th>
                    <th className="border border-black p-1 text-center">Amount</th>
                    <th className="border border-black p-1 text-center">Tax Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black p-1 text-right">19,525.00</td>
                    <td className="border border-black p-1 text-center">6%</td>
                    <td className="border border-black p-1 text-right">1,171.50</td>
                    <td className="border border-black p-1 text-center">6%</td>
                    <td className="border border-black p-1 text-right">1,171.50</td>
                    <td className="border border-black p-1 text-right">2,343.00</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-1 text-right">3,600.00</td>
                    <td className="border border-black p-1 text-center">2.50%</td>
                    <td className="border border-black p-1 text-right">90.00</td>
                    <td className="border border-black p-1 text-center">2.50%</td>
                    <td className="border border-black p-1 text-right">90.00</td>
                    <td className="border border-black p-1 text-right">180.00</td>
                  </tr>
                  <tr className="bg-gray-100 font-bold">
                    <td className="border border-black p-1 text-right">23,125.00</td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1 text-right">1,261.50</td>
                    <td className="border border-black p-1"></td>
                    <td className="border border-black p-1 text-right">1,261.50</td>
                    <td className="border border-black p-1 text-right">2,523.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2">
            {/* Footer Details */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              <div className="space-y-2">
                <div className="flex"><span className="w-32 font-bold">Settlement:</span><span>Nasif P T</span></div>
                <div className="flex"><span className="w-32 font-bold">Prepared By:</span><span>a</span></div>
                <div className="flex"><span className="w-32 font-bold">Billed By:</span><span>a</span></div>
                <div className="flex"><span className="w-32 font-bold">Rooms:</span><span>107, 108, 109, 110</span></div>
              </div>
              <div className="space-y-2">
                <div className="flex"><span className="w-32 font-bold">Total Rooms:</span><span>4</span></div>
                <div className="flex"><span className="w-32 font-bold">Total Pax:</span><span>8</span></div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="p-4 mb-6">
              <h4 className="font-bold mb-3 text-center border-b border-black">Bank Details</h4>
              <div className="space-y-2">
                <div className="flex"><span className="w-32 font-bold">Bank Name:</span><span className="border-b border-dotted border-black flex-1 mx-2"></span></div>
                <div className="flex"><span className="w-32 font-bold">A/C Number:</span><span className="border-b border-dotted border-black flex-1 mx-2"></span></div>
                <div className="flex"><span className="w-32 font-bold">Branch & IFSC:</span><span className="border-b border-dotted border-black flex-1 mx-2"></span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Footer - Will appear on every page */}
        <div className="print-footer">
          {/* Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black">
            <div className="text-center">
              <div className="mt-16 pt-2">Cashier Signature</div>
            </div>
            <div className="text-center">
              <div className="mt-16 pt-2">Guest Signature</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media screen {
          .print-header, .print-footer {
            position: static;
          }
        }

        @media print {
          .no-print { 
            display: none !important; 
          }
          
          body { 
            margin: 0; 
            background: white;
            font-size: 11px;
            line-height: 1.3;
          }
          
          .min-h-screen { 
            min-height: auto;
            background: white;
          }
          
          .bg-gray-50 { 
            background: white !important; 
          }

          .print-container {
            position: static;
            width: 100%;
            margin: 0;
            padding: 15px;
            border: 2px solid black;
            box-sizing: border-box;
          }

          .print-header {
            position: static;
            width: 100%;
            background: white;
            padding: 0;
            margin-bottom: 15px;
            border-bottom: none;
          }

          .print-footer {
            position: static;
            width: 100%;
            background: white;
            padding: 0;
            margin-top: 20px;
            border-top: 1px solid black;
            page-break-inside: avoid;
          }

          .print-content {
            margin: 0;
            width: 100%;
          }

          table {
            page-break-inside: auto;
            width: 100%;
            border-collapse: collapse;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tbody tr:first-child {
            page-break-before: avoid;
          }

          @page {
            margin: 0.5in;
            size: A4;
          }

          /* Ensure backgrounds print */
          .bg-gray-100 {
            background: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .bg-green-50 {
            background: #f0fdf4 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .bg-red-50 {
            background: #fef2f2 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Ensure borders are visible */
          .border-black {
            border-color: black !important;
          }

          /* Force table borders */
          table, th, td {
            border: 1px solid black !important;
          }

          /* Adjust text sizes for print */
          .text-xl {
            font-size: 18px !important;
          }
          
          .text-xs {
            font-size: 10px !important;
          }
          
          .text-sm {
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
}