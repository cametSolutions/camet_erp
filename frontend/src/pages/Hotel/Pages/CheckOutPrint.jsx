import React from 'react';
import sattvaLogo from "../../../assets/images/sattva.jpg";
export default function SattvaInvoice() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* <div className="no-print mb-4">
        <button 
          onClick={handlePrint}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium"
        >
          🖨️ Print Invoice
        </button>
      </div> */}
      
      <div className="max-w-4xl mx-auto bg-white border-2 border-black p-2 text-sm">
        {/* Header */}
       {/* Header */}
<div className="flex items-center justify-between border-black pb-4">
  {/* Logo on left */}
  <div className="w-24 h-24 flex-shrink-0">
    <img
      src={sattvaLogo}// <-- REPLACE with your logo path or imported image
      alt="Sattva Logo"
      className="object-contain h-full w-full"
    />
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
          <table className="w-full  border border-black">
            <thead>
              <tr className="bg-gray-100 text-xs ">
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
              {/* <tr className="bg-yellow-50">
                <td colSpan="7" className="border border-black p-2 font-bold text-center">PAYMENT HISTORY</td>
              </tr> */}
              <tr>
                <td  className=" border-r  border-black">26-Jun-23</td>
                <td className=" border-r  border-black  ">BA\294</td>
                <td className=" border-r  border-black  ">Booking Advance</td>
                <td className=" border-r  border-black  "></td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black  text-right">5,000.00</td>
                <td className=" border-r  border-black   text-right"></td>
              </tr>
              <tr>
                <td className=" border-r  border-black  ">30-Jun-23</td>
                <td className=" border-r  border-black  ">CA\343</td>
                <td className=" border-r  border-black  ">Check In Advance [Federal Bank AC Xx9412]</td>
                <td className=" border-r  border-black  "></td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right">20,648.00</td>
                <td className=" border-r  border-black   text-right"></td>
              </tr>
              <tr>
                <td className=" border-r  border-black  ">1-Jul-23</td>
                <td className="  border-r  border-black  ">CC\369</td>
                <td className=" border-r  border-black  ">Check Out Collection [Federal Bank AC Xx9412]</td>
                <td className=" border-r  border-black  "></td>
                <td className=" border-r  border-black  text-right"></td>
                <td className=" border-r  border-black    text-right">6,248.00</td>
                <td className=" border-r  border-black  text-right"></td>
              </tr>

              {/* Room Charges Section
              <tr className="bg-blue-50">
                <td colSpan="7" className="border border-black p-2 font-bold text-center">ROOM CHARGES</td>
              </tr> */}
              <tr>
                <td className=" border-r  border-black  ">30-Jun-23</td>
                <td className=" border-r  border-black  ">C-OT\352</td>
                <td className=" border-r  border-black  ">Room Tariff [107 - Nasif P T]</td>
                <td className=" border-r  border-black  ">99631</td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right">5,050.00</td>
              </tr>
              <tr>
                <td className=" border-r  border-black  ">30-Jun-23</td>
                <td className=" border-r  border-black  ">C-OT\352</td>
                <td className=" border-r  border-black  ">Room Tariff [108 - Nasif P T]</td>
                <td className=" border-r  border-black  ">99631</td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right">4,725.00</td>
              </tr>
              <tr>
                <td className=" border-r  border-black  ">30-Jun-23</td>
                <td className="  border-r  border-black ">C-OT\352</td>
                <td className=" border-r  border-black ">Room Tariff [109 - Nasif P T]</td>
                <td className=" border-r  border-black  ">99631</td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right">4,400.00</td>
              </tr>
              <tr>
                <td className=" border-r border-b border-black  ">30-Jun-23</td>
                <td className=" border-r  border-b border-black  ">C-OT\352</td>
                <td className=" border-r  border-b border-black  ">Room Tariff [110 - Nasif P T]</td>
                <td className=" border-r  border-b border-black  ">99631</td>
                <td className=" border-r  border-b border-black   text-right"></td>
                <td className=" border-r  border-b border-black   text-right"></td>
                <td className=" border-r  border-b border-black   text-right">5,350.00</td>
              </tr>
              <tr className="bg-gray-100 ">
                <td colSpan="6" className="text-right p-2 border-r  border-black ">Room Tariff Assessable Value</td>
                <td className=" p-2 text-right">19,525.00</td>
              </tr>
              <tr>
                <td colSpan="6" className="text-right p-2  border-r  border-black ">Food Plan Sales @ 5%</td>
                <td className=" p-2 text-right">3,600.00</td>
              </tr>
              <tr>
                <td colSpan="6" className="text-right p-2 border-r  border-black ">CGST</td>
                <td className=" p-2 text-right">1,261.50</td>
              </tr>
              <tr>
                <td colSpan="6" className=" text-right p-2  border-r  border-b border-black ">SGST</td>
                <td className="border-b  border-black p-2 text-right">1,261.50</td>
              </tr>

              {/* Room Service Section */}
              <tr className="bg-green-50  border-black">
                <td colSpan="7" className="border-b-2 p-2 font-bold text-center">ROOM SERVICE BILL DETAILS</td>
              </tr>
              <tr>
                <td className=" border-r  border-black  ">30-Jun-23</td>
                <td className=" border-r  border-black  ">POS\699</td>
                <td className=" border-r  border-black  ">POS [Restaurant - HSN: 996332]</td>
                <td className=" border-r  border-black  ">996332</td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right">294.00</td>
              </tr>
              <tr>
                <td className=" border-r  border-black  ">30-Jun-23</td>
                <td className=" border-r  border-black  ">POS\700</td>
                <td className=" border-r  border-black  ">POS [Restaurant - HSN: 996332]</td>
                <td className=" border-r  border-black  ">996332</td>
                <td className=" border-r  border-black  text-right"></td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right">2,930.00</td>
              </tr>
              <tr>
                <td className=" border-r  border-black  ">30-Jun-23</td>
                <td className=" border-r  border-black  ">POS\710</td>
                <td className=" border-r  border-black  ">POS [Restaurant - HSN: 996332]</td>
                <td className=" border-r  border-black  ">996332</td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right"></td>
                <td className=" border-r  border-black   text-right">3,024.00</td>
              </tr>
              <tr className="bg-gray-100 font-bold">
                <td colSpan="5" className="border border-black ">Total </td>
                <td className="border border-black  text-right">6,248.00</td>
                <td className="border border-black  text-right">6,248.00</td>
              </tr>

              {/* Tax Summary */}
              <tr className="bg-red-50">
                <td colSpan="6" className="border border-black  font-bold text-right">Round off</td>
                
              </tr>
              <tr className="bg-red-50">
                <td colSpan="6" className="border border-black  font-bold text-right">TOTAL INVOICE AMOUNT</td>
                  <td className="border border-black p-2 text-right">6,248.00</td>
              </tr>
            {/* Tax Summary */}
             
            </tbody>
          </table>

          {/* Tax Breakdown Table */}
     {/* Tax Breakdown Table */}
<div className="flex justify-end border-b border-l border-black ">
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
      <tr className="bg-gray-100  font-bold">
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

     
<div className="grid grid-cols-2 ">
    

        {/* Footer Details */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="space-y-2">
             <div className="flex"><span className="w-32 font-bold">  Settlement:</span><span>Nasif P T</span></div>
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
        <div className=" p-4 mb-6">
          <h4 className="font-bold mb-3 text-center border-b border-black">Bank Details</h4>
          <div className="space-y-2">
            <div className="flex"><span className="w-32 font-bold">Bank Name:</span><span className="border-b border-dotted border-black flex-1 mx-2"></span></div>
            <div className="flex"><span className="w-32 font-bold">A/C Number:</span><span className="border-b border-dotted border-black flex-1 mx-2"></span></div>
            <div className="flex"><span className="w-32 font-bold">Branch & IFSC:</span><span className="border-b border-dotted border-black flex-1 mx-2"></span></div>
          </div>
        </div>

</div>
      
        {/* Signatures */}
        <div className="grid grid-cols-2 ">
          <div className="text-center">
            <div className=" border-black mt-16 pt-2">Cashier Signature</div>
          </div>
          <div className="text-center">
            <div className=" border-black mt-16 pt-2">Guest Signature</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          .min-h-screen { min-height: auto; }
          .bg-gray-50 { background: white; }
        }
      `}</style>
    </div>
  );
}