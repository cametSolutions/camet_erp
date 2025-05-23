import { useState, useEffect, useRef } from "react";

const Demo = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

   // Setup print functionality using useReactToPrint
  // const handlePrint = useReactToPrint({
  //   content: () => contentToPrint.current,
  //   documentTitle: data.salesNumber
  //     ? `${data.salesNumber}_${data._id.slice(-4)}`
  //     : "Sales_Invoice",
  //   pageStyle: `
  //     @page {
  //       size: A4;
  //       margin: 0mm 10mm 9mm 10mm;
  //     }

  //     @media print {
  //       body {
  //         -webkit-print-color-adjust: exact;
  //         font-family: 'Arial', sans-serif;
  //       }

  //       .pdf-page {
  //         page-break-after: always;
  //       }

  //       .pdf-content {
  //         font-size: 19px;
  //       }

  //       .print-md-layout {
  //         display: flex;
  //         flex-direction: row;
  //         justify-content: space-between;
  //         align-items: flex-start;
  //         gap: 8px;
  //         padding: 1rem 2rem;
  //         width: 100%;
  //       }

  //       .bill-to, .ship-to {
  //         width: 50%;
  //         padding-right: 1rem;
  //         border-right: 1px solid #e5e7eb;
  //       }

  //       .details-table {
  //         width: 50%;
  //         padding-left: 1rem;
  //       }

  //       .details-table td {
  //         font-size: 11px;
  //         color: #6b7280;
  //       }

  //       @media print {
  //         .print-md-layout {
  //           display: flex !important;
  //           flex-direction: row !important;
  //         }
  //       }
  //     }
  //   `,
  //   onAfterPrint: () => {
  //     console.log("PDF printed successfully");
  //     // Navigate back after printing completes
  //     setTimeout(() => {
  //       navigate(-1, { replace: true });
  //     }, 500);
  //   },
  //   removeAfterPrint: true,
  // });

  // Effect to trigger PDF printing once data is loaded
  // useEffect(() => {
  //   if (!loading && data.salesNumber && contentToPrint.current) {
  //     // Small delay to ensure the PDF component is fully rendered
  //     const timer = setTimeout(() => {
  //       // Trigger the print dialog automatically
  //       handlePrint();
  //     }, 1000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [loading, data.salesNumber, handlePrint]);


  // Function to get scroll position
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollTop);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-xl font-bold mb-4">Scroll Position: {scrollPosition}px</h1>
      <div
        ref={containerRef}
        className="w-full max-w-md h-64 overflow-y-auto border border-gray-300 rounded-lg p-2"
      >
        {/* Long list of items */}
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="p-2 border-b border-gray-200">
            Item {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Demo;
