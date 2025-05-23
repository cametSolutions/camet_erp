import { useRef, useEffect, useState } from "react";
import api from "../../../api/api";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import VoucherPdf from "./indian/VoucherPdf";
import VoucherPdfNonIndian from "./nonIndian/VoucherPdfNonIndian";

function VoucherPdfInitiator() {
  const [data, setData] = useState([]);
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const pdfContainerRef = useRef(null);

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
  } // ... other conditions

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
      // Two finger touch - prepare for zoom
      const distance = getTouchDistance(e.touches);
      setLastTouchDistance(distance);
      setIsPanning(false);
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      // Single finger touch when zoomed - prepare for pan
      setIsPanning(true);
    }
  };

  // Handle touch move for zoom and pan
  const handleTouchMove = (e) => {
    if (!isMobile) return;
    e.preventDefault();

    if (e.touches.length === 2) {
      // Two finger move - handle zoom
      const distance = getTouchDistance(e.touches);
      if (lastTouchDistance > 0) {
        const scale = distance / lastTouchDistance;
        const newZoom = Math.min(Math.max(zoomLevel * scale, 0.44), 3);
        setZoomLevel(newZoom);
      }
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1 && isPanning && zoomLevel > 1) {
      // Single finger move when zoomed - handle pan
      const touch = e.touches[0];
      const rect = pdfContainerRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      setPanOffset(prev => ({
        x: prev.x + (x - prev.lastX || 0),
        y: prev.y + (y - prev.lastY || 0),
        lastX: x,
        lastY: y
      }));
    }
  };

  // Handle touch end
  const handleTouchEnd = (e) => {
    if (!isMobile) return;
    
    if (e.touches.length === 0) {
      setIsPanning(false);
      setLastTouchDistance(0);
      setPanOffset(prev => ({ ...prev, lastX: undefined, lastY: undefined }));
    }
  };

  // Reset zoom and pan
  const resetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Check for mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/get${voucherType}Details/${id}`,
          { params, withCredentials: true }
        );
        setData(res.data.data);
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "An error occurred");
        setTimeout(() => navigate(-1, { replace: true }), 2000);
      }
    };

    getTransactionDetails();
  }, [id, voucherType, navigate, params]);

  return (
    <div 
      className="w-full flex flex-col items-center justify-center bg-gray-50 p-4 "
      style={{
        touchAction: isMobile ? "none" : "auto", // Prevent default touch behavior
      }}
    >
      {/* PDF container - stays intact on mobile */}
      <div
        ref={pdfContainerRef}
        className={`relative ${isMobile ? "overflow-hidden" : "overflow-scroll overflow-x-hidden "}`}
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
        {/* PDF content - scaled and pannable on mobile */}
        <div
          ref={contentToPrint}
          style={{
            width: "210mm", // Standard A4 width
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

      {/* Mobile controls */}
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
  );
}

export default VoucherPdfInitiator;