/* eslint-disable react/prop-types */
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MobilePdfViewer({ 
  children, 
  loading = false, 
  showControls = true,
  onGoBack,
  containerHeight = "75vh",
  initialScale = 0.476,
  className = "",
  containerClassName = ""
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const pdfContainerRef = useRef(null);
  const navigate = useNavigate();

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

  // Handle go back
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      navigate(-1);
    }
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

  return (
    <div className={className}>
      <div
        className={`${
          loading ? "opacity-30 pointer-events-none" : ""
        } w-full flex flex-col items-center justify-center p-1 ${containerClassName}`}
        style={{
          touchAction: isMobile ? "none" : "auto",
        }}
      >
        {/* PDF container */}
        <div
          ref={pdfContainerRef}
          className={`mobile-pdf-container relative ${
            isMobile ? "overflow-hidden" : "overflow-scroll overflow-x-hidden"
          }`}
          style={{
            width: "100%",
            height: isMobile ? containerHeight : "100%",
            border: isMobile ? "7px solid #e5e7eb" : "none",
            borderRadius: isMobile ? "0px" : "0",
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
            className="pdf-content-print"
            style={{
              width: "210mm",
              minWidth: "210mm",
              transform: isMobile
                ? `scale(${initialScale * zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`
                : "none",
              transformOrigin: "top center",
              padding: "20px",
              margin: "0 auto",
              display: "block",
              backgroundColor: "white",
              transition: isPanning ? "none" : "transform 0.1s ease-out",
            }}
          >
            {children}
          </div>
        </div>

        {/* Mobile controls */}
        {isMobile && showControls && (
          <div className="mt-4 w-full flex justify-center items-center gap-4">
            <button
              onClick={handleGoBack}
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

export default MobilePdfViewer;