/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import TitleDiv from "../../components/common/TitleDiv";
import useFetch from "../../customHook/useFetch";
import { useSelector } from "react-redux";
import { FixedSizeList as List } from "react-window";
import { RiFileExcel2Fill } from "react-icons/ri";
import * as XLSX from "xlsx"; // Import xlsx

function OutstandingSummary() {
  const [summary, setSummary] = useState([]);
  const [listHeight, setListHeight] = useState(500); // Default height
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { data, loading } = useFetch(
    `/api/sUsers/getOutstandingSummary/${cmp_id}`
  );

  useEffect(() => {
    if (data) {
      setSummary(data?.data);
    }
  }, [data, cmp_id]);

  useEffect(() => {
    const updateHeight = () => {
      const titleDiv = document.getElementById("title-div");
      const titleHeight = titleDiv ? titleDiv.offsetHeight : 50;
      const windowHeight = window.innerHeight;
      const availableHeight = windowHeight - titleHeight;
      setListHeight(availableHeight - 50);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const rowData = [];
  summary.forEach((party) => {
    rowData.push({ type: "header", party_name: party.party_name });
    rowData.push(...party.bills.map((bill) => ({ type: "bill", ...bill })));
    rowData.push({
      type: "total",
      total_bill_amount: party.total_bill_amount,
      total_pending_amount: party.total_pending_amount,
      total_final_balance: party.total_final_balance,
    });
  });

  const exportToExcel = () => {
    if (!rowData || rowData.length === 0) {
      window.alert("No data available to export.");
      return;
    }
  
    const excelData = [];
  
    rowData.forEach((row) => {
      if (row.type === "header") {
        excelData.push({
          "Party Name": row.party_name,
          "Bill Date": "",
          "Bill No": "",
          "Bill Amount": "",
          "Pending Amount": "",
          "Post-Dated Amount": "",
          "Final Balance": "",
          "Due Date": "",
          "Age of Bill": "",
        });
      } else if (row.type === "bill") {
        excelData.push({
          "Party Name": "",
          "Bill Date": new Date(row.bill_date).toLocaleDateString(),
          "Bill No": row.bill_no,
          "Bill Amount": row.bill_amount?.toFixed(2),
          "Pending Amount": row.bill_pending_amt?.toFixed(2),
          "Post-Dated Amount": "0.00",
          "Final Balance": row.bill_pending_amt?.toFixed(2),
          "Due Date": new Date(row.bill_due_date).toLocaleDateString(),
          "Age of Bill": `${row.age_of_bill} days`,
        });
      } else if (row.type === "total") {
        excelData.push({
          "Party Name": "Total",
          "Bill Date": "",
          "Bill No": "",
          "Bill Amount": row.total_bill_amount?.toFixed(2),
          "Pending Amount": row.total_pending_amount?.toFixed(2),
          "Post-Dated Amount": "0.00",
          "Final Balance": row.total_final_balance?.toFixed(2),
          "Due Date": "",
          "Age of Bill": "",
        });
      }
    });
  
    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
  
    // Set column widths
    worksheet["!cols"] = [
      { wch: 40 }, // Party Name (More width)
      { wch: 15 }, // Bill Date
      { wch: 15 }, // Bill No
      { wch: 20 }, // Bill Amount
      { wch: 20 }, // Pending Amount
      { wch: 20 }, // Post-Dated Amount
      { wch: 20 }, // Final Balance
      { wch: 15 }, // Due On
      { wch: 15 }, // Age of Bill
    ];
  
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Outstanding Summary");
  
    // Generate and download Excel file
    XLSX.writeFile(workbook, "OutstandingSummary.xlsx");
  };
  

  const Row = ({ index, style }) => {
    const row = rowData[index];

    if (row.type === "header") {
      return (
        <div style={style} className="bg-slate-200 font-bold px-4 py-2 col-span-8">
          {row.party_name}
        </div>
      );
    } else if (row.type === "total") {
      return (
        <div
          style={style}
          className="grid grid-cols-8 border-b border-gray-300 px-4 py-2 bg-gray-100 font-bold"
        >
          <div className="text-left">Total</div>
          <div className="text-left"></div>
          <div className="text-right">{row.total_bill_amount?.toFixed(2) || ""}</div>
          <div className="text-right">{row.total_pending_amount?.toFixed(2) || ""}</div>
          <div className="text-right">0.00</div>
          <div className="text-right">{row.total_final_balance?.toFixed(2) || ""}</div>
          <div className="text-right"></div>
          <div className="text-right"></div>
        </div>
      );
    } else {
      return (
        <div
          style={style}
          className="grid grid-cols-8 border-b border-gray-300 px-4 py-2 hover:bg-gray-50"
        >
          <div className="text-left">
            {new Date(row?.bill_date)?.toLocaleDateString() || ""}
          </div>
          <div className="text-left">{row?.bill_no || ""}</div>
          <div className="text-right">{row?.bill_amount?.toFixed(2) || ""}</div>
          <div className="text-right">{row?.bill_pending_amt?.toFixed(2) || ""}</div>
          <div className="text-right">0.00</div>
          <div className="text-right">{row?.bill_pending_amt?.toFixed(2) || ""}</div>
          <div className="text-right">
            {new Date(row?.bill_due_date)?.toLocaleDateString() || ""}
          </div>
          <div className="text-right">{row?.age_of_bill || ""} days</div>
        </div>
      );
    }
  };

  return (
    <div className="relative">
      <header id="title-div" className="sticky top-0 bg-white z-20 shadow">
        <TitleDiv
          title="Outstanding Summary"
          from="/sUsers/outstanding"
          loading={loading}
          rightSideContent={<RiFileExcel2Fill size={20} />}
          rightSideContentOnClick={exportToExcel}
        />
      </header>

      {!loading && summary.length === 0 && (
        <p className="text-center text-gray-500 mt-20 font-bold">
          No data available.
        </p>
      )}

      {!loading && summary.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-screen border border-gray-300 bg-white text-[6px] sm:text-xs">
            <List height={listHeight} itemCount={rowData.length} itemSize={40} width="100%">
              {Row}
            </List>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutstandingSummary;
