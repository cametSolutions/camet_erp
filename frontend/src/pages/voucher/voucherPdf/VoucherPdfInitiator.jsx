import { useRef, useEffect, useState } from "react";
import api from "../../../api/api";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VoucherPdf from "./indian/VoucherPdf";
import VoucherPdfNonIndian from "./nonIndian/VoucherPdfNonIndian";
import TitleDiv from "@/components/common/TitleDiv";
import { formatVoucherType } from "../../../../utils/formatVoucherType";
import { SharingMethodSelector } from "../voucherDetails/actionButtons/SharingMethodSelector";
import { FaShareAlt, FaDownload, FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

function VoucherPdfInitiator() {
  const [data, setData] = useState([]);
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const pdfContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [printMethod, setPrintMethod] = useState('auto'); // 'auto', 'download', 'share'

  const IsIndian =
    useSelector(
      (state) => state?.secSelectedOrganization?.secSelectedOrg?.country
    ) === "India";

  const org = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );

  const bank = org?.configurations[0]?.bank;
  const contentToPrint = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  let voucherType = null;
  const params = {};

  if (pathname.includes("/sUsers/sharesales/")) {
    voucherType = "sales";
  } else if (pathname.includes("/sUsers/sharepurchase/")) {
    voucherType = "purchase";
  } else if (pathname.includes("/sUsers/sharesaleOrder/")) {
    voucherType = "saleOrder";
  } else if (pathname.includes("/sUsers/sharecreditNote/")) {
    voucherType = "creditNote";
  } else if (pathname.includes("/sUsers/sharedebitNote/")) {
    voucherType = "debitNote";
  } else if (pathname.includes("/sUsers/sharevanSale/")) {
    voucherType = "sales";
    params.vanSale = true;
  }

  // Detect mobile capabilities
  useEffect(() => {
    const checkMobileCapabilities = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      
      // Detect print support
      if (isMobileDevice) {
        // Check if we're in a WebView or problematic browser
        const isWebView = window.navigator.userAgent.includes('wv') || 
                         window.navigator.userAgent.includes('WebView') ||
                         !window.chrome;
        
        const isFirefoxAndroid = window.navigator.userAgent.includes('Firefox') && 
                                window.navigator.userAgent.includes('Android');
        
        if (isWebView || isFirefoxAndroid || !window.print) {
          setPrintMethod('download'); // Force download method
        } else {
          setPrintMethod('auto'); // Try print, fallback to download
        }
      }
    };

    checkMobileCapabilities();
    window.addEventListener("resize", checkMobileCapabilities);
    return () => window.removeEventListener("resize", checkMobileCapabilities);
  }, []);

  // Calculate distance between two touch points
  const getTouchDistance = (touches) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Handle touch start for zoom and pan
  const handleTouchStart = (e) => {
    if (!isMobile) return;

    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      setIsPanning(false);
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      setIsPanning(true);
    }
  };

  // Handle touch move for zoom and pan
  const handleTouchMove = (e) => {
    if (!isMobile) return;
    e.preventDefault();

    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      if (lastTouchDistance > 0) {
        const scale = distance / lastTouchDistance;
        const newZoom = Math.min(Math.max(zoomLevel * scale, 0.44), 3);
        setZoomLevel(newZoom);
      }
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1 && isPanning && zoomLevel > 1) {
      const touch = e.touches[0];
      const rect = pdfContainerRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      setPanOffset((prev) => ({
        x: prev.x + (x - prev.lastX || 0),
        y: prev.y + (y - prev.lastY || 0),
        lastX: x,
        lastY: y,
      }));
    }
  };

  // Handle touch end
  const handleTouchEnd = (e) => {
    if (!isMobile) return;

    if (e.touches.length === 0) {
      setIsPanning(false);
      setLastTouchDistance(0);
      setPanOffset((prev) => ({ ...prev, lastX: undefined, lastY: undefined }));
    }
  };

  // Reset zoom and pan
  const resetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/api/sUsers/get${voucherType}Details/${id}`,
          { params, withCredentials: true }
        );
        setData(res.data.data);
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "An error occurred");
        setTimeout(() => navigate(-1, { replace: true }), 2000);
      } finally {
        setLoading(false);
      }
    };

    getTransactionDetails();
  }, [id, voucherType]);

  // Generate HTML content for download
  const generatePrintableHTML = () => {
    const printContent = contentToPrint.current;
    if (!printContent) return '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.salesNumber ? `${data.salesNumber}_${data._id?.slice(-4) || 'Invoice'}` : "Sales_Invoice"}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page {
              size: A4;
              margin: 0mm 10mm 9mm 10mm;
            }
            
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .pdf-content {
              width: 100%;
              max-width: 210mm;
              margin: 0 auto;
            }
            
            @media print {
              body { margin: 0; padding: 20px; }
              .pdf-content { width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="pdf-content">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `;
    return html;
  };

  // Download as HTML file (mobile-friendly)
  const handleDownloadHTML = () => {
    try {
      const htmlContent = generatePrintableHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.salesNumber 
        ? `${data.salesNumber}_${data._id?.slice(-4) || 'Invoice'}.html` 
        : 'Sales_Invoice.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Invoice downloaded! Open the file and print from your browser.");
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Download failed. Please try again.");
    }
  };

  // Web Share API (if available)
  const handleWebShare = async () => {
    if (!navigator.share) {
      handleDownloadHTML();
      return;
    }

    try {
      const htmlContent = generatePrintableHTML();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const file = new File([blob], 
        data.salesNumber 
          ? `${data.salesNumber}_${data._id?.slice(-4) || 'Invoice'}.html` 
          : 'Sales_Invoice.html', 
        { type: 'text/html' }
      );

      await navigator.share({
        title: 'Invoice',
        text: 'Invoice document',
        files: [file]
      });
    } catch (error) {
      console.error('Share failed:', error);
      handleDownloadHTML(); // Fallback to download
    }
  };

  // Traditional print (for desktop and compatible mobile browsers)
  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    documentTitle: data.salesNumber
      ? `${data.salesNumber}_${data._id?.slice(-4) || 'Invoice'}`
      : "Sales_Invoice",
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
        body * {
          visibility: hidden;
        }
        .pdf-content-print, .pdf-content-print * {
          visibility: visible;
        }
        .pdf-content-print {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 210mm !important;
          transform: none !important;
        }
      }
    `,
    onAfterPrint: () => console.log("PDF printed successfully"),
  });

  // Smart print handler that chooses the best method
  const handleSmartPrint = () => {
    if (printMethod === 'download') {
      handleDownloadHTML();
    } else if (printMethod === 'share' && navigator.share) {
      handleWebShare();
    } else {
      // Try traditional print, fallback to download on error
      try {
        handlePrint();
      } catch (error) {
        console.error('Print failed, falling back to download:', error);
        handleDownloadHTML();
      }
    }
  };

  return (
    <div>
      <TitleDiv
        title={`${formatVoucherType(voucherType)} Preview`}
        rightSideContent={<FaShareAlt />}
        rightSideModalComponent={({ setShowModal }) => (
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Print Options</h3>
            
            {isMobile && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  📱 Mobile detected. Choose the best option for your device:
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  handleSmartPrint();
                  setShowModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaPrint />
                {printMethod === 'download' ? 'Download & Print' : 'Print'}
              </button>
              
              <button
                onClick={() => {
                  handleDownloadHTML();
                  setShowModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FaDownload />
                Download HTML
              </button>
              
              {navigator.share && (
                <button
                  onClick={() => {
                    handleWebShare();
                    setShowModal(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <FaShareAlt />
                  Share
                </button>
              )}
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              💡 Tip: Download creates an HTML file you can open and print from any browser
            </div>
          </div>
        )}
      />

      <div
        className={`${loading ? "opacity-30 pointer-events-none" : ""} w-full flex flex-col items-center justify-center p-4`}
        style={{ touchAction: isMobile ? "none" : "auto" }}
      >
        <div
          ref={pdfContainerRef}
          className={`mobile-pdf-container relative ${
            isMobile ? "overflow-hidden" : "overflow-scroll overflow-x-hidden"
          }`}
          style={{
            width: "100%",
            height: isMobile ? "85vh" : "100%",
            border: isMobile ? "1px solid #e5e7eb" : "none",
            borderRadius: isMobile ? "8px" : "0",
            boxShadow: isMobile ? "0 4px 6px -1px rgba(0,0,0,0.1)" : "none",
            backgroundColor: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: isMobile ? "flex-start" : "center",
            padding: isMobile ? "10px" : "0",
            cursor: isMobile && zoomLevel > 1 ? "grab" : "default",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            ref={contentToPrint}
            className="pdf-content-print"
            style={{
              width: "210mm",
              minWidth: "210mm",
              transform: isMobile
                ? `scale(${0.44 * zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`
                : "none",
              transformOrigin: "top center",
              padding: "20px",
              margin: "0 auto",
              display: "block",
              backgroundColor: "white",
              transition: isPanning ? "none" : "transform 0.1s ease-out",
            }}
          >
            {IsIndian ? (
              <VoucherPdf
                data={data}
                org={org}
                bank={bank}
                userType="secondaryUser"
                tab="sales"
              />
            ) : (
              <VoucherPdfNonIndian
                data={data}
                org={org}
                bank={bank}
                userType="secondaryUser"
                tab="sales"
              />
            )}
          </div>
        </div>

        {isMobile && (
          <div className="mt-4 w-full flex justify-center items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>

            {(zoomLevel > 1 || panOffset.x !== 0 || panOffset.y !== 0) && (
              <button
                onClick={resetZoom}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
              >
                Reset View
              </button>
            )}

            <div className="text-xs text-gray-500">
              Pinch to zoom • {Math.round(zoomLevel * 100)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VoucherPdfInitiator;