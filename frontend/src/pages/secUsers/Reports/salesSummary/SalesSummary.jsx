import  { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import TitleDiv from "../../../../components/common/TitleDiv";
import SummmaryDropdown from "../../../../components/Filters/SummaryDropdown";
import SelectDate from "../../../../components/Filters/SelectDate";
import useFetch from "../../../../customHook/useFetch";

const SalesSummary = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [processedSummary, setProcessedSummary] = useState([]);
  const navigate = useNavigate();
  
  const { start, end } = useSelector((state) => state.date);
  const cmp_id = useSelector((state) => state.secSelectedOrganization.secSelectedOrg._id);
  const selectedOption = useSelector((state) => state.summaryFilter.selectedOption);

  // Memoize API URL construction
  const salesSummaryUrl = useMemo(() => {
    if (!start || !end || !cmp_id) return null;
    return `/api/sUsers/salesSummary/${cmp_id}?startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=sale`;
  }, [start, end, cmp_id]);

  // Fetch data using custom hook
  const { data: salesSummaryData, loading } = useFetch(salesSummaryUrl);

  // Update summary data when API response changes
  useEffect(() => {
    if (salesSummaryData?.flattenedResults) {
      setSummaryData(salesSummaryData.flattenedResults);
    }
  }, [salesSummaryData]);

  // Calculate totals based on selected option
  useEffect(() => {
    const calculateTotals = () => {
      if (!summaryData.length) return [];
  
      const totals = new Map();
  
      if (selectedOption === "Ledger") {
        summaryData.forEach((item) => {
          if (!item.party?._id) return;
          const partyName = item.party.partyName;
          const currentTotal = totals.get(partyName) || 0;
          totals.set(partyName, currentTotal + (Number(item.finalAmount) || 0));
        });
      } else if (selectedOption === "Stock Item") {
        summaryData.forEach((item) => {
          item.items?.forEach((it) => {
            if (!it.product_name) return;
            const currentTotal = totals.get(it.product_name) || 0;
            totals.set(it.product_name, currentTotal + (it.total || 0));
          });
        });
      } 
      
      else if (selectedOption === "Stock Group") {
        summaryData.forEach((item) => {
          item.items?.forEach((h) => {
            if (!h?.brand?._id) return;
            const groupName = h.brand.name;
            const currentTotal = totals.get(groupName) || 0;
      
            // Add the total of the item itself
            const itemTotal = h.total || 0;
      
            totals.set(groupName, currentTotal + itemTotal);
          });
        });
      }
      else if (selectedOption === "Stock Category") {
        summaryData.forEach((item) => {
          item.items?.forEach((h) => {
            if (!h?.category?._id) return;
            const categoryName = h.category.name;
            const currentTotal = totals.get(categoryName) || 0;
      
            // Add the total of the item itself
            const itemTotal = h.total || 0;
      
            totals.set(categoryName, currentTotal + itemTotal);
          });
        });
      }
      return Array.from(totals).map(([name, total]) => ({ name, total }));
    };
  
    setProcessedSummary(calculateTotals());
  }, [summaryData, selectedOption]);
  

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return processedSummary.reduce((sum, item) => sum + item.total, 0);
  }, [processedSummary]);

  const handleNavigate = () => {
    navigate("/sUsers/salesSummaryDetails", {
      state: { summary: summaryData },
    });
  };

  console.log(summaryData);
  console.log(processedSummary);
  

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50">
        <TitleDiv title="Sales Summary" from="/sUsers/reports" />
        <section className="shadow-lg border-b">
          <SelectDate />
        </section>

        {loading && (
          <section className="w-full">
            <BarLoader color="#9900ff" width="100%" />
          </section>
        )}

        <div className="bg-[#219ebc] flex flex-col pb-11 shadow-xl justify-center pt-2 px-2">
          <SummmaryDropdown bgColor="#219ebc" textColor="#fff" />

          <div className="text-center text-white flex justify-center items-center flex-col mt-5">
            <h2 className="text-3xl sm:text-4xl font-bold">
              ₹{totalAmount.toLocaleString()}
            </h2>
            <p className="text-sm mt-4 font-semibold opacity-90">
              {new Date(start).toLocaleDateString()} -{" "}
              {new Date(end).toLocaleDateString()}
            </p>
            <button
              onClick={handleNavigate}
              className="text-xs mt-4 font-bold opacity-90 underline hover:scale-105 transition-transform duration-300"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      
      <div className="flex-1 p-4">
        {!loading && processedSummary.length === 0 && (
          <p className="text-gray-500 text-center font-bold mt-20">
            No data found
          </p>
        )}

        {processedSummary.length > 0 && (
          <div className="space-y-2">
            {processedSummary.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 py-6 bg-white shadow-md rounded-base cursor-pointer hover:-translate-y-0.5 transition-transform duration-300"
              >
                <span className="text-gray-800 font-medium">{item.name}</span>
                <span className="text-gray-600 font-semibold">
                  ₹{item.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesSummary;