import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart2,
  Coffee,
  ChevronDown,
  LayoutGrid,
  ListChecks,
} from "lucide-react";
import { useSelector } from "react-redux";
import {isAdminUser} from "@/utils/permissions";
const restaurantReports = [
  {
    label: "Daily Sales",
    desc: "Restaurant daily revenue summary",
    icon: BarChart2,
    iconBg: "bg-green-50",
    iconColor: "text-green-700",
    path: "/sUsers/BillSummary?type=restaurant",
    key: "restaurantDailySales",
  },
  {
    label: "Category Wise Sales",
    desc: "Sales grouped by category",
    icon: LayoutGrid,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-700",
    path: "/sUsers/categoryprint",
    key: "categoryWiseSales",
  },
  {
    label: "Item Wise Sales",
    desc: "Breakdown per menu item",
    icon: ListChecks,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    path: "/sUsers/itemwisereport",
    key: "itemWiseSales",
  },
  {
    label: "KOT Register",
    desc: "Breakdown of KOTs",
    icon: BarChart2,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-700",
    path: "/sUsers/register",
    key: "kotRegister",
  },
  {
    label: "Receipt Report",
    desc: "Restaurant receipt report",
    icon: Coffee,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-700",
    path: "/sUsers/Receiptreport?type=restaurant",
    key: "restaurantReceiptReport",
  },
  {
    label: "Sale Register",
    desc: "Restaurant sales register",
    icon: LayoutGrid,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-700",
    path: "/sUsers/sales-register",
    key: "saleRegister",
  },
];

const RestaurantReportsMenu = ({ showOptions, setShowOptions }) => {
  const secUserData = JSON.parse(localStorage.getItem("sUserData"));
  const isAdmin = isAdminUser(secUserData);
  console.log(isAdmin);
  const navigate = useNavigate();

  const permissions = useSelector((state) => state.permissionData?.permissions);

 const filteredReports = isAdmin
  ? restaurantReports
  : restaurantReports.filter(
      (report) => permissions?.[report.key] === true,
    );



 if (
  !showOptions ||
  (!isAdmin && filteredReports.length === 0)
) {
  return null;
}

  return (
    <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-y-auto max-h-96">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
          <Coffee className="w-3.5 h-3.5 text-orange-700" />
        </div>

        <div>
          <p className="text-xs font-bold text-gray-800 tracking-wide uppercase">
            Restaurant Reports
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {filteredReports.length} report types available
          </p>
        </div>
      </div>

      {/* Report List */}
      <div className="p-1.5">
        {filteredReports.map((report) => {
          const Icon = report.icon;

          return (
            <button
              key={report.key}
              onClick={() => {
                setShowOptions(false);
                navigate(report.path);
              }}
              className="group flex items-center gap-3 w-full px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className={`w-8 h-8 rounded-lg ${report.iconBg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-3.5 h-3.5 ${report.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800">
                  {report.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {report.desc}
                </p>
              </div>

              <ChevronDown className="w-3 h-3 text-gray-300 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RestaurantReportsMenu;
