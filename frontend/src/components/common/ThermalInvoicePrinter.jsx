// /* eslint-disable react/prop-types */
// import{  useState } from 'react';
// import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer';

// const ThermalInvoicePrinter = ({ data, org, subTotal, additinalCharge, inWords }) => {
//   const [isPrinting, setIsPrinting] = useState(false);

//   const printInvoice = async () => {
//     setIsPrinting(true);

//     try {
//       // In a real-world scenario, you'd send this data to a server
//       // that can communicate with the thermal printer
//       const printer = new ThermalPrinter({
//         type: PrinterTypes.EPSON,
//         interface: 'printer:thermalprinter',
//         characterSet: CharacterSet.PC437_USA
//       });

//       printer.alignCenter();
//       printer.println(org.name);
//       printer.println(org.address);
//       printer.println(`GST: ${org.gstNo}`);
//       printer.breakLine();

//       printer.alignLeft();
//       printer.println(`Invoice: ${data.orderNumber}`);
//       printer.println(`Date: ${new Date().toLocaleDateString()}`);
//       printer.breakLine();

//       printer.println('Items:');
//       data.items.forEach(item => {
//         printer.println(`${item.name} x${item.quantity} - ₹${item.total}`);
//       });

//       printer.breakLine();
//       printer.println(`Subtotal: ₹${subTotal}`);
//       printer.println(`Additional Charges: ₹${additinalCharge}`);
//       printer.println(`Total: ₹${data.finalAmount}`);
//       printer.breakLine();

//       printer.alignCenter();
//       printer.println(`${inWords}`);
//       printer.cut();

//       // In a real implementation, you'd send the print job to the server here
//       console.log(await printer.getBuffer());

//       setIsPrinting(false);
//     } catch (error) {
//       console.error('Printing failed:', error);
//       setIsPrinting(false);
//     }
//   };

//   return (
//     <div className="mt-4">
//       <button
//         onClick={printInvoice}
//         disabled={isPrinting}
//         className={`px-4 py-2 bg-blue-500 text-white rounded ${
//           isPrinting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
//         }`}
//       >
//         {isPrinting ? 'Printing...' : 'Print Thermal Invoice'}
//       </button>
//     </div>
//   );
// };

// export default ThermalInvoicePrinter;