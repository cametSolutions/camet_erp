import { useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useMemo, useState } from "react"
import { startOfDay, endOfDay } from "date-fns"
import { BarLoader } from "react-spinners"
import TitleDiv from "@/components/common/TitleDiv"
import SummaryDropdown from "@/components/Filters/SummaryDropdown"
import SelectDate from "@/components/Filters/SelectDate"
import VoucherTypeFilter from "@/components/Filters/VoucherTypeFilter"
import { setSelectedVoucher } from "../../../.././slices/filterSlices/voucherType"
import { setSelectedSerialNumber } from "../../../.././slices/filterSlices/serialNumberFilter"

export default function SummaryReport() {
  const [processedSummary, setProcessedSummary] = useState([])
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { summaryType } = location.state
  const { start, end } = useSelector((state) => state.date)

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
  const normalizedStart = useMemo(
    () => startOfDay(start).toISOString(),
    [start]
  )

  const normalizedEnd = useMemo(() => endOfDay(end).toISOString(), [end])

  const { data: serialNumberList } = useQuery({
    queryKey: ["serialNumbers", cmp_id, voucherType.value],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:7000/api/sUsers/getSeriesByVoucher/${cmp_id}?voucherType=${voucherType.value}`,
        { withCredentials: true } // 👈 Include cookies)
      )
      return res.data
    },
    enabled:
      !!cmp_id &&
      !!voucherType.value &&
      voucherType.title !== "All Vouchers" &&
      voucherType.value !== "allType",
    staleTime: 5 * 60 * 1000,
    retry: false
  })

  const queryKey = [
    "summaryReport",
    {
      normalizedStart,
      normalizedEnd,
      voucherValue: voucherType?.value,
      serialNumberValue: serialNumber?.value,
      selectedOption,
      summaryType
    }
  ]
  const isQueryReady =
    !!normalizedStart &&
    !!normalizedEnd &&
    !!voucherType?.title &&
    voucherType.title !== "All Vouchers" &&
    !!summaryType &&
    !!selectedOption &&
    !!serialNumber
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const res = await axios.get(
          `http://localhost:7000/api/sUsers/summaryReport/${cmp_id}`,
          {
            params: {
              start: normalizedStart,
              end: normalizedEnd,
              voucherType: voucherType?.value,
              selectedOption,
              summaryType,
              serialNumber: serialNumber?.value
            },
            withCredentials: true // 👈 Include cookies
          }
        )

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
    staleTime: 1 * 60_000, // fresh for 1m
    cacheTime: 1 * 60_000, // keep in memory for 1m after unmount
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false // 👈 Disable auto-refetch on tab focus
  })
  useEffect(() => {
    setProcessedSummary(data?.flattenedResults)
  }, [data])
  const totalAmount = useMemo(() => {
    return (
      processedSummary?.reduce(
        (sum, item) => sum + (item.isCreditOrDebit ? 0 : Number(item.total)),
        0
      ) ?? 0
    )
  }, [processedSummary])
  // Handle navigation to summary details page
  const handleNavigate = () => {
    navigate("/sUsers/salesSummaryDetails", {
      state: { summary: processedSummary }
    })
  }
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50">
        <TitleDiv title={summaryType} from="/sUsers/reports" />
        <section className="shadow-lg border-b">
          <SelectDate />
        </section>
        <section className="shadow-lg">
          <VoucherTypeFilter filterKeys={filterKeys} />
        </section>
        {isFetching && (
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
              ₹{totalAmount?.toLocaleString() || 0}
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

      <div className="flex-1 p-4">
        {!isFetching && processedSummary && processedSummary?.length === 0 && (
          <p className="text-gray-500 text-center font-bold mt-20">
            No data found
          </p>
        )}

        {processedSummary && processedSummary?.length > 0 && (
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
