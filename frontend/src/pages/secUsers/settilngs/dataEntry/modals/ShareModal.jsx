/* eslint-disable react/prop-types */
import React from "react";
import Mail from "../../../../../assets/images/gmail.png";
import WhatsApp from "../../../../../assets/images/whatsapp.png";
import Download from "../../../../../assets/images/download.png";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PDFDocument } from "pdf-lib";
import api from "../../../../../api/api";
import { useReactToPrint } from "react-to-print";

const shareMethods = [
  { id: "email", imgSrc: Mail, alt: "Email" },
  { id: "whatsapp", imgSrc: WhatsApp, alt: "WhatsApp" },
  { id: "download", imgSrc: Download, alt: "Download" },
];

export default function ShareModal({
  showModal,
  setShowModal,
  contentToPrint,
  data,
  org,
}) {
  const [selectedMethod, setSelectedMethod] = React.useState("email");
  const handleMethodClick = (id) => {
    console.log("Selected method:", id);

    setSelectedMethod(id);
    console.log(`Selected method: ${id}`);
  };

  /////////  New function to generate PDF Blob //////////////
  const generatePdfBlob = async (element) => {
    try {
      // Use html2canvas with more balanced settings
      const canvas = await html2canvas(element, {
        scale: 3, // Slightly increased scale for better quality
        useCORS: true,
        logging: false,
        imageTimeout: 0,
        allowTaint: true,
        optimization: 2, // Balanced optimization
      });

      // Use PNG for better quality, but with moderate compression
      const imgData = canvas.toDataURL("image/png", 0.8); // Improved compression ratio

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions with better proportion preservation
      const imgRatio = imgProps.width / imgProps.height;
      const pdfRatio = pdfWidth / pdfHeight;

      let drawWidth, drawHeight, xOffset, yOffset;

      if (imgRatio > pdfRatio) {
        // Width-constrained
        drawWidth = pdfWidth;
        drawHeight = pdfWidth / imgRatio;
        xOffset = 0;
        yOffset = (pdfHeight - drawHeight) / 2;
      } else {
        // Height-constrained
        drawHeight = pdfHeight;
        drawWidth = pdfHeight * imgRatio;
        yOffset = 0;
        xOffset = (pdfWidth - drawWidth) / 2;
      }

      // Add image with improved quality settings
      pdf.addImage(
        imgData,
        "PNG",
        xOffset,
        yOffset,
        drawWidth,
        drawHeight,
        null,
        "FAST" // Balanced compression
      );

      // Generate blob
      const pdfOutput = pdf.output("blob");

      // Optional compression
      return await compressPDF(pdfOutput);
    } catch (error) {
      console.error("PDF generation error:", error);
      throw error;
    }
  };

  // Compression function
  async function compressPDF(pdfBlob) {
    try {
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Mild compression
      const compressedPdf = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
        updateFieldAppearances: false,
      });

      const compressedBlob = new Blob([compressedPdf], {
        type: "application/pdf",
      });

      // Logging for verification
      console.log("Original Blob Size:", pdfBlob.size / 1024 + "KB");
      console.log("Compressed Blob Size:", compressedBlob.size / 1024 + "KB");

      return compressedBlob;
    } catch (error) {
      console.error("PDF compression error:", error);
      return pdfBlob;
    }
  }

  //////// New function to share via WhatsApp ////////////////////
  const shareViaWhatsApp = async () => {
    const element = contentToPrint.current;

    try {
      // Generate PDF if not already generated
      let currentPdfBlob = await generatePdfBlob(element);
      if (!currentPdfBlob) {
        const element = contentToPrint.current;
        currentPdfBlob = await generatePdfBlob(element);
        //  setPdfBlob(currentPdfBlob);
      }

      // Create a file object
      const pdfFile = new File(
        [currentPdfBlob],
        `Sales_Invoice_${data.salesNumber}.pdf`,
        {
          type: "application/pdf",
        }
      );

      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare) {
        try {
          await navigator.share({
            title: "Sales Invoice",
            text: `Sales Invoice for ${data?.party?.name || "Customer"}`,
            files: [pdfFile],
          });
        } catch (error) {
          console.error("Error sharing:", error);
          fallbackWhatsAppShare(pdfFile);
        }
      } else {
        // Fallback for browsers without Web Share API
        fallbackWhatsAppShare(pdfFile);
      }
    } catch (error) {
      console.error("Error preparing WhatsApp share:", error);
      toast.error("Failed to prepare PDF for sharing");
    }
  };

  //////// New function to share via email ////////////////////
  const sendEmailWithPdf = async () => {
    const element = contentToPrint.current;

    try {
      // Generate PDF Blob
      const pdfBlob = await generatePdfBlob(element);


      // Compress the PDF to reduce size
      const compressedPdfBlob = await compressPDF(pdfBlob);

      // Convert Blob to Base64
      const base64Pdf = await blobToBase64(compressedPdfBlob);

      // Send the PDF as a base64-encoded string to your backend
      const response = await api.post(
        `/api/sUsers/sendPdfViaMail/${org?._id}`,
        {
          pdfBlob: base64Pdf,
          email: data?.party?.emailID,
          subject: "Your Sales Invoice",
        },
        { withCredentials: true } // Ensure this is passed in the second argument
      );

      if (response.data.success) {
        console.log("Email sent successfully");
      } else {
        console.error("Failed to send email:", response.data.message);
      }
    } catch (error) {
      console.error("Error generating or sending PDF:", error);
    }
  };

  //// Function to convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Check if result is not NaN
        const base64data = reader.result ? reader.result.split(",")[1] : null;
        if (base64data) {
          resolve(base64data);
        } else {
          reject(new Error("Failed to convert Blob to Base64"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  };

  // Fallback method for WhatsApp sharing
  const fallbackWhatsAppShare = (pdfFile) => {
    // Create a URL for the PDF file
    const pdfUrl = URL.createObjectURL(pdfFile);

    // Construct WhatsApp share URL
    const whatsappShareUrl = `https://api.whatsapp.com/send?text=Sales Invoice&document=${encodeURIComponent(
      pdfUrl
    )}`;

    // Open WhatsApp
    window.open(whatsappShareUrl, "_blank");

    // Revoke the URL after a delay to free up memory
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 100);
  };

  //// to print pdf ////////////////////////
  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    // documentTitle: `Sales ${data.salesNumber}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0mm 10mm 9mm 10mm;
      }
  
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          font-family: 'Arial', sans-serif;
        }
  
        .pdf-page {
          page-break-after: always;
        }
  
        .pdf-content {
          font-size: 19px;
        }
  
        .print-md-layout {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          padding: 1rem 2rem;
          width: 100%;
        }
  
        .bill-to, .ship-to {
          width: 50%;
          padding-right: 1rem;
          border-right: 1px solid #e5e7eb; /* Tailwind color gray-300 */
        }
  
        .details-table {
          width: 50%;
          padding-left: 1rem;
        }
  
        .details-table td {
          font-size: 11px;
          color: #6b7280; /* Tailwind color gray-500 */
        }
  
        /* Force flex-row for print */
        @media print {
          .print-md-layout {
            display: flex !important;
            flex-direction: row !important;
          }
        }
      }
    `,
    onAfterPrint: () => console.log("after printing..."),
    removeAfterPrint: true,
  });

  const handleShare = () => {
   

    if (selectedMethod === "email") {
      sendEmailWithPdf();
    } else if (selectedMethod === "whatsapp") {
      shareViaWhatsApp();
    } else {
      handlePrint();
    }
    setShowModal(false);
  };

  return (
    <>
      {showModal ? (
        <>
          <div className="sm:w-[calc(100%-250px)] sm:ml-[250px] justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/* content */}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-gray-100 outline-none focus:outline-none">
                {/* Body */}
                <div className="relative p-6 flex gap-5 shadow-lg items-center justify-center">
                  {shareMethods.map((method) => {
                    return (
                      <div
                        key={method.id}
                        onClick={() => handleMethodClick(method.id)}
                        className={` ${
                          selectedMethod === method?.id
                            ? "border border-gray-500"
                            : ""
                        }  p-2 shadow-xl rounded-lg border border-gray-100 cursor-pointer hover:translate-y-[1px] duration-200`}
                      >
                        <img
                          className="w-10 h-10"
                          src={method.imgSrc}
                          alt={method.alt}
                        />
                      </div>
                    );
                  })}
                </div>
                {/* Footer */}
                <div className="flex items-center justify-end p-2 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-xs outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={handleShare}
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}
