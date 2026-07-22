/* eslint-disable react/no-unknown-property */
import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import printJS from "print-js";
import SelectDate from "../../../components/Filters/SelectDate";
import VoucherTypeFilter from "../../../components/Filters/VoucherTypeFilter";
import useFetch from "../../../customHook/useFetch";
import TransactionTable from "../../../components/common/List/TranscationTable";
import TitleDiv from "../../../components/common/TitleDiv";
import { BarLoader } from "react-spinners";
import SecondaryUserFilter from "@/components/Filters/SecondaryUserFilter";
import { Search } from "lucide-react";
import * as XLSX from "xlsx";
function Transaction() {
  const [netCashInHands, setNetCashInHands] = useState(0);

  const [effectiveDates, setEffectiveDates] = useState({
    start: null,
    end: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation(); // Hook to access passed state
  const dispatch = useDispatch();
  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg,
  );
  const { start: reduxStart, end: reduxEnd } = useSelector(
    (state) => state.date,
  );
  const selectedVoucher = useSelector(
    (state) => state?.voucherType?.selectedVoucher,
  );
  const selectedSecondaryUser = useSelector(
    (state) => state?.userFilter?.selectedUser,
  );

  console.log(selectedSecondaryUser);

  useEffect(() => {
    if (
      location.state?.fromSummary &&
      location.state?.startDate &&
      location.state?.endDate
    ) {
      // Coming from Summary Report - use month-specific dates
      setEffectiveDates({
        start: location.state.startDate,
        end: location.state.endDate,
      });
    } else {
      // Normal view - use Redux dates
      setEffectiveDates({
        start: reduxStart,
        end: reduxEnd,
      });
    }
  }, [location.state, reduxStart, reduxEnd]);

  const isAdmin =
    JSON.parse(localStorage.getItem("sUserData")).role === "admin"
      ? true
      : false;

  const transactionsUrl = useMemo(
    () =>
      effectiveDates.start && effectiveDates.end
        ? `/api/sUsers/transactions/${
            org?._id
          }?startOfDayParam=${effectiveDates.start}&endOfDayParam=${effectiveDates.end}&selectedVoucher=${
            selectedVoucher?.value
          }&isAdmin=${isAdmin}&selectedSecondaryUser=${
            selectedSecondaryUser?._id || ""
          }&searchTerm=${encodeURIComponent(searchTerm || "")}`
        : null,
    [
      org?._id,
      effectiveDates.start,
      effectiveDates.end,
      selectedVoucher,
      selectedSecondaryUser,
      isAdmin,
      searchTerm,
    ],
  );
  // Fetch data using custom hook
  const { data: transactionData, loading: transactionLoading } =
    useFetch(transactionsUrl);

  const getDifference = (difference) => {
    setNetCashInHands(difference);
  };

  const rows = transactionData?.data?.combined || [];

  const exportData = rows.map((item) => ({
    Voucher_No: item?.voucherNumber || "",
    Date: item?.date ? new Date(item.date).toLocaleDateString("en-GB") : "",
    Party: item?.party_name || "",
    Type: item?.type || "",
    Created_By: item?.secondaryUserName || "",
    Amount: item?.enteredAmount || 0,
  }));

  const totalAmount = rows.reduce(
    (sum, item) => sum + (item?.enteredAmount || 0),
    0,
  );

  const handleExportExcel = () => {
    const excelData = [
      ...exportData,
      {
        Voucher_No: "",
        Date: "",
        Party: "",
        Type: "",
        Created_By: "Total",
        Amount: totalAmount,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daybook");
    XLSX.writeFile(
      workbook,
      `daybook_${effectiveDates.start}_${effectiveDates.end}.xlsx`,
    );
  };
  const handlePrint = () => {
    printJS({
      printable: "print-section",
      type: "html",
      scanStyles: false,
      targetStyles: ["*"],
      documentTitle: `Daybook_${effectiveDates.start || ""}_${effectiveDates.end || ""}`,
      header: `
      <div style="text-align:center; margin-bottom:16px;">
        <h2 style="margin:0; font-size:20px;">${org?.name || org?.organizationName || "Organization"}</h2>
        <p style="margin:4px 0; font-size:14px;">Daybook</p>
        <p style="margin:4px 0; font-size:12px;">
          Period: ${
            effectiveDates.start
              ? new Date(effectiveDates.start).toLocaleDateString("en-GB")
              : ""
          } - ${
            effectiveDates.end
              ? new Date(effectiveDates.end).toLocaleDateString("en-GB")
              : ""
          }
        </p>
        <p style="margin:4px 0; font-size:12px;">
          Voucher: ${selectedVoucher?.label || "All"} |
          User: ${
            selectedSecondaryUser?.secondaryUserName ||
            selectedSecondaryUser?.name ||
            "All"
          } |
          Search: ${searchTerm || "None"}
        </p>
      </div>
    `,
style: `
  @page {
    size: A4 portrait;
    margin: 14mm;
  }

  @page :first {
    size: A4 portrait;
    margin: 0mm;
  }

  body {
    font-family: Arial, sans-serif;
    color: #1f2937;
    font-size: 12px;
  }

  #print-section {
    width: 100%;
  }

  .print-first-page {
    padding: 12mm;
  }

  .print-other-pages {
    padding: 0;
  }

  .print-page {
    margin-bottom: 12mm;
    break-after: page;
    page-break-after: always;
  }

  .print-page:last-child {
    margin-bottom: 0;
    break-after: auto;
    page-break-after: auto;
  }

  .no-break {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  #print-section table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  #print-section thead tr {
    background-color: #f3f4f6;
  }

  #print-section th,
  #print-section td {
    border: 1px solid #d1d5db;
    padding: 8px;
  }

  #print-section th {
    font-size: 12px;
    font-weight: 700;
    text-align: left;
    color: #111827;
  }

  #print-section td {
    font-size: 11px;
    color: #374151;
  }

  #print-section td:last-child,
  #print-section th:last-child {
    text-align: right;
  }

  #print-section tr:last-child td {
    font-weight: 700;
    background-color: #f9fafb;
  }
`
    });
  };

  return (
    <div className="flex-1">
      <div className=" flex-1   ">
        <div className="sticky top-0 flex flex-col z-30 bg-white">
          <TitleDiv title="Daybook" />

          <section className="shadow-lg">
            <SelectDate />
          </section>

          <section className="shadow-lg">
            <VoucherTypeFilter />
          </section>

          <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:px-4 sm:py-3">
            <div className="w-full sm:w-auto">
              {isAdmin && <SecondaryUserFilter />}
            </div>

            <p className="whitespace-nowrap text-sm font-medium text-gray-600 sm:flex-1">
              Net Cash In Hand :
              <span className="ml-2 font-semibold text-gray-900">
                {transactionLoading ? "Loading..." : netCashInHands || 0}
              </span>
            </p>

            <div className="w-full sm:ml-auto sm:w-auto">
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-gray-50 pl-10 pr-3 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={16} />
                  </span>
                </div>

                <button
                  onClick={handleExportExcel}
                  disabled={
                    transactionLoading ||
                    !transactionData?.data?.combined?.length
                  }
                  className="h-10 w-full rounded-md bg-green-600 px-4 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Export Excel
                </button>
                <button
                  onClick={handlePrint}
                  disabled={
                    transactionLoading ||
                    !transactionData?.data?.combined?.length
                  }
                  className="h-10 w-full rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Print
                </button>
              </div>
            </div>
          </section>

          {transactionLoading && (
            <section className="w-full">
              <BarLoader color="#9900ff" width="100%" />
            </section>
          )}

          <table className="w-full border-collapse mt-2  ">
            <thead className={`sticky top-0 bg-white z-10`}>
              <tr className="bg-gray-100 text-gray-500 text-xs">
                <th className="text-left p-3 border-b w-1/2">Transaction</th>
                <th className="text-right p-3 border-b w-1/4">Amount</th>
                <th className="text-right p-3 border-b w-1/4">Money In/Out</th>
              </tr>
            </thead>
          </table>
        </div>

        <TransactionTable
          transactionData={transactionData?.data?.combined}
          getDifference={getDifference}
          loading={transactionLoading}
        />
      </div>
  <div style={{ height: 0, overflow: "hidden" }}>
  <div id="print-section">
    <div className="print-page print-first-page">
      <table>
        <thead>
          <tr>
            <th>Voucher No</th>
            <th>Date</th>
            <th>Party</th>
            <th>Type</th>
            <th>Created By</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {exportData.map((item, index) => (
            <tr key={index} className="no-break">
              <td>{item.Voucher_No}</td>
              <td>{item.Date}</td>
              <td>{item.Party}</td>
              <td>{item.Type}</td>
              <td>{item.Created_By}</td>
              <td>{item.Amount}</td>
            </tr>
          ))}
          <tr className="no-break">
            <td colSpan={5}>Total</td>
            <td>{totalAmount}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
    </div>
  );
}

export default Transaction;
