/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import TitleDiv from "../../components/common/TitleDiv";
import useFetch from "../../customHook/useFetch";
import { useSelector } from "react-redux";
import { FixedSizeList as List } from "react-window";

function OutstandingSummary() {
  const [summary, setSummary] = useState([]);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { data, loading, error } = useFetch(
    `/api/sUsers/getOutstandingSummary/${cmp_id}`
  );

  useEffect(() => {
    if (data) {
      setSummary(data?.data);
    }
  }, [data, cmp_id]);

  // Flatten the summary for react-window
  const rowData = [];
  summary.forEach((party) => {
    rowData.push({ type: "header", party_name: party.party_name });
    rowData.push(...party.bills.map((bill) => ({ type: "bill", ...bill })));
  });

  const Row = ({ index, style }) => {
    const row = rowData[index];

    return row.type === "header" ? (
      <div style={style} className="bg-gray-200 font-bold px-4 py-2 col-span-8">
        {row.party_name}
      </div>
    ) : (
      <div
        style={style}
        className="grid grid-cols-8 border-b border-gray-300 px-4 py-2 hover:bg-gray-50"
      >
        <div className="text-left">
          {new Date(row?.bill_date)?.toLocaleDateString() || ""}
        </div>
        <div className="text-left">{row?.bill_no || ""}</div>
        <div className="text-right">{row?.bill_amount?.toFixed(2) || ""}</div>
        <div className="text-right">
          {row?.bill_pending_amt?.toFixed(2) || ""}
        </div>
        <div className="text-right">0.00</div>{" "}
        {/* Placeholder for Post-Dated Amount */}
        <div className="text-right">
          {row?.bill_pending_amt?.toFixed(2) || ""}
        </div>
        <div className="text-right">
          {new Date(row?.bill_due_date)?.toLocaleDateString() || ""}
        </div>
        <div className="text-right">{row?.age_of_bill || ""} days</div>{" "}
        {/* Display age as days */}
      </div>
    );
  };

  return (
    <div className="relative  ">
      {/* Sticky Title */}
      <header className="sticky top-0 bg-white z-20 shadow">
        <TitleDiv
          title="Outstanding Summary"
          from="/sUsers/outstanding"
          loading={loading}
        />
      </header>

      {/* {error && <p className="text-center text-red-500">Error: {error}</p>} */}

      {!loading && summary.length === 0 && (
        <p className="text-center text-gray-500 mt-20 font-bold">No data available.</p>
      )}

      {!loading && summary.length > 0 && (
        <div className="overflow-x-auto">
          
        <div className="min-w-screen border border-gray-300 bg-white text-xs">
          {/* Sticky Table Head */}
          <div className="relative">
            <div className="grid grid-cols-8 bg-gray-100 font-bold px-4 py-2 sticky top-10 z-10">
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

          {/* Virtualized List */}
          <List
            height={491} // Adjust height as needed
            itemCount={rowData.length}
            itemSize={40} // Row height
            width="100%"
          >
            {Row}
          </List>
        </div>
        </div>
      )}

      {/* Scrollable Table Wrapper */}
    </div>
  );
}

export default OutstandingSummary;
