import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { BarLoader } from "react-spinners"
import TitleDiv from "../../../../components/common/TitleDiv"
import SummmaryDropdown from "../../../../components/Filters/SummaryDropdown"
import SelectDate from "../../../../components/Filters/SelectDate"
import useFetch from "../../../../customHook/useFetch"
import { useLocation } from "react-router-dom"
const SalesSummary = () => {
  const [summaryData, setSummaryData] = useState([])
  const [processedSummary, setProcessedSummary] = useState([])
  const navigate = useNavigate()
const location=useLocation()
  const { summaryType } = location.state
  const { start, end } = useSelector((state) => state.date)
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  )
  const selectedOption = useSelector(
    (state) => state.summaryFilter.selectedOption
  )

  // Memoize API URL construction
  const salesSummaryUrl = useMemo(() => {
    if (!start || !end || !cmp_id) return null
    return `/api/sUsers/salesSummary/${cmp_id}?startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=sale`
  }, [start, end, cmp_id])

  // Fetch data using custom hook
  const { data: salesSummaryData, loading } = useFetch(salesSummaryUrl)

  // Update summary data when API response changes
  useEffect(() => {
    if (salesSummaryData?.flattenedResults) {
      setSummaryData(salesSummaryData.flattenedResults)
    }
  }, [salesSummaryData])

  // Calculate totals and store relevant transactions based on selected option
  useEffect(() => {
    const calculateTotalsWithTransactions = () => {
      if (!summaryData.length) return []

      const totalsMap = new Map()

      if (selectedOption === "Ledger") {
        console.log("h")
        summaryData.forEach((item) => {
          if (!item.party?._id) return
          const partyName = item.party.partyName

          // Get existing data or initialize
          const existing = totalsMap.get(partyName) || {
            total: 0,
            transactions: []
          }

          // Update total
          existing.total += Number(item.finalAmount) || 0

          // Add transaction details using the requested format
          existing.transactions.push({
            voucherNumber: item.salesNumber || "N/A",
            party_name: partyName,
            date: item.date,
            enteredAmount: Number(item.finalAmount) || 0,
            _id: item._id,
            isCancelled: false,
            type: "Tax Invoice"
          })

          totalsMap.set(partyName, existing)
        })
      } else if (selectedOption === "Stock Item") {
        // Create a map to organize transactions by product
        const productTransactionsMap = new Map()

        summaryData.forEach((sale) => {
          sale.items?.forEach((item) => {
            if (!item.product_name) return

            // Get existing data or initialize
            const existing = totalsMap.get(item.product_name) || {
              total: 0,
              transactions: []
            }

            // Update total
            existing.total += item.total || 0

            // Track this product in this sale if not already tracked
            const transactionKey = `${sale._id}-${item.product_name}`
            if (!productTransactionsMap.has(transactionKey)) {
              existing.transactions.push({
                voucherNumber: sale.salesNumber || "N/A",
                party_name: sale.party?.partyName || "N/A",
                date: sale.date,
                enteredAmount: item.total || 0,
                _id: sale._id,
                product: item.product_name,
                isCancelled: false,
                type: "Tax Invoice"
              })
              productTransactionsMap.set(transactionKey, true)
            }

            totalsMap.set(item.product_name, existing)
          })
        })
      } else if (selectedOption === "Stock Group") {
        // Create a map to organize transactions by brand group
        const brandTransactionsMap = new Map()

        summaryData.forEach((sale) => {
          sale.items?.forEach((item) => {
            if (!item?.brand?._id) return
            const groupName = item.brand.name

            // Get existing data or initialize
            const existing = totalsMap.get(groupName) || {
              total: 0,
              transactions: []
            }

            // Update total
            existing.total += item.total || 0

            // Track this brand in this sale if not already tracked
            const transactionKey = `${sale._id}-${groupName}`
            if (!brandTransactionsMap.has(transactionKey)) {
              existing.transactions.push({
                voucherNumber: sale.salesNumber || "N/A",
                party_name: sale.party?.partyName || "N/A",
                date: sale.date,
                enteredAmount: item.total || 0,
                _id: sale._id,
                brand: groupName,
                isCancelled: false,
                type: "Tax Invoice"
              })
              brandTransactionsMap.set(transactionKey, true)
            }

            totalsMap.set(groupName, existing)
          })
        })
      } else if (selectedOption === "Stock Category") {
        // Create a map to organize transactions by category
        const categoryTransactionsMap = new Map()

        summaryData.forEach((sale) => {
          sale.items?.forEach((item) => {
            if (!item?.category?._id) return
            const categoryName = item.category.name

            // Get existing data or initialize
            const existing = totalsMap.get(categoryName) || {
              total: 0,
              transactions: []
            }

            // Update total
            existing.total += item.total || 0

            // Track this category in this sale if not already tracked
            const transactionKey = `${sale._id}-${categoryName}`
            if (!categoryTransactionsMap.has(transactionKey)) {
              existing.transactions.push({
                voucherNumber: sale.salesNumber || "N/A",
                party_name: sale.party?.partyName || "N/A",
                date: sale.date,
                enteredAmount: item.total || 0,
                _id: sale._id,
                category: categoryName,
                isCancelled: false,
                type: "Tax Invoice"
              })
              categoryTransactionsMap.set(transactionKey, true)
            }

            totalsMap.set(categoryName, existing)
          })
        })
      }

      // Convert map to array
      return Array.from(totalsMap).map(([name, data]) => ({
        name,
        total: data.total,
        transactions: data.transactions
      }))
    }

    setProcessedSummary(calculateTotalsWithTransactions())
  }, [summaryData, selectedOption])

  console.log("processedSummary", processedSummary)
console.log(summaryData)

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return processedSummary.reduce((sum, item) => sum + item.total, 0)
  }, [processedSummary])

  // Handle navigation to summary details page
  const handleNavigate = () => {
    navigate("/sUsers/salesSummaryDetails", {
      state: { summaryType }
    })
  }
console.log(summaryData)

  // Handle click on a specific summary item - navigate with transaction details
  const handleItemClick = (item) => {
    navigate("/sUsers/salesSummaryTransactions", {
      state: {
        transactions: item.transactions,
        title: `${selectedOption}: ${item.name}`,
        total: item.total
      }
    })
  }

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
          <div className="flex  justify-between">
            <section className="shadow-xl rounded-lg">
              <SummmaryDropdown bgColor="#3b82f6" textColor="#fff" />
            </section>

            <select className="shadow-lg rounded-md bg-blue-500 text-white pl-2 focus:outline-none">
              <option>Sale summary</option>
              <option>Credit Summary</option>
            </select>
          </div>
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
                onClick={() => handleItemClick(item)}
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
  )
}

export default SalesSummary
