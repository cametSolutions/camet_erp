import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ReportsMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  // close when click outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const reportBtnBase =
    "flex items-center gap-2 w-full px-2 py-1.5 rounded-md " +
    "text-xs font-semibold text-gray-800 hover:bg-emerald-50 " +
    "transition-colors";

  return (
    <div className="relative" ref={ref}>
      {/* single 3-dot button on dashboard */}
      <button
        type="button"
        className="flex items-center justify-center w-9 h-9 rounded-full 
                   bg-blue-200 hover:bg-gray-300 text-gray-700"
        onClick={() => setOpen((p) => !p)}
      >
        <span className="text-xl leading-none">⋮</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 
                        rounded-lg shadow-xl z-30 py-2">
          <div className="px-3 pb-1 text-[11px] font-semibold text-gray-500 uppercase">
            Reports
          </div>

          <button
            className={reportBtnBase}
            onClick={() => {
              setOpen(false);
              navigate("/sUsers/BillSummary?type=hotel");
            }}
          >
            <span className="text-sm">📊</span>
            HOTEL DAILY SALES
          </button>

          <button
            className={reportBtnBase}
            onClick={() => {
              setOpen(false);
              navigate("/sUsers/Checkoutpdf");
            }}
          >
            <span className="text-sm">📊</span>
            FO DAILY STATEMENT
          </button>

          <button
            className={reportBtnBase}
            onClick={() => {
              setOpen(false);
              navigate("/sUsers/HotelFlashReport");
            }}
          >
            <span className="text-sm">📊</span>
            HOTEL FLASH REPORT
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsMenu;
