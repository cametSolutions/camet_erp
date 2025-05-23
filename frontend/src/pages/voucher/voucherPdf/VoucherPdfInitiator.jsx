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
  const pdfContentRef = useRef(null);
  const pdfFrameRef = useRef(null);

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

  // Check for mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
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
    <div className=" w-full flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Fixed frame container - won't zoom */}
      <div 
        ref={pdfFrameRef}
        className="relative"
        style={{
          width: isMobile ? '100%' : '100%',
          height: isMobile ? '70vh' : '100%',
          border: isMobile ? '1px solid #e5e7eb' : 'none',
          borderRadius: isMobile ? '8px' : '0',
          boxShadow: isMobile ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
          backgroundColor: 'white',
          overflow: 'hidden' // Changed from 'auto' to 'hidden'
        }}
      >
        {/* Scrollable and zoomable PDF content */}
        <div
          className="overflow-auto w-full h-full" // Scrollable area
          style={{
            touchAction: isMobile ? 'manipulation' : 'auto'
          }}
        >
          {/* PDF content that will zoom */}
          <div 
            ref={pdfContentRef}
            style={{
              width: '210mm',
              minWidth: '210mm',
              transform: isMobile ? 'scale(0.44)' : 'none',
              transformOrigin: 'center center',
              padding: '20px',
              margin: '0 auto'
            }}
          >
            <div ref={contentToPrint}>
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
        </div>
      </div>
      
      {/* Fixed back button (won't zoom) */}
      {isMobile && (
        <div className="mt-4 w-full text-center" style={{ transform: 'scale(1)' }}>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-200 rounded-md text-sm"
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}

export default VoucherPdfInitiator;
