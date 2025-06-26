import { useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BarLoader } from "react-spinners"
import TitleDiv from "@/components/common/TitleDiv"
import SummaryDropdown from "@/components/Filters/SummaryDropdown"
import SelectDate from "@/components/Filters/SelectDate"
import VoucherTypeFilter from "@/components/Filters/VoucherTypeFilter"
import { setSelectedVoucher } from "../../../.././slices/filterSlices/voucherType"
import useFetch from "@/customHook/useFetch"
import { startOfDay } from "date-fns"

export default function SummaryReport() {
  const location = useLocation()
  const dispatch = useDispatch()
  const { summaryType } = location.state
  const { start, end } = useSelector((state) => state.date)
  const voucherType = useSelector((state) => state.voucherType.selectedVoucher)
  const serialNumber = useSelector(
    (state) => state.serialNumber.selectedSerialNumber
  )
  console.log(serialNumber)
  const selectedOption = useSelector(
    (state) => state.summaryFilter.selectedOption
  )
  console.log(selectedOption)
  console.log(voucherType)
  console.log(start, end)
  let filterKeys = []

  if (summaryType?.toLowerCase().includes("sale")) {
    filterKeys = ["sale", "creditNote"]
  } else if (summaryType?.toLowerCase().includes("purchase")) {
    filterKeys = ["purchase", "debitNote"]
  }
  // useEffect(() => {
  //   if (summaryType === "Sales Summary") {
  //     dispatch(setSelectedVoucher("sale"))
  //   } else if (summaryType === "Purchase Summary") {
  //     dispatch(setSelectedVoucher("purchase"))
  //   }
  // }, [])
  // /api/sUsers/salesSummary/${cmp_id}?startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=sale
  const queryKey = [
    "summaryReport",
    { start, end, voucherType, serialNumber, selectedOption, summaryType }
  ]
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axios.get(
        "http://localhost:7000/api/sUsers/summaryReport",
        {
          params: {
            start,
            end,
            voucherType,
            selectedOption,
            summaryType,
            serialNumber
          }
        }
      )

      return res.data
    },
    enabled:
      !!start &&
      !!end &&
      !!voucherType &&
      !!summaryType &&
      !!selectedOption &&
      !!serialNumber,
    staleTime: 2 * 60 * 1000 //dont refetch same data for 5 minutes
    // cacheTime: 10 * 60 * 1000
  })
  console.log(start)
  console.log(voucherType)
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
        {/* {loading && (
          <section className="w-full">
            <BarLoader color="#9900ff" width="100%" />
          </section>
        )} */}

        <div className="bg-[#219ebc] flex flex-col pb-11 shadow-xl justify-center pt-2 px-2">
          <div className="flex  justify-between">
            <section className="shadow-xl rounded-lg">
              <SummaryDropdown bgColor="#3b82f6" textColor="#fff" />
            </section>

            <select className="shadow-lg rounded-md bg-blue-500 text-white pl-2 focus:outline-none">
              <option>Sale summary</option>
              <option>Credit Summary</option>
            </select>
          </div>
          <div className="text-center text-white flex justify-center items-center flex-col mt-5">
            <h2 className="text-3xl sm:text-4xl font-bold">
              {/* ₹{totalAmount.toLocaleString()} */}
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
        {/* {!loading && processedSummary.length === 0 && (
          <p className="text-gray-500 text-center font-bold mt-20">
            No data found
          </p>
        )} */}

        {/* {processedSummary.length > 0 && (
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
        )} */}
      </div>
    </div>
  )
}
