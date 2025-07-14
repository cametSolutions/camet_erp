/* eslint-disable no-prototype-builtins */
import { useState, useEffect, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import api from "@/api/api"
import TitleDiv from "../../../../components/common/TitleDiv"
import SummmaryDropdown from "../../../../components/Filters/SummaryDropdown"
import SelectDate from "../../../../components/Filters/SelectDate"
import { useDispatch, useSelector } from "react-redux"
import { setSelectedVoucher } from "../../../../../../frontend/slices/filterSlices/voucherType"
import { setSelectedSerialNumber } from "../../../../../../frontend/slices/filterSlices/serialNumberFilter"
import VoucherTypeFilter from "@/components/Filters/VoucherTypeFilter"
import useFetch from "../../../../customHook/useFetch"
import CustomBarLoader from "../../../../components/common/CustomBarLoader"
import * as XLSX from "xlsx-js-style"
import { RiFileExcel2Fill } from "react-icons/ri"
function SalesSummaryTable() {
  const [summaryReport, setSummaryReport] = useState([])
  const [summary, setSummary] = useState([])
  // const [selectedSerialNumber,setselectedSerialNumber]=
  const location = useLocation()
  const dispatch = useDispatch()
  const { summaryType = "Sales Summary" } = location.state || {}
  const isAdmin =
    JSON.parse(localStorage.getItem("sUserData")).role === "admin"
      ? true
      : false
  const { start, end } = useSelector((state) => state.date)
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  )
  const selectedSecondaryUser = useSelector(
    (state) => state?.userFilter?.selectedUser
  )
  const voucherType = useSelector((state) => state.voucherType.selectedVoucher)
  const selectedOption = useSelector(
    (state) => state.summaryFilter.selectedOption
  )
  const serialNumber = useSelector(
    (state) => state.serialNumber.selectedSerialNumber
  )
  let filterKeys = []
  if (summaryType?.toLowerCase().includes("sale")) {
    filterKeys = ["allType", "sale", "vanSale", "creditNote"]
  } else if (summaryType?.toLowerCase().includes("purchase")) {
    filterKeys = ["allType", "purchase", "debitNote"]
  } else if (summaryType.toLowerCase().includes("order")) {
    filterKeys = ["saleOrder"]
  }
  const salesummaryUrl = useMemo(() => {
    if (start && end && voucherType.value !== "all") {
      return `/api/sUsers/salesSummary/${cmp_id}?startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=${voucherType.value}&summaryType=${summaryType}&selectedOption=${selectedOption}`
    }
    return null // Or return an empty string if preferred
  }, [start, end, cmp_id, voucherType.value, selectedOption])
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
  console.log(summaryReport)
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

  const {
    data: salesummaryData,
    loading
    // error: Error,
  } = useFetch(salesummaryUrl)
  useEffect(() => {
    if (voucherType.title === "All Vouchers") {
      if (
        summaryType === "Sales Summary" ||
        summaryType === "Purchase Summary"
      ) {
        dispatch(setSelectedVoucher({ title: "All", value: "allType" }))
      } else if (summaryType === "Order Summary") {
        dispatch(
          setSelectedVoucher({ title: "Sale Order", value: "saleOrder" })
        )
      }
    }
  }, [])
  console.log(summaryReport)
  useEffect(() => {
    if (salesummaryData && salesummaryData?.mergedsummary) {
      if (serialNumber.value !== "all") {
        const filteredserieslist = salesummaryData.mergedsummary.filter(
          (item) => item.seriesID === serialNumber.value
        )
        setSummaryReport(filteredserieslist)
      } else {
        setSummaryReport(salesummaryData.mergedsummary)
      }
    }
  }, [salesummaryData, cmp_id, serialNumber])
  const exportToExcel = () => {
    if (!summaryReport || summaryReport.length === 0) return
    // Function to format date
    const formatDate = (dateString) => {
      return dateString
        ? new Date(dateString).toISOString().split("T")[0]
        : "N/A"
    }

    // Function to format numbers
    const formatNumber = (number) => {
      return number ? Number(number).toFixed(2) : "0.00"
    }

    // Prepare worksheet data
    const worksheetData = []

    // Add headers based on selectedOption
    const headers = [
      getMainHeader(selectedOption),
      ...(selectedOption !== "voucher" ? ["Bill No"] : []),
      "Bill Date",
      getSecondaryHeader(selectedOption),
      getTertiaryHeader(selectedOption),
      getQuaternaryHeader(selectedOption),
      ...(selectedOption === "voucher" ? ["Category Name"] : []),
      "Gst No",
      "Hsn",
      "Batch",
      "Quantity",
      "Rate",
      "Discount",
      "Amount",
      "Tax%",
      "Tax Amount",
      "Cess%",
      "Cess Amount",
      "AddtlnCess",
      "AddtlnCessAmt",
      "Net Amount"
    ]
    worksheetData.push(headers)

    // Add data rows
    summaryReport.forEach((record) => {
      record.sale.forEach((saleItem) => {
        const row = [
          // Main identifier based on selectedOption
          selectedOption === "Ledger"
            ? record?.partyName
            : selectedOption === "Stock Group"
            ? record?.groupName
            : selectedOption === "Stock Category"
            ? record?.categoryName
            : selectedOption === "Stock Item"
            ? record?.itemName
            : selectedOption === "voucher"
            ? record?.voucherSeries
            : "",

          ...(selectedOption !== "voucher" ? [saleItem?.billnumber] : []),
          saleItem?.billDate,

          // Secondary column based on selectedOption
          selectedOption === "Ledger"
            ? saleItem?.itemName
            : selectedOption === "Stock Group"
            ? saleItem?.categoryName
            : selectedOption === "Stock Category"
            ? saleItem?.groupName
            : selectedOption === "Stock Item"
            ? saleItem?.partyName
            : selectedOption === "voucher"
            ? saleItem?.partyName
            : "",

          // Tertiary column based on selectedOption
          selectedOption === "Ledger"
            ? saleItem?.categoryName || "l"
            : selectedOption === "Stock Group"
            ? saleItem?.partyName
            : selectedOption === "Stock Category"
            ? saleItem?.itemName
            : selectedOption === "Stock Item"
            ? saleItem?.groupName || ""
            : selectedOption === "voucher"
            ? saleItem?.itemName
            : "",

          // Quaternary column based on selectedOption
          selectedOption === "Ledger"
            ? saleItem?.groupName || ""
            : selectedOption === "Stock Group"
            ? saleItem?.itemName
            : selectedOption === "Stock Category"
            ? saleItem?.partyName
            : selectedOption === "Stock Item"
            ? saleItem?.categoryName || ""
            : selectedOption === "voucher"
            ? saleItem?.groupName || ""
            : "",
          //if voucher,insert extra column before batch
          ...(selectedOption === "voucher"
            ? [
                selectedOption === "Ledger"
                  ? saleItem?.groupName || ""
                  : selectedOption === "Stock Group"
                  ? saleItem?.itemName
                  : selectedOption === "Stock Category"
                  ? saleItem?.partyName
                  : selectedOption === "Stock Item"
                  ? saleItem?.categoryName || ""
                  : selectedOption === "voucher"
                  ? saleItem?.categoryName || ""
                  : ""
              ]
            : []),
          saleItem?.gstNo,
          saleItem?.hsn,

          saleItem?.batch || "",
          saleItem?.quantity,
          saleItem.rate,
          formatNumber(saleItem?.discount),
          formatNumber(saleItem?.amount),
          saleItem.taxPercentage,
          formatNumber(saleItem?.taxAmount),
          saleItem?.cessPercentage,
          saleItem?.cessAmount,
          saleItem?.addtlnCess,
          saleItem?.addtnlnCessAmount,
          formatNumber(saleItem?.netAmount)
        ]
        worksheetData.push(row)
      })

      // Add total row for each group
      // const totalRow = new Array(14).fill("")
      // totalRow[0] = `Total for ${getMainHeader(selectedOption)}`
      // totalRow[13] = formatNumber(record.saleAmount)
      // worksheetData.push(totalRow)

      // Add empty row for separation
      worksheetData.push(new Array(14).fill(""))
    })

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(worksheetData)

    //dynamic colomn width
    const colWidths = headers.map((header, colIdx) => {
      // Start with header length
      let maxLen = header.length

      worksheetData.forEach((row) => {
        const val = row[colIdx]
        if (val !== null && val !== undefined) {
          const str = val.toString()
          if (str.length > maxLen) {
            maxLen = str.length
          }
        }
      })

      return { wch: maxLen + 2 } // +2 for a little padding
    })
    ws["!cols"] = colWidths
    // 🎨 Define styles
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F81BD" } }, // header background color
      alignment: { horizontal: "center", vertical: "center" }
    }
    // 🎨 Apply styles to header row
    headers.forEach((header, idx) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: idx })
      if (ws[cellAddress]) {
        ws[cellAddress].s = headerStyle
      }
    })
    const contentStyle = {
      alignment: { horizontal: "center", vertical: "center" }
    }

    // 🎨 Apply styles to content rows
    const range = XLSX.utils.decode_range(ws["!ref"])
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        if (ws[cellAddress]) {
          ws[cellAddress].s = contentStyle
        }
      }
    }

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sales Summary")

    // Generate Excel file
    XLSX.writeFile(
      wb,
      `Sales_Summary_${selectedOption}_${formatDate(new Date())}.xlsx`
    )
  }

  // Helper functions for header names
  function getMainHeader(selectedOption) {
    switch (selectedOption) {
      case "Ledger":
        return "Party Name"
      case "Stock Group":
        return "Group Name"
      case "Stock Category":
        return "Category Name"
      case "Stock Item":
        return "Item Name"
      case "voucher":
        return "Voucher Series"
      default:
        return ""
    }
  }

  function getSecondaryHeader(selectedOption) {
    switch (selectedOption) {
      case "Ledger":
        return "Item Name"
      case "Stock Group":
        return "Category Name"
      case "Stock Category":
        return "Group Name"
      case "Stock Item":
        return "Party Name"
      case "voucher":
        return "Party Name"
      default:
        return ""
    }
  }

  function getTertiaryHeader(selectedOption) {
    switch (selectedOption) {
      case "Ledger":
        return "Category Name"
      case "Stock Group":
        return "Party Name"
      case "Stock Category":
        return "Item Name"
      case "Stock Item":
        return "Group Name"
      case "voucher":
        return "Item Name"
      default:
        return ""
    }
  }

  function getQuaternaryHeader(selectedOption) {
    switch (selectedOption) {
      case "Ledger":
        return "Group Name"
      case "Stock Group":
        return "Item Name"
      case "Stock Category":
        return "Party Name"
      case "Stock Item":
        return "Category Name"
      case "voucher":
        return "Group Name"
      default:
        return ""
    }
  }
  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 ">
        <TitleDiv
          title={`${summaryType} Details`}
          from="/sUsers/summaryReport"
          summaryType={summaryType}
          rightSideContent={<RiFileExcel2Fill size={20} />}
          rightSideContentOnClick={exportToExcel}
        />
        {/* <button onClick={()=>{exportToExcel(summaryReport,selectedOption)}}>convet</button> */}
        <SelectDate />
        <section className="shadow-lg bg-white">
          <VoucherTypeFilter filterKeys={filterKeys} />
        </section>
        <div className="flex justify-between lg:justify-between gap-5 px-2 lg:gap-0  bg-white  border-t shadow-lg">
          <SummmaryDropdown />
          {voucherType.value !== "allType" && serialNumberList && (
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
                // setSummaryReport([])
              }}
              value={serialNumber.value}
              className="appearance-none border border-gray-200 rounded-md text-gray-500 px-4 py-2 pr-8 shadow-inner focus:outline-none cursor-pointer  pl-5 min-w-[150px]"
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
      </div>

      {loading && <CustomBarLoader />}

      {!loading && summaryReport && summaryReport.length > 0 ? (
        <div className="flex-1 flex flex-col bg-gray-50 rounded-lg shadow-lg mt-2 ">
          <div className="overflow-auto text-xs pb-5">
            <table className="w-full text-center border  ">
              <thead className="bg-gray-300">
                <tr className="">
                  <th className="p-2 font-semibold text-gray-600">
                    {" "}
                    {selectedOption === "Ledger"
                      ? "Party Name"
                      : selectedOption === "Stock Group"
                      ? "Group Name"
                      : selectedOption === "Stock Category"
                      ? "Category Name"
                      : selectedOption === "Stock Item"
                      ? "Item Name"
                      : selectedOption === "voucher"
                      ? "Series Name"
                      : ""}
                  </th>
                  {selectedOption !== "voucher" && (
                    <th className="p-2 font-semibold text-gray-600 text-nowrap">
                      Bill No
                    </th>
                  )}

                  <th className="p-2 font-semibold text-gray-600">Bill Date</th>
                  <th className="p-2 font-semibold text-gray-600">
                    {selectedOption === "Ledger"
                      ? "Item Name"
                      : selectedOption === "Stock Group"
                      ? "Category Name"
                      : selectedOption === "Stock Category"
                      ? "Group Name"
                      : selectedOption === "Stock Item"
                      ? "Party Name"
                      : "Party Name"}
                  </th>
                  {selectedOption === "voucher" && (
                    <th className="p-2 font-semibold text-gray-600">
                      {selectedOption === "Ledger"
                        ? "Item Name"
                        : selectedOption === "Stock Group"
                        ? "Category Name"
                        : selectedOption === "Stock Category"
                        ? "Group Name"
                        : selectedOption === "Stock Item"
                        ? "Party Name"
                        : "Item Name"}
                    </th>
                  )}

                  <th className="p-2 font-semibold text-gray-600">
                    {selectedOption === "Ledger"
                      ? "Category Name"
                      : selectedOption === "Stock Group"
                      ? "Party Name"
                      : selectedOption === "Stock Category"
                      ? "Item Name"
                      : selectedOption === "Stock Item"
                      ? "Group Name"
                      : "Group Name"}
                  </th>
                  <th className="p-2 font-semibold text-gray-600">
                    {" "}
                    {selectedOption === "Ledger"
                      ? "Group Name"
                      : selectedOption === "Stock Group"
                      ? "Item Name"
                      : selectedOption === "Stock Category"
                      ? "Party Name"
                      : selectedOption === "Stock Item"
                      ? "Category Name"
                      : "Category Name"}
                  </th>
                  <th className="p-2 font-semibold text-gray-600">Gst No</th>
                  <th className="p-2 font-semibold text-gray-600">HSN</th>
                  <th className="p-2 font-semibold text-gray-600">Batch</th>
                  <th className="p-2 font-semibold text-gray-600">Quantity</th>
                  <th className="p-2 font-semibold text-gray-600">Rate</th>
                  <th className="p-2 font-semibold text-gray-600">Discount</th>
                  <th className="p-2 font-semibold text-gray-600">Amount</th>
                  <th className="p-2 font-semibold text-gray-600">Tax%</th>
                  <th className="p-2 font-semibold text-gray-600">
                    Tax Amount
                  </th>
                  <th className="p-2 font-semibold text-gray-600">Cess%</th>
                  <th className="p-2 font-semibold text-gray-600">
                    Cess Amount
                  </th>
                  <th className="p-2 font-semibold text-gray-600">Add.Cess</th>
                  <th className="p-2 font-semibold text-gray-600">
                    Add.Cess.Amt
                  </th>
                  <th className="p-2 font-semibold text-gray-600">
                    Net Amount
                  </th>
                </tr>
              </thead>
              <tbody className="text-nowrap">
                {summaryReport?.map((party, partyIndex) => (
                  <>
                    {/* Add a thicker border between parties */}
                    {partyIndex !== 0 && (
                      <tr>
                        <td
                          colSpan={20}
                          className="h-1 bg-gray-300" // Adds a gray row for visual separation
                        />
                      </tr>
                    )}
                    {party?.sale.map((saleItem, saleIndex) => (
                      <tr
                        key={`${partyIndex}-${saleIndex}`}
                        className="border-b hover:bg-gray-100 transition duration-200 text-sm  "
                      >
                        {/* Display Party Name only for the first item in the sale array */}
                        {saleIndex === 0 ? (
                          <td
                            className="px-1 py-2 text-gray-800 font-bold text-xs cursor-pointer border text-nowrap"
                            rowSpan={party.sale.length} // Merge rows for the same party
                          >
                           
                            {party.itemType}
                          </td>
                        ) : null}
                        {selectedOption !== "voucher" && (
                          <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer text-nowrap">
                            {saleItem?.billnumber}
                          </td>
                        )}

                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer text-nowrap">
                          {saleItem.billDate}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer text-nowrap">
                          {selectedOption === "Ledger"
                            ? saleItem?.itemName
                            : selectedOption === "Stock Group"
                            ? saleItem?.categoryName
                            : selectedOption === "Stock Category"
                            ? saleItem?.groupName
                            : selectedOption === "Stock Item"
                            ? saleItem?.partyName
                            : saleItem?.partyName}
                        </td>
                        {selectedOption === "voucher" && (
                          <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer text-nowrap">
                            {selectedOption === "Ledger"
                              ? saleItem?.itemName
                              : selectedOption === "Stock Group"
                              ? saleItem?.categoryName
                              : selectedOption === "Stock Category"
                              ? saleItem?.groupName
                              : selectedOption === "Stock Item"
                              ? saleItem?.partyName
                              : saleItem?.itemName}
                          </td>
                        )}

                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {selectedOption === "Ledger"
                            ? saleItem?.categoryName
                            : selectedOption === "Stock Group"
                            ? saleItem?.partyName
                            : selectedOption === "Stock Category"
                            ? saleItem?.itemName
                            : selectedOption === "Stock Item"
                            ? saleItem?.groupName
                            : saleItem?.groupName}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {selectedOption === "Ledger"
                            ? saleItem?.groupName
                            : selectedOption === "Stock Group"
                            ? saleItem?.itemName
                            : selectedOption === "Stock Category"
                            ? saleItem?.partyName
                            : selectedOption === "Stock Item"
                            ? saleItem?.categoryName
                            : saleItem?.categoryName}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.gstNo || ""}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.hsn || ""}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.batch || ""}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.quantity}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.rate}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.discount}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {Number(saleItem?.amount).toFixed(2)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.taxPercentage}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {Number(saleItem?.taxAmount).toFixed(2)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.cessPercentage}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {Number(saleItem?.cessAmount).toFixed(2)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {Number(saleItem?.addtlnCess).toFixed(2)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {Number(saleItem?.addtnlnCessAmount).toFixed(2)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.netAmount}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center h-full mt-10 font-bold text-gray-500">
            <p>No data available</p>
          </div>
        )
      )}
    </div>
  )
}
export default SalesSummaryTable
