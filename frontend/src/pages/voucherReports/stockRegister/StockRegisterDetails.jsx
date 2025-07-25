import React from "react"
import TitleDiv from "@/components/common/TitleDiv"
import SelectDate from "@/components/Filters/SelectDate"
import { PropagateLoader } from "react-spinners"
import { useQuery } from "@tanstack/react-query"
import api from "@/api/api"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { addDate } from "../../../../slices/filterSlices/date"

export default function StockRegisterDetails() {
  const [mappedArray, setmappedArray] = useState([])
  const [tenure, setTenure] = useState({
    start: "",
    end: ""
  })
  const [abi, setabhi] = useState({
    r: "y",
    b: "u"
  })
  const [individualArray, setindividualArray] = useState([])
  const dispatch = useDispatch()
  const [selectedItemName, setSelectedItemName] = useState(null)

  const { start, end, initial, title } = useSelector((state) => state.date)

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  )
 
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["stockRegister", cmp_id, start, end],
    queryFn: async () => {
      const res = await api.get(
        `/api/sUsers/stockregisterSummary/${cmp_id}?start=${start}&end=${end}&title=${title}&tenureStart=${tenure.start}&tenureEnd=${tenure.end}`,
        { withCredentials: true }
      )
      return res.data
    },
    enabled:
      !!cmp_id &&
      !!start &&
      !!tenure &&
      !!tenure.start !== "" &&
      tenure.end !== "",
    staleTime: 30000,
    retry: false
  })

  useEffect(() => {
    if (!initial) {
      const newstart = new Date(new Date().getFullYear(), 3, 1)
      const newend = new Date(new Date().getFullYear() + 1, 2, 31)
    
      const startdate = new Date(
        Date.UTC(
          newstart.getFullYear(),
          newstart.getMonth(),
          newstart.getDate(),
          0,
          0,
          0
        )
      )
      const enddate = new Date(
        Date.UTC(
          newend.getFullYear(),
          newend.getMonth(),
          newend.getDate(),
          0,
          0,
          0
        )
      )
      dispatch(
        addDate({
          rangeName: "Current Financial Year",
          start: startdate.toISOString(),
          end: enddate.toISOString(),
          initial: true
        })
      )
    }
  }, [])
  useEffect(() => {
    if (
      title !== "Current Financial Year" &&
      title !== "Previous Financial Year" &&
      title !== "Last Year" &&
      initial
    ) {
      const newstart = new Date(new Date(start).getFullYear(), 3, 1)
     
      const startdate = new Date(
        Date.UTC(
          newstart.getFullYear(),
          newstart.getMonth(),
          newstart.getDate(),
          0,
          0,
          0
        )
      )
      
      setTenure({
        start: startdate.toISOString(),
        end: end
      })
    } else if (title === "Current Financial Year" && initial) {
      const newstart = new Date(new Date().getFullYear() - 1, 3, 1)
    
      const newend = new Date(new Date().getFullYear() + 1, 2, 31)
    
      const startdate = new Date(
        Date.UTC(
          newstart.getFullYear(),
          newstart.getMonth(),
          newstart.getDate(),
          0,
          0,
          0
        )
      )
      const enddate = new Date(
        Date.UTC(
          newend.getFullYear(),
          newend.getMonth(),
          newend.getDate(),
          0,
          0,
          0
        )
      )
      setTenure({
        start: startdate.toISOString(),
        end: enddate.toISOString()
      })
    
    } else if (title === "Previous Financial Year" && initial) {
     
      const newstart = new Date(new Date().getFullYear() - 2, 3, 1)
      const newend = new Date(new Date().getFullYear(), 2, 31)
      const startdate = new Date(
        Date.UTC(
          newstart.getFullYear(),
          newstart.getMonth(),
          newstart.getDate(),
          0,
          0,
          0
        )
      )
      const enddate = new Date(
        Date.UTC(
          newend.getFullYear(),
          newend.getMonth(),
          newend.getDate(),
          0,
          0,
          0
        )
      )
      setTenure({
        start: startdate.toISOString(),
        end: enddate.toISOString()
      })
    } else if (title === "Last Year") {
      console.log("H")
    }
  }, [initial])


  useEffect(() => {
    if (data) {
      setindividualArray(data.result.individualArray)
      setmappedArray(data.result.mappedArray)
    }
  }, [data])


  return (
    <div className="h-[calc(100vh-10px)] overflow-hidden">
      <TitleDiv title="Stock Details" />
      <SelectDate />
      <div className="px-3 rounded-md">
        <table className="w-full min-w-max border-collapse text-sm rounded-md">
          {/* <thead className={`sticky top-0 z-20 bg-white}> */}
          <thead className="text-sm sticky top-0 z-20 bg-[rgb(51,98,135)] rounded-md shadow-xl text-white">
            <tr>
              <th
                rowSpan="2"
                className="border border-gray-400  sticky left-0 z-20 bg-[rgb(51,98,135)]"

                // className={`border border-gray-300 p-2 sticky ${ !modalOpen&&left-0  z-10 }bg-gray-100`}
              >
                Item
              </th>
              <th colSpan="3" className="border  border-gray-400 p-1">
                Opening
              </th>
              <th colSpan="3" className="border border-gray-400 p-1">
                Inward
              </th>
              <th colSpan="3" className="border border-gray-400 p-1">
                Outward
              </th>

              <th colSpan="3" className="border border-gray-400 p-1">
                Closing
              </th>
            </tr>
            <tr>
              <th className="border border-gray-400 p-1">Quantity</th>
              <th className="border  border-gray-400 p-1">Rate</th>
              <th className="border  border-gray-400 p-1">Amount</th>
              <th className="border border-gray-400 p-1">Quantity</th>
              <th className="border  border-gray-400 p-1">Rate</th>
              <th className="border  border-gray-400 p-1">Amount</th>
              <th className="border border-gray-400 p-1">Quantity</th>
              <th className="border  border-gray-400 p-1">Rate</th>
              <th className="border  border-gray-400 p-1">Amount</th>
              <th className="border border-gray-400 p-1">Quantity</th>
              <th className="border  border-gray-400 p-1">Rate</th>
              <th className="border  border-gray-400 p-1">Amount</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {individualArray && individualArray.length > 0 ? (
              individualArray.map((row) => (
                <React.Fragment key={row.itemName}>
                  <tr
                    onClick={() =>
                      setSelectedItemName((prev) =>
                        prev === row.itemName ? null : row.itemName
                      )
                    }
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {/* Item Name */}
                    <td className="border p-1 sticky left-0 bg-white text-left">
                      {row.itemName}
                    </td>

                    {/* Opening */}
                    <td className="border p-1">{row.opening.quantity}</td>
                    <td className="border p-1">
                      {row.opening.rate?.toFixed?.(2) || "-"}
                    </td>
                    <td className="border p-1">{row.opening.amount}</td>

                    {/* Inward */}
                    <td className="border p-1">{row.inward.quantity}</td>
                    <td className="border p-1">
                      {row.inward.rate?.toFixed?.(2) || "-"}
                    </td>
                    <td className="border p-1">{row.inward.amount}</td>

                    {/* Outward */}
                    <td className="border p-1">{row.outward.quantity}</td>
                    <td className="border p-1">
                      {row.outward.rate?.toFixed?.(2) || "-"}
                    </td>
                    <td className="border p-1">{row.outward.amount}</td>

                    {/* Closing */}
                    <td className="border p-1">{row.closing.quantity}</td>
                    <td className="border p-1">
                      {row.closing.rate?.toFixed?.(2) || "-"}
                    </td>
                    <td className="border p-1">{row.closing.amount}</td>
                  </tr>

                  {/* if this row is expanded, show mapped rows */}
                  {selectedItemName === row.itemName &&
                    mappedArray
                      .filter((m) => m.itemName === row.itemName)
                      .map((m, idx) => (
                        <tr key={`${m.itemName}-${idx}`} className="bg-gray-50">
                          {/* indent & show batch + godown */}
                          <td className="border p-1 pl-4">
                            ↳ {m.itemName} ({m.batch || "-"} | {m.godown || "-"}
                            )
                          </td>

                          {/* Opening */}
                          <td className="border p-1">{m.opening.quantity}</td>
                          <td className="border p-1">
                            {m.opening.rate?.toFixed?.(2) || "-"}
                          </td>
                          <td className="border p-1">{m.opening.amount}</td>

                          {/* Inward */}
                          <td className="border p-1">{m.inward.quantity}</td>
                          <td className="border p-1">
                            {m.inward.rate?.toFixed?.(2) || "-"}
                          </td>
                          <td className="border p-1">{m.inward.amount}</td>

                          {/* Outward */}
                          <td className="border p-1">{m.outward.quantity}</td>
                          <td className="border p-1">
                            {m.outward.rate?.toFixed?.(2) || "-"}
                          </td>
                          <td className="border p-1">{m.outward.amount}</td>

                          {/* Closing */}
                          <td className="border p-1">{m.closing.quantity}</td>
                          <td className="border p-1">
                            {m.closing.rate?.toFixed?.(2) || "-"}
                          </td>
                          <td className="border p-1">{m.closing.amount}</td>
                        </tr>
                      ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="text-center p-2">
                  <div className="flex justify-center items-center">
                    {isFetching ? (
                      <PropagateLoader
                        color="#3b82f6"
                        size={10}
                        speedMultiplier={1}
                        className="mb-3"
                      />
                    ) : (
                      <div>No Data found</div>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
