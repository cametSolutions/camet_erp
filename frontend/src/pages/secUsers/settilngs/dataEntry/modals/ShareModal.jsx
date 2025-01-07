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
import { BarLoader } from "react-spinners";

const shareMethods = [
  { id: "download", imgSrc: Download, alt: "Download", active: true },
  { id: "email", imgSrc: Mail, alt: "Email", active: true },
  { id: "whatsapp", imgSrc: WhatsApp, alt: "WhatsApp", active: false },
];

export default function ShareModal({
  showModal=true,
  setShowModal,
  contentToPrint,
  data,
  org,
}) {
  const [selectedMethod, setSelectedMethod] = React.useState("email");
  const [loading, setLoading] = React.useState(false);

  const handleMethodClick = (id) => {
    setSelectedMethod(id);
  };

  const generatePdfBlob = async (element) => {
    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        imageTimeout: 0,
        allowTaint: true,
        optimization: 2,
      });
  
      const imgData = canvas.toDataURL("image/png", 0.8);
  
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
  
      const topMargin = 10; // Set the top margin (can be adjusted)
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
  
      let drawWidth, drawHeight, xOffset, yOffset;
  
      if (imgProps.width / imgProps.height > pdfWidth / pdfHeight) {
        drawWidth = pdfWidth;
        drawHeight = pdfWidth / (imgProps.width / imgProps.height);
        xOffset = 0;
        yOffset = topMargin; // Start from the top margin
      } else {
        drawHeight = pdfHeight - topMargin; // Account for the top margin
        drawWidth = drawHeight * (imgProps.width / imgProps.height);
        yOffset = topMargin; // Start from the top margin
        xOffset = (pdfWidth - drawWidth) / 2;
      }
  
      pdf.addImage(
        imgData,
        "PNG",
        xOffset,
        yOffset,
        drawWidth,
        drawHeight,
        null,
        "FAST"
      );
  
      const pdfOutput = pdf.output("blob");
  
      return await compressPDF(pdfOutput);
    } catch (error) {
      console.error("PDF generation error:", error);
      throw error;
    }
  };
  

  async function compressPDF(pdfBlob) {
    try {
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const compressedPdf = await pdfDoc.save({
        useObjectStreams: false,
        addDefaultPage: false,
        updateFieldAppearances: false,
      });

      const compressedBlob = new Blob([compressedPdf], {
        type: "application/pdf",
      });

      console.log("Original Blob Size:", pdfBlob.size / 1024 + "KB");
      console.log("Compressed Blob Size:", compressedBlob.size / 1024 + "KB");

      return compressedBlob;
    } catch (error) {
      console.error("PDF compression error:", error);
      return pdfBlob;
    }
  }

  const shareViaWhatsApp = async () => {
    const element = contentToPrint.current;

    try {
      let currentPdfBlob = await generatePdfBlob(element);
      if (!currentPdfBlob) {
        currentPdfBlob = await generatePdfBlob(element);
      }

      const pdfFile = new File(
        [currentPdfBlob],
        `Sales_Invoice_${data.salesNumber}.pdf`,
        {
          type: "application/pdf",
        }
      );

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
        fallbackWhatsAppShare(pdfFile);
      }
    } catch (error) {
      console.error("Error preparing WhatsApp share:", error);
      toast.error("Failed to prepare PDF for sharing");
    }
  };

  const sendEmailWithPdf = async () => {
    const element = contentToPrint.current;

    setLoading(true);
    try {
      const pdfBlob = await generatePdfBlob(element);
      const compressedPdfBlob = await compressPDF(pdfBlob);
      const base64Pdf = await blobToBase64(compressedPdfBlob);

      const response = await api.post(
        `/api/sUsers/sendPdfViaMail/${org?._id}`,
        {
          pdfBlob: base64Pdf,
          email: data?.party?.emailID,
          subject: "Your Sales Invoice",
        },
        { withCredentials: true }
      );

      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error("Error generating or sending PDF:", error);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
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

  const fallbackWhatsAppShare = (pdfFile) => {
    const pdfUrl = URL.createObjectURL(pdfFile);
    const whatsappShareUrl = `https://api.whatsapp.com/send?text=Sales Invoice&document=${encodeURIComponent(
      pdfUrl
    )}`;
    window.open(whatsappShareUrl, "_blank");
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 100);
  };

  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
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
          border-right: 1px solid #e5e7eb;
        }

        .details-table {
          width: 50%;
          padding-left: 1rem;
        }

        .details-table td {
          font-size: 11px;
          color: #6b7280;
        }

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
    // setShowModal(false);
  };

  return (
    <>
      {showModal ? (
        <div className="relative">
          <div className="sm:w-[calc(100%-250px)] sm:ml-[250px] justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50  outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl ">
              {/* <div className= "> */}

              {loading && (
                <BarLoader
                  color="#9900ff"
                  width="100%"
                  className="absolute top-1 z-50 rounded-lg  "
                />
              )}

              {/* </div> */}
              <div className="border-0 rounded-b-lg shadow-lg relative flex flex-col w-full bg-gray-100 outline-none focus:outline-none">
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
                        }   ${
                          !method?.active
                            ? "opacity-50 pointer-events-none"
                            : ""
                        } p-2 shadow-xl rounded-lg border border-gray-100 cursor-pointer hover:translate-y-[1px] duration-200`}
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
        </div>
      ) : null}
    </>
  );
}