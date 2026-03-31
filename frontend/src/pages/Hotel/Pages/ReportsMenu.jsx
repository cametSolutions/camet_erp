import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart2, FileText, Zap, Users, Coffee, Home, ChevronDown, LayoutGrid,
} from "lucide-react";

const reports = [
  {
    label: "Daily Sales",
    desc: "Hotel daily revenue summary",
    icon: BarChart2,
    iconBg: "bg-green-50",
    iconColor: "text-green-700",
    path: "/sUsers/BillSummary?type=hotel",
  },
  {
    label: "FO Daily Statement",
    desc: "Front office daily report",
    icon: FileText,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    path: "/sUsers/Checkoutpdf",
  },
  {
    label: "Flash Report",
    desc: "Quick hotel performance snapshot",
    icon: Zap,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
    path: "/sUsers/HotelFlashReport",
    dividerAfter: false,
  },
  {
    label: "Pax Report",
    desc: "Tourist & guest statistics",
    icon: Users,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-700",
    path: "/sUsers/tourist-report",
    dividerBefore: true,
  },
  {
    label: "Food Plan Report",
    desc: "Meal plan breakdown",
    icon: Coffee,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-700",
    path: "/sUsers/foodplan-report",
  },
  {
    label: "Occupancy Report",
    desc: "Room occupancy & checkout",
    icon: Home,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-700",
    path: "/sUsers/occupancy-checkout-report",
  },
];

const ReportsMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 
                   bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold 
                   transition-colors shadow-sm"
      >
        <LayoutGrid className="w-3.5 h-3.5 text-gray-500" />
        Reports
        <ChevronDown
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 
                      ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-1.5 w-64 bg-white border border-gray-200 
                        rounded-xl shadow-xl z-30 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-gray-100">
            <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
              <BarChart2 className="w-3.5 h-3.5 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800 tracking-wide uppercase">
                Hotel Reports
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {reports.length} report types available
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="p-1.5">
            {reports.map((r, i) => {
              const Icon = r.icon;
              return (
                <React.Fragment key={r.path}>
                  {r.dividerBefore && (
                    <div className="my-1 border-t border-gray-100" />
                  )}
                  <button
                    onClick={() => { setOpen(false); navigate(r.path); }}
                    className="group flex items-center gap-3 w-full px-2.5 py-2 
                               rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg ${r.iconBg} flex items-center 
                                    justify-center flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${r.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800">{r.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{r.desc}</p>
                    </div>
                    <ChevronDown className="w-3 h-3 text-gray-300 -rotate-90 
                                           opacity-0 group-hover:opacity-100 
                                           transition-opacity flex-shrink-0" />
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsMenu;