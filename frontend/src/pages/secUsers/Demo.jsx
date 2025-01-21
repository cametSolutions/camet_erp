import React from 'react';

const Demo = () => {
  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="border border-black rounded-full w-8 h-8 flex items-center justify-center text-sm">
          JJ
        </div>
        <h1 className="text-lg">International Instruments</h1>
      </div>
      
      <div className="border border-black">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {/* Product Row */}
            <tr>
              <td className="border border-black px-1 py-0.5 w-20">Product</td>
              <td className="border border-black px-1 py-0.5" colSpan={4}>Photom Micro Dissector 5 mm C Knurling Handle</td>
              <td className="border border-black px-1 py-0.5 w-16">Code</td>
              <td className="border border-black px-1 py-0.5">CVR103-05</td>
            </tr>
            
            {/* Customer Row */}
            <tr>
              <td className="border border-black px-1 py-0.5">Customer</td>
              <td className="border border-black px-1 py-0.5" colSpan={4}>LVN</td>
              <td className="border border-black px-1 py-0.5">Job Type</td>
              <td className="border border-black px-1 py-0.5 bg-green-200">polished resin</td>
            </tr>
            
            {/* WRD Row */}
            <tr>
              <td className="border border-black px-1 py-0.5">WRD No</td>
              <td className="border border-black px-1 py-0.5"></td>
              <td className="border border-black px-1 py-0.5">Issue Date</td>
              <td className="border border-black px-1 py-0.5">09-Jul-2024</td>
              <td className="border border-black px-1 py-0.5">Return Date</td>
              <td className="border border-black px-1 py-0.5" colSpan={2}>10-Jul-2024</td>
            </tr>
            
            {/* Job No Row */}
            <tr>
              <td className="border border-black px-1 py-0.5">Job No</td>
              <td className="border border-black px-1 py-0.5 bg-green-200">JO/02207/24-25</td>
              <td className="border border-black px-1 py-0.5">Rack</td>
              <td className="border border-black px-1 py-0.5">1.00</td>
              <td className="border border-black px-1 py-0.5"></td>
              <td className="border border-black px-1 py-0.5" colSpan={2}>2428</td>
            </tr>
            
            {/* SI No Row */}
            <tr>
              <td className="border border-black px-1 py-0.5">SI No</td>
              <td className="border border-black px-1 py-0.5">Process</td>
              <td className="border border-black px-1 py-0.5">Worker</td>
              <td className="border border-black px-1 py-0.5" colSpan={2}>
                <div className="flex justify-between">
                  <span>Issue</span>
                  <span>Time</span>
                </div>
              </td>
              <td className="border border-black px-1 py-0.5" colSpan={2}>
                <div className="flex justify-between">
                  <span>Ex. Return</span>
                  <span>Time</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Demo;