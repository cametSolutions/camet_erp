import React from "react"
import TitleDiv from "@/components/common/TitleDiv"
import * as XLSX from "xlsx-js-style"
import { RiFileExcel2Fill } from "react-icons/ri"
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
  const [brand, setBrand] = useState([])
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [category, setCategory] = useState([])
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
      const uniqueBrands = [
        ...new Set(
          data.result.individualArray.map((p) => p.brand).filter((b) => b) // removes null, undefined, empty string
        )
      ]
      const uniqueCategory = [
        ...new Set(
          data.result.individualArray.map((p) => p.category).filter((b) => b)
        )
      ]
      setBrand(uniqueBrands)
      setCategory(uniqueCategory)

      setmappedArray(data.result.mappedArray)
    }
  }, [data])
 
  useEffect(() => {
    if (selectedBrand === "All" && selectedCategory !== "All") {
      const filtredData = data.result.individualArray.filter(
        (item) => item.category === selectedCategory
      )
   
      setindividualArray(filtredData)
    } else if (selectedBrand === "All" && selectedCategory === "All") {
      const filteredData = data.result.individualArray
      setindividualArray(filteredData)
    } else if (selectedBrand !== "All" && selectedCategory === "All") {
      const filteredData = data.result.individualArray.filter(
        (item) => item.brand === selectedBrand
      )
    
      setindividualArray(filteredData)
    } else if (selectedBrand !== "All" && selectedCategory !== "All") {
      const filteredData = data.result.individualArray.filter(
        (item) =>
          item.brand === selectedBrand && item.category === selectedCategory
      )
      setindividualArray(filteredData)
    }

  }, [selectedBrand, selectedCategory])
 
  
  const exportToExcel = () => {
    if (!individualArray || individualArray.length === 0) return

    const formatDate = (dateString) =>
      dateString ? new Date(dateString).toISOString().split("T")[0] : "N/A"

    const headerRow1 = [
      "Item",
      "Opening",
      "",
      "",
      "Inward",
      "",
      "",
      "Outward",
      "",
      "",
      "Closing",
      "",
      ""
    ]

    const headerRow2 = [
      "",
      "Quantity",
      "Rate",
      "Amount",
      "Quantity",
      "Rate",
      "Amount",
      "Quantity",
      "Rate",
      "Amount",
      "Quantity",
      "Rate",
      "Amount"
    ]

    const worksheetData = [headerRow1, headerRow2]

    individualArray.forEach((record) => {
      const row = [
        record.itemName,
        record.opening.quantity,
        record.opening.rate,
        record.opening.amount,
        record.inward.quantity,
        record.inward.rate,
        record.inward.amount,
        record.outward.quantity,
        record.outward.rate,
        record.outward.amount,
        record.closing.quantity,
        record.closing.rate,
        record.closing.amount
      ]
      worksheetData.push(row)
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(worksheetData)

    // Merge cells for grouped headers
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
      { s: { r: 0, c: 1 }, e: { r: 0, c: 3 } },
      { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } },
      { s: { r: 0, c: 7 }, e: { r: 0, c: 9 } },
      { s: { r: 0, c: 10 }, e: { r: 0, c: 12 } }
    ]

    // Column widths
    const colWidths = worksheetData[1].map((_, colIdx) => {
      let maxLen = 10
      worksheetData.forEach((row) => {
        const val = row[colIdx]
        if (val !== null && val !== undefined) {
          const str = val.toString()
          if (str.length > maxLen) maxLen = str.length
        }
      })
      return { wch: maxLen + 2 }
    })
    ws["!cols"] = colWidths

    // Define border
    const borderAll = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } }
    }

    // Header style
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "336287" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: borderAll
    }

    // Content style
    const contentStyle = {
      alignment: { horizontal: "center", vertical: "center" },
      border: borderAll
    }

    // Apply styles to header rows
    for (let R = 0; R <= 1; R++) {
      for (let C = 0; C < worksheetData[0].length; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
        if (ws[cellRef]) {
          ws[cellRef].s = headerStyle
        }
      }
    }

    // Apply styles to content rows
    const range = XLSX.utils.decode_range(ws["!ref"])
    for (let R = 2; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
        if (ws[cellRef]) {
          ws[cellRef].s = contentStyle
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Stock Summary")
    XLSX.writeFile(wb, `Stock_Summary_Report_${formatDate(new Date())}.xlsx`)
  }

  return (
    <div className="h-[calc(100vh-10px)] overflow-hidden">
      {/* <TitleDiv title="Stock Details" /> */}
      <TitleDiv
        title="Stock Details"
      
        rightSideContent={<RiFileExcel2Fill size={20} />}
        rightSideContentOnClick={exportToExcel}
      />
      <SelectDate />

      <div className="flex justify-between mx-3 border border-gray-100 shadow-xl px-3 pb-2 gap-4">
        {/* Brand Select */}
        <div className="flex flex-col">
          <label htmlFor="brand" className="text-sm font-medium mb-1">
            Brand
          </label>
          <select
            id="brand"
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="outline-none shadow-md p-1 px-2 min-w-[120px]"
          >
            <option value="All">All</option>
            {brand.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Another Select */}
        <div className="flex flex-col">
          <label htmlFor="another" className="text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="outline-none shadow-md p-1 px-2 min-w-[120px]"
          >
            <option value="All">All</option>
            {category.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-3 rounded-md overflow-auto">
        <table className="w-full min-w-max border-collapse text-sm rounded-md">
          {/* <thead className={`sticky top-0 z-20 bg-white}> */}
          <thead className="text-sm sticky top-0 z-20 bg-[rgb(51,98,135)] rounded-md shadow-xl text-white">
            <tr>
              <th
                rowSpan="2"
                className="border border-gray-400"

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
                    <td className="border p-1  bg-white text-left">
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
                        <tr
                          key={`${m.itemName}-${idx}`}
                          className="bg-yellow-200"
                        >
                          {/* indent & show batch + godown */}
                          <td className="border p-1 pl-4">
                            ({m.batch} | {m.godown})
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
