import { useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
// import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useMemo, useState } from "react"
// import { startOfDay, endOfDay } from "date-fns"
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
  // const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { summaryType } = location.state
  const { start, end } = useSelector((state) => state.date)

  const isAdmin =
    JSON.parse(localStorage.getItem("sUserData")).role === "admin"
      ? true
      : false
  const selectedSecondaryUser = useSelector(
    (state) => state?.userFilter?.selectedUser
  )
  const voucherType = useSelector((state) => state.voucherType.selectedVoucher)
  const serialNumber = useSelector(
    (state) => state.serialNumber.selectedSerialNumber
  )
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  )

  const selectedOption = useSelector(
    (state) => state.summaryFilter.selectedOption
  )
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
      if (summaryType === "Sales Summary") {
        dispatch(setSelectedVoucher({ title: "All", value: "allType" }))
      } else if (summaryType === "Purchase Summary") {
        dispatch(setSelectedVoucher({ title: "All", value: "allType" }))
      } else if (summaryType === "Order Summary") {
        dispatch(
          setSelectedVoucher({ title: "Sale Order", value: "saleOrder" })
        )
      }
    }
  }, [])
  // const normalizedStart = useMemo(
  //   () => startOfDay(start).toISOString(),
  //   [start]
  // )
  // const normalizedEnd = useMemo(() => endOfDay(end).toISOString(), [end])
  const { data: voucherwisesummary = [], isFetching: voucherFetching } =
    useQuery({
      queryKey: [
        "voucherSummary",
        cmp_id,
        voucherType.value,
        start,
        end,
        serialNumber.value,
        summaryType,
        serialNumber.value
      ],
      queryFn: async () => {
        const res = await api.get(
          `/api/sUsers/transactions/${cmp_id}?startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=${
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
        { withCredentials: true } // 👈 Include cookies)
      )
      return res.data
    },
    enabled:
      !!cmp_id &&
      !!voucherType.value &&
      voucherType.title !== "All Vouchers" &&
      voucherType.value !== "allType",
    staleTime: 30000,
    retry: false
  })
  const queryKey = [
    "summaryReport",
    {
      start,
      end,
      voucherValue: voucherType?.value,
      serialNumberValue: serialNumber?.value,
      selectedOption,
      summaryType,
      cmp_id
    }
  ]

  const isQueryReady =
    !!cmp_id &&
    !!start &&
    !!end &&
    !!voucherType?.title &&
    voucherType.title !== "All Vouchers" &&
    !!summaryType &&
    !!selectedOption &&
    selectedOption !== "voucher" &&
    !!serialNumber
  const {
    data,
    // isLoading,
    isFetching
    // refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const res = await api.get(`/api/sUsers/summaryReport/${cmp_id}`, {
          params: {
            start,
            end,
            voucherType: voucherType?.value,
            selectedOption,
            summaryType,
            serialNumber: serialNumber?.value
          },
          withCredentials: true // 👈 Include cookies
        })

        return res.data
      } catch (error) {
        if (error.response?.status === 404) {
          //turn "404 no data" into an empty list
          return { flattenedResults: [] }
        }
        //rethrow other errors
        throw error
      }
    },
    enabled: isQueryReady,
    staleTime: 30000, // fresh for 1m
    // cacheTime: 60000, // keep in memory for 1m after unmount
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false // 👈 Disable auto-refetch on tab focus
  })
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
  useEffect(() => {
    if (data) {
      const summary = data?.flattenedResults
      const map = new Map()
      for (const item of summary) {
        const key = item.name
        if (!map.has(key)) {
          map.set(key, {
            name: key,
            debitSum: 0, // sum of non-credit items
            creditSum: 0, // sum of credit items
            transactions: [],
            sourceTypes: new Set()
          })
        }

        const acc = map.get(key)

        // 1) Separate sums for debit vs credit
        if (item.isCredit) {
          // this is a credit
          acc.creditSum += item.total
        } else {
          // this is a debit (sale/vanSale)
          acc.debitSum += item.total
        }

        // 2) collect all transactions
        acc.transactions.push(...item.transactions)

        // 3) collect distinct sourceTypes
        acc.sourceTypes.add(item.sourceType)
      }

      // 4) build final result array, computing net = debitSum - creditSum
      const result = Array.from(map.values()).map((acc) => ({
        name: acc.name,
        total: acc.debitSum, // sum of sale + vanSale
        credit: acc.creditSum, // sum of creditNote
        net:
          summaryType === "Sales Summary"
            ? acc.debitSum - acc.creditSum
            : summaryType === "Purchase Summary"
            ? acc.creditSum - acc.debitSum
            : acc.debitSum, // what you actually want to display
        sourceType: Array.from(acc.sourceTypes), // e.g. ['sale','vanSale','creditNote']
        transactions: acc.transactions
      }))
      setProcessedSummary(result)
    }
  }, [data])
  const totalAmount = useMemo(() => {
    return (
      processedSummary?.reduce(
        (sum, item) => sum + Number(item.net),
        0 // ← initial sum = 0
      ) ?? 0 // if processedSummary is undefined, default to 0
    )
  }, [processedSummary])
  // const handleItemClick = (item) => {
  //   // navigate("/sUsers/salesSummaryTransactions", {
  //   //   state: {
  //   //     transactions: item.transactions,
  //   //     title: `${selectedOption}: ${item.name}`,
  //   //     total: item.total
  //   //   }
  //   // })
  // }

  // Handle navigation to summary details page
  // const handleNavigate = () => {
  //   navigate("/sUsers/salesSummaryDetails", {
  //     state: { summary: processedSummary }
  //   })
  // }


  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50">
        <TitleDiv title={summaryType} from="/sUsers/reports" />
        <section className="shadow-lg border-b">
          <SelectDate />
        </section>
        <section className="shadow-lg bg-white">
          <VoucherTypeFilter filterKeys={filterKeys} />
        </section>
        {(isFetching || voucherFetching) && (
          <section className="w-full">
            <BarLoader color="#9900ff" width="100%" />
          </section>
        )}

        <div className="bg-[#219ebc] flex flex-col pb-11 shadow-xl justify-center pt-2 px-2">
          <div className="flex  justify-between">
            <section className="shadow-xl rounded-lg">
              <SummaryDropdown
                bgColor="#219ebc"
                textColor="#fff"
                hoverColor="#1f7fb8"
              />
            </section>
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
                className=" appearance-none bg-[#219ebc] border border-white rounded-md px-4 py-2 pr-8 shadow-inner focus:outline-none focus:ring-2 transition-colors hover:bg-[#1f7fb8] cursor-pointer text-white pl-5 min-w-[150px]"
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
              
{/* {selectedOption !== "voucher"
                ? totalAmount?.toLocaleString()
                : voucherSum?.toLocaleString()} */}
              {selectedOption !== "voucher" ? (
                <span>
                  ₹{totalAmount?.toLocaleString()}{" "}
                  <span
                   
                  >
                    {totalAmount < 0 ? "CR" :totalAmount > 0 ? "DR" : ""}
                  </span>
                </span>
              ) : (
                <span>
                  ₹{voucherSum?.toLocaleString()}{" "}
                  <span
                  
                  >
                    {voucherSum < 0 ? "CR" : voucherSum > 0 ? "DR" : "" }
                  </span>
                </span>
              )}
            </h2>
            <p className="text-sm mt-4 font-semibold opacity-90">
              {/* {new Date(start).toLocaleDateString()} -{" "}
              {new Date(end).toLocaleDateString()} */}
            </p>
            <button
              // onClick={handleNavigate}
              className="text-xs mt-4 font-bold opacity-90 underline hover:scale-105 transition-transform duration-300"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <div className={`flex-1 ${selectedOption === "voucher" ? "p-0" : "p-2"}`}>
        {!isFetching &&
          processedSummary &&
          selectedOption !== "voucher" &&
          processedSummary?.length === 0 && (
            <p className="text-gray-500 text-center font-bold mt-20">
              No data found
            </p>
          )}
        {!voucherFetching &&
          voucherwisesummary?.data?.combined &&
          selectedOption === "voucher" &&
          voucherwisesummary?.data?.combined?.length === 0 && (
            <p className="text-gray-500 text-center font-bold mt-20">
              No data found
            </p>
          )}
        {!voucherFetching &&
          voucherwisesummary &&
          selectedOption === "voucher" &&
          voucherwisesummary.length === 0 && (
            <p className="text-gray-500 text-center font-bold mt-20">
              No data found
            </p>
          )}

        {processedSummary &&
          selectedOption !== "voucher" &&
          processedSummary?.length > 0 && (
            <div className="space-y-2">
              {processedSummary.map((item, index) => (
                <div
                  key={index}
                  // onClick={() => handleItemClick(item)}
                  className="flex justify-between items-center p-4 py-6 bg-white shadow-md rounded-base cursor-pointer hover:-translate-y-0.5 transition-transform duration-300"
                >
                  <span className="text-gray-800 font-medium">{item.name}</span>
                  <span className="text-gray-600 font-semibold">
                    ₹{item.net.toLocaleString()}
                    {selectedOption !== "vouher" &&(
                      <span
                        className={`ml-2 ${
                          item.net < 0
                            ? "text-red-500 font-semibold"
                            : "text-green-500 font-semibold"
                        }`}
                      >
                        {item.net < 0 ? "CR" : "DR"}
                      </span>
                    ) }
                  </span>
                </div>
              ))}
            </div>
          )}
        {selectedOption === "voucher" &&
          voucherwisesummary?.data?.combined &&
          voucherwisesummary?.data?.combined?.length > 0 && (
            <DashboardTransaction
              filteredData={voucherwisesummary.data.combined}
            />
          )}
      </div>
    </div>
  )
}
