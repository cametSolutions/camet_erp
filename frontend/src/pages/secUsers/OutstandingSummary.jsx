import { useEffect, useState } from "react";
import TitleDiv from "../../components/common/TitleDiv";
import useFetch from "../../customHook/useFetch";
import { useSelector } from "react-redux";
import { FixedSizeList as List } from "react-window";
import { RiFileExcel2Fill } from "react-icons/ri";
import * as XLSX from "xlsx";
import SearchBar from "../../components/common/SearchBar";

function OutstandingSummary() {
  const [summary, setSummary] = useState([]);
  const [listHeight, setListHeight] = useState(500);
  const [search, setSearch] = useState("");
  const [filteredSummary, setFilteredSummary] = useState([]);

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

  // Rest of the useEffect hooks remain the same...

  useEffect(() => {
    const filtered = summary.filter((party) =>
      party.party_name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredSummary(filtered);
  }, [search, summary]);

  const calculatePartyTotals = (bills) => {
    return bills.reduce(
      (acc, bill) => {
        const amount = parseFloat(bill.bill_amount || 0);
        const pendingAmount = parseFloat(bill.bill_pending_amt || 0);
        
        if (bill.classification === "Dr") {
          acc.totalBillAmount += amount;
          acc.totalPendingAmount += pendingAmount;
        } else if (bill.classification === "Cr") {
          acc.totalBillAmount -= amount;
          acc.totalPendingAmount -= pendingAmount;
        }
        
        return acc;
      },
      { totalBillAmount: 0, totalPendingAmount: 0 }
    );
  };

  const rowData = [];
  filteredSummary.forEach((party) => {
    rowData.push({ type: "header", party_name: party.party_name });
    rowData.push(...party.bills.map((bill) => ({ type: "bill", ...bill })));
    
    const totals = calculatePartyTotals(party.bills);
    rowData.push({
      type: "total",
      total_bill_amount: totals.totalBillAmount,
      total_pending_amount: totals.totalPendingAmount,
      total_final_balance: totals.totalPendingAmount, // Final balance is same as pending after Dr/Cr calculation
      classification: totals.totalPendingAmount >= 0 ? "Dr" : "Cr"
    });
  });

  const Row = ({ index, style }) => {
    const row = rowData[index];

    if (row.type === "header") {
      return (
        <div
          style={style}
          className="bg-slate-200 font-bold px-4 py-2 col-span-8"
        >
          {row.party_name}
        </div>
      );
    } else if (row.type === "total") {
      const classification = row.classification;
      const displayAmount = (amount) => {
        const absAmount = Math.abs(amount).toFixed(2);
        return `${absAmount} ${classification}`;
      };

      return (
        <div
          style={style}
          className="grid grid-cols-8 border-b border-gray-300 px-4 py-2 bg-gray-100 font-bold"
        >
          <div className="text-left">Total</div>
          <div className="text-left"></div>
          <div className="text-right">
            {displayAmount(row.total_bill_amount)}
          </div>
          <div className="text-right">
            {displayAmount(row.total_pending_amount)}
          </div>
          <div className="text-right">0.00</div>
          <div className="text-right">
            {displayAmount(row.total_final_balance)}
          </div>
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
          <div className="text-right">
            {row?.bill_amount?.toFixed(2) || ""} {row?.classification}
          </div>
          <div className="text-right">
            {row?.bill_pending_amt?.toFixed(2) || ""} {row?.classification}
          </div>
          <div className="text-right">0.00</div>
          <div className="text-right">
            {row?.bill_pending_amt?.toFixed(2) || ""} {row?.classification}
          </div>
          <div className="text-right">
            {new Date(row?.bill_due_date)?.toLocaleDateString() || ""}
          </div>
          <div className="text-right">{row?.age_of_bill || ""} days</div>
        </div>
      );
    }
  };

  // Export to Excel function modified to handle Dr/Cr
  const exportToExcel = () => {
    try {
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
            "Bill Amount": `${row.bill_amount?.toFixed(2) || ""} ${row.classification}`,
            "Pending Amount": `${row.bill_pending_amt?.toFixed(2) || ""} ${row.classification}`,
            "Post-Dated Amount": "0.00",
            "Final Balance": `${row.bill_pending_amt?.toFixed(2) || ""} ${row.classification}`,
            "Due Date": new Date(row.bill_due_date).toLocaleDateString(),
            "Age of Bill": `${row.age_of_bill} days`,
          });
        } else if (row.type === "total") {
          excelData.push({
            "Party Name": "Total",
            "Bill Date": "",
            "Bill No": "",
            "Bill Amount": `${Math.abs(row.total_bill_amount)?.toFixed(2)} ${row.classification}`,
            "Pending Amount": `${Math.abs(row.total_pending_amount)?.toFixed(2)} ${row.classification}`,
            "Post-Dated Amount": "0.00",
            "Final Balance": `${Math.abs(row.total_final_balance)?.toFixed(2)} ${row.classification}`,
            "Due Date": "",
            "Age of Bill": "",
          });
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = [
        { wch: 40 }, // Party Name
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
      XLSX.writeFile(workbook, "OutstandingSummary.xlsx");
    } catch (error) {
      window.alert(`An error occurred while exporting: ${error.message}`);
      console.error("Export Error:", error);
    }
  };

  // SearchBar and return statement remain the same...
  const searchData = (data) => {
    setSearch(data);
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
        <SearchBar onType={searchData} />
      </header>

      {!loading && filteredSummary.length === 0 && (
        <p className="text-center text-gray-500 mt-20 font-bold">
          No data available.
        </p>
      )}

      {!loading && filteredSummary.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-screen border border-gray-300 bg-white text-[6px] sm:text-xs">
            <div className="relative">
              <div className="grid grid-cols-8 bg-gray-300 font-bold p-4 sticky top-10 z-10">
                <div className="text-left">Bill Date</div>
                <div className="text-left">Bill No</div>
                <div className="text-right">Bill Amount</div>
                <div className="text-right">Pending Amount</div>
                <div className="text-right">Post-Dated Amount</div>
                <div className="text-right">Final Balance</div>
                <div className="text-right">Due on</div>
                <div className="text-right">Age of bill</div>
              </div>
            </div>
            <List
              height={listHeight}
              itemCount={rowData.length}
              itemSize={40}
              width="100%"
            >
              {Row}
            </List>
          </div>
        </div>
      )}
    </div>
  );
}

export default OutstandingSummary;