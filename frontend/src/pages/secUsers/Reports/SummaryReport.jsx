import { useLocation, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useMemo, useState } from "react"
import { CiBookmark ,CiGrid31} from "react-icons/ci";
import { startOfYear, endOfYear, format } from "date-fns" 
import { startOfMonth, endOfMonth } from "date-fns"; // Ensure these are imported
import { BarLoader } from "react-spinners"
import TitleDiv from "@/components/common/TitleDiv"
import SummaryDropdown from "@/components/Filters/SummaryDropdown"
import SelectDate from "@/components/Filters/SelectDate"
import VoucherTypeFilter from "@/components/Filters/VoucherTypeFilter"
import { setSelectedVoucher } from "../../../.././slices/filterSlices/voucherType"
import { setSelectedSerialNumber } from "../../../.././slices/filterSlices/serialNumberFilter"
import DashboardTransaction from "@/components/common/DashboardTransaction"
import api from "@/api/api"

export default function SummaryReport() {
  const [processedSummary, setProcessedSummary] = useState([])
  const [voucherSum, setVocherSum] = useState(0)
  // State for Year Selection
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { summaryType } = location.state
  
  // Redux selectors
  const { start: reduxStart, end: reduxEnd } = useSelector((state) => state.date)
  const selectedSecondaryUser = useSelector((state) => state?.userFilter?.selectedUser)
  const voucherType = useSelector((state) => state.voucherType.selectedVoucher)
  const serialNumber = useSelector((state) => state.serialNumber.selectedSerialNumber)
  const cmp_id = useSelector((state) => state.secSelectedOrganization.secSelectedOrg._id)
  const selectedOption = useSelector((state) => state.summaryFilter.selectedOption)

  const isAdmin = JSON.parse(localStorage.getItem("sUserData")).role === "admin"

  // Generate list of last 5 years
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  // Determine effective Date Range based on "MonthWise" selection
  const isMonthWise = selectedOption === "MonthWise"
  
  const effectiveStart = isMonthWise 
    ? startOfYear(new Date(selectedYear, 0, 1)).toISOString()
    : reduxStart
    
  const effectiveEnd = isMonthWise 
    ? endOfYear(new Date(selectedYear, 0, 1)).toISOString()
    : reduxEnd

  let filterKeys = []
  if (summaryType?.toLowerCase().includes("sale")) {
    filterKeys = ["allType", "sale", "vanSale", "creditNote"]
  } else if (summaryType?.toLowerCase().includes("purchase")) {
    filterKeys = ["allType", "purchase", "debitNote"]
  } else if (summaryType.toLowerCase().includes("order")) {
    filterKeys = ["saleOrder"]
  }

  useEffect(() => {
    if (voucherType.title === "All Vouchers") {
      if (summaryType === "Sales Summary" || summaryType === "Purchase Summary") {
        dispatch(setSelectedVoucher({ title: "All", value: "allType" }))
      } else if (summaryType === "Order Summary") {
        dispatch(setSelectedVoucher({ title: "Sale Order", value: "saleOrder" }))
      }
    }
  }, [])

  const { data: voucherwisesummary = [], isFetching: voucherFetching } = useQuery({
    queryKey: [
      "voucherSummary",
      cmp_id,
      voucherType.value,
      effectiveStart,
      effectiveEnd,
      serialNumber.value,
      summaryType,
    ],
    queryFn: async () => {
      const res = await api.get(
        `/api/sUsers/transactions/${cmp_id}?startOfDayParam=${effectiveStart}&endOfDayParam=${effectiveEnd}&selectedVoucher=${
          voucherType?.value
        }&isAdmin=${isAdmin}&selectedSecondaryUser=${
          selectedSecondaryUser?._id || ""
        }&summaryType=${summaryType}&serialNumber=${serialNumber.value}`,
        { withCredentials: true }
      )
      return res.data
    },
    enabled:
      !!cmp_id &&
      !!voucherType.value &&
      voucherType.title !== "All Vouchers" &&
      selectedOption === "voucher",
    staleTime: 30000,
    retry: false
  })

  const { data: serialNumberList } = useQuery({
    queryKey: ["serialNumbers", cmp_id, voucherType.value],
    queryFn: async () => {
      const res = await api.get(
        `/api/sUsers/getSeriesByVoucher/${cmp_id}?voucherType=${voucherType.value}`,
        { withCredentials: true }
      )
      return res.data
    },
    enabled: !!cmp_id && !!voucherType.value && voucherType.title !== "All Vouchers",
    staleTime: 30000,
    retry: false
  })

  const queryKey = [
    "summaryReport",
    {
      start: effectiveStart,
      end: effectiveEnd,
      voucherValue: voucherType?.value,
      serialNumberValue: serialNumber?.value,
      selectedOption,
      summaryType,
      cmp_id
    }
  ]

  const isQueryReady =
    !!cmp_id &&
    !!effectiveStart &&
    !!effectiveEnd &&
    !!voucherType?.title &&
    voucherType.title !== "All Vouchers" &&
    !!summaryType &&
    !!selectedOption &&
    selectedOption !== "voucher" &&
    !!serialNumber

  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const res = await api.get(`/api/sUsers/summaryReport/${cmp_id}`, {
          params: {
            start: effectiveStart,
            end: effectiveEnd,
            voucherType: voucherType?.value,
            selectedOption,
            summaryType,
            serialNumber: serialNumber?.value
          },
          withCredentials: true
        })
        return res.data
      } catch (error) {
        if (error.response?.status === 404) {
          return { flattenedResults: [] }
        }
        throw error
      }
    },
    enabled: isQueryReady,
    staleTime: 30000,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  })

  // Calculation logic for Voucher Type view
  useEffect(() => {
    if (voucherwisesummary && voucherwisesummary?.data?.combined?.length > 0) {
      const { incomeSum, expenseSum } = voucherwisesummary.data.combined.reduce(
        (acc, txn) => {
          const type = txn.type.toLowerCase()
          const amt = Number(txn.enteredAmount) || 0
          if (type === "credit note" || type === "debit note") {
            acc.expenseSum += amt
          } else {
            acc.incomeSum += amt
          }
          return acc
        },
        { incomeSum: 0, expenseSum: 0 }
      )
      const finalNet =
        summaryType === "Sales Summary"
          ? incomeSum - expenseSum
          : summaryType === "Purchase Summary"
          ? expenseSum - incomeSum
          : incomeSum
      setVocherSum(finalNet)
    } else {
      setVocherSum(0)
    }
  }, [voucherwisesummary])

  // Process data for Ledger/Stock/MonthWise view
  // Process data for Ledger/Stock/MonthWise view
  useEffect(() => {
    // 1. HANDLE MONTHWISE VIEW (Always show 12 months)
    if (selectedOption === "MonthWise") {
      const allMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      // Initialize a map with 0 values for all 12 months
      const monthMap = new Map();
      allMonths.forEach((month) => {
        monthMap.set(month, {
          name: month,
          debitSum: 0,
          creditSum: 0,
          sourceTypes: new Set(),
        });
      });

      // Merge backend data if it exists
      const summary = data?.flattenedResults || [];
      for (const item of summary) {
        // Ensure the month name from backend matches our list (case-sensitive check if needed)
        if (monthMap.has(item.name)) {
          const acc = monthMap.get(item.name);
          if (item.isCredit) {
            acc.creditSum += (item.total || 0);
          } else {
            acc.debitSum += (item.total || 0);
          }
          acc.sourceTypes.add(item.sourceType);
        }
      }

      // Convert map to array ensuring Jan-Dec order
      const result = allMonths.map((monthName) => {
        const acc = monthMap.get(monthName);
        return {
          name: acc.name,
          total: acc.debitSum,
          credit: acc.creditSum,
          net:
            summaryType === "Sales Summary"
              ? acc.debitSum - acc.creditSum
              : summaryType === "Purchase Summary"
              ? acc.creditSum - acc.debitSum
              : acc.debitSum,
          sourceType: Array.from(acc.sourceTypes),
          transactions: [], // MonthWise usually doesn't show transaction list details
        };
      });

      setProcessedSummary(result);
    } 
    
    // 2. HANDLE STANDARD VIEWS (Ledger, Stock Item, etc.)
    else if (data) {
      const summary = data?.flattenedResults || [];
      const map = new Map();
      
      for (const item of summary) {
        const key = item.name;
        if (!map.has(key)) {
          map.set(key, {
            name: key,
            debitSum: 0,
            creditSum: 0,
            transactions: [],
            sourceTypes: new Set(),
          });
        }

        const acc = map.get(key);

        if (item.isCredit) {
          acc.creditSum += item.total;
        } else {
          acc.debitSum += item.total;
        }

        if (item.transactions) acc.transactions.push(...item.transactions);
        acc.sourceTypes.add(item.sourceType);
      }

      const result = Array.from(map.values()).map((acc) => ({
        name: acc.name,
        total: acc.debitSum,
        credit: acc.creditSum,
        net:
          summaryType === "Sales Summary"
            ? acc.debitSum - acc.creditSum
            : summaryType === "Purchase Summary"
            ? acc.creditSum - acc.debitSum
            : acc.debitSum,
        sourceType: Array.from(acc.sourceTypes),
        transactions: acc.transactions,
      }));
      
      setProcessedSummary(result);
    }
  }, [data, selectedOption, summaryType]);
// Add selectedOption dependency

  const totalAmount = useMemo(() => {
    return (
      processedSummary?.reduce(
        (sum, item) => sum + Number(item.net),
        0
      ) ?? 0
    )
  }, [processedSummary])

  const handleNavigate = () => {
    navigate("/sUsers/salesSummaryDetails", {
      state: { summaryType, serialNumber: serialNumber.value, serialNumberList }
    })
  }
  
    // Replace your handleMonthClick function with this:
const handleMonthClick = (item, actionType) => {
  if (selectedOption === "MonthWise") {
    const monthIndexMap = {
      "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
      "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
    };
    
    const monthIndex = monthIndexMap[item.name];
    const startDate = new Date(selectedYear, monthIndex, 1);
    const endDate = new Date(selectedYear, monthIndex + 1, 0);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (actionType === "daybook") {
      // 🚀 DAYBOOK BUTTON - Go to /sUsers/transaction (sales only)
      navigate("/sUsers/transaction", { 
        state: { 
          fromSummary: true,
          summaryType,  // "Sales Summary"
          voucherType: voucherType.value,  // "sale" or "allType"
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          title: `${item.name} ${selectedYear}`
        } 
      });
    } else if (actionType === "details") {
      // 📊 DETAILS BUTTON - Go to /sUsers/salesSummaryDetails (month-specific)
      navigate("/sUsers/salesSummaryDetails", {
        state: { 
          summaryType,
          selectedOption,  // "Ledger", "Stock Item", etc.
          monthStart: startDate.toISOString(),
          monthEnd: endDate.toISOString(),
          monthTitle: `${item.name} ${selectedYear}`,
          voucherType: voucherType.value,
          serialNumber: serialNumber.value
        }
      });
    }
  }
};
// Add this helper function at top of component (before return)


  


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50">
        <TitleDiv title={summaryType} from="/sUsers/reports" />
        
        {/* Hide Date Range Picker if MonthWise is selected */}
        {!isMonthWise && (
            <section className="shadow-lg border-b">
            <SelectDate />
            </section>
        )}

        <section className="shadow-lg bg-white">
          <VoucherTypeFilter filterKeys={filterKeys} />
        </section>

        {(isFetching || voucherFetching) && (
          <section className="w-full">
            <BarLoader color="#9900ff" width="100%" />
          </section>
        )}

        <div className="bg-[#219ebc] flex flex-col pb-11 shadow-xl justify-center pt-2 px-2">
          <div className="flex justify-between items-center px-2">
            
            <div className="flex gap-2">
                <section className="shadow-xl rounded-lg">
                <SummaryDropdown
                    bgColor="#219ebc"
                    textColor="#fff"
                    hoverColor="#1f7fb8"
                    border="1px solid white"
                />
                </section>

                {/* YEAR SELECTION DROPDOWN - Shows only when MonthWise is selected */}
                {isMonthWise && (
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-[#219ebc] text-white border border-white rounded-md px-3 py-2 cursor-pointer hover:bg-[#1f7fb8] focus:outline-none"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                )}
            </div>

            {voucherType.value !== "allType" && (
              <select
                onChange={(e) => {
                  const selectedId = e.target.value
                  const selectedItem = serialNumberList?.series?.find(
                    (item) => item._id === selectedId
                  )
                  dispatch(
                    setSelectedSerialNumber({
                      title: selectedItem?.seriesName || "All SerialNumber",
                      value: selectedId
                    })
                  )
                }}
                className="appearance-none bg-[#219ebc] border border-white rounded-md px-4 py-2 pr-8 shadow-inner focus:outline-none focus:ring-2 transition-colors hover:bg-[#1f7fb8] cursor-pointer text-white pl-5 min-w-[150px]"
              >
                <option value="all">All</option>
                {serialNumberList?.series?.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.seriesName}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="text-center text-white flex justify-center items-center flex-col mt-5">
            <h2 className="text-3xl sm:text-4xl font-bold">
              {selectedOption !== "voucher" ? (
                <span>
                  ₹{totalAmount?.toLocaleString()}{" "}
                  <span>
                    {totalAmount < 0 ? "CR" : totalAmount > 0 ? "DR" : ""}
                  </span>
                </span>
              ) : (
                <span>
                  ₹{voucherSum?.toLocaleString()}{" "}
                  <span>
                    {voucherSum < 0 ? "CR" : voucherSum > 0 ? "DR" : ""}
                  </span>
                </span>
              )}
            </h2>
            <p className="text-sm mt-4 font-semibold opacity-90">
              {new Date(effectiveStart).toLocaleDateString("en-GB")} -{" "}
              {new Date(effectiveEnd).toLocaleDateString("en-GB")}
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

      {/* ... Rest of the list rendering remains the same ... */}
       <div className={`flex-1 ${selectedOption === "voucher" ? "p-0" : "p-2"}`}>
        {!isFetching &&
          processedSummary &&
          selectedOption !== "voucher" &&
          processedSummary?.length === 0 && (
            <p className="text-gray-500 text-center font-bold mt-20">
              No data found
            </p>
          )}
        {/* ... (Keep existing map code) ... */}
{processedSummary &&
  selectedOption !== "voucher" &&
  processedSummary?.length > 0 && (
    <div className="space-y-2">
      {processedSummary.map((item, index) => {
       const transactionCount =
  data?.flattenedResults
    ?.filter(backendItem => backendItem.name === item.name)
    ?.reduce((sum, backendItem) => sum + (backendItem.count || 0), 0) || 0;

     
console.log(voucherwisesummary)
        return (
          <div key={index} className="bg-white shadow-sm rounded-lg p-3 hover:shadow-md transition-all duration-200 border-l-2 border-blue-400">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-bold text-gray-800 flex-shrink-0 w-24">
                {item.name}
              </h4>
              
              {selectedOption === "MonthWise" && (
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleMonthClick(item, "daybook")}
                    className="w-8 h-8 p-0.5 border hover:border-blue-200 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded shadow-sm hover:shadow-md transform hover:scale-105 transition-all flex items-center justify-center"
                    title="Daybook">
                    <CiBookmark />
                  </button>
                  <button onClick={() => handleMonthClick(item, "details")}
                    className="w-8 h-8 p-0.5 border hover:border-green-200 hover:bg-green-100 text-green-600 hover:text-green-700 rounded shadow-sm hover:shadow-md transform hover:scale-105 transition-all flex items-center justify-center"
                    title="Details">
                    <CiGrid31 />
                  </button>
                </div>
              )}
              
              <div className="ml-auto text-right min-w-[140px] flex-shrink-0 space-y-0.5">
                <p className="text-sm font-bold text-green-600 leading-tight">
                  ₹{Math.abs(item.net).toLocaleString()}
                </p>
                
                {/* ✅ TRUE TRANSACTION COUNT */}
              
                
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  item.net < 0 ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  {item.net < 0 ? 'CR' : 'DR'}
                </span>
              </div>
                <div className="flex items-center justify-end gap-1 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                    {transactionCount}
                  </span>
               
                </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}









       </div>
    </div>
  )
}

