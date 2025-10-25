/* eslint-disable no-prototype-builtins */
import { useState, useEffect, useMemo, useCallback } from "react"
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

// Helper functions moved outside component for better performance
const getMainHeader = (selectedOption) => {
  const headerMap = {
    "Ledger": "Party Name",
    "Stock Group": "Group Name", 
    "Stock Category": "Category Name",
    "Stock Item": "Item Name",
    "voucher": "Voucher Series"
  }
  return headerMap[selectedOption] || ""
}

const getSecondaryHeader = (selectedOption) => {
  const headerMap = {
    "Ledger": "Item Name",
    "Stock Group": "Category Name",
    "Stock Category": "Group Name", 
    "Stock Item": "Product Code", // Updated for Stock Item
    "voucher": "Party Name"
  }
  return headerMap[selectedOption] || ""
}

const getTertiaryHeader = (selectedOption) => {
  const headerMap = {
    "Ledger": "Category Name",
    "Stock Group": "Party Name",
    "Stock Category": "Item Name",
    "Stock Item": "Party Name", // Updated order
    "voucher": "Item Name"
  }
  return headerMap[selectedOption] || ""
}

const getQuaternaryHeader = (selectedOption) => {
  const headerMap = {
    "Ledger": "Group Name",
    "Stock Group": "Item Name", 
    "Stock Category": "Party Name",
    "Stock Item": "Group Name", // Updated order
    "voucher": "Group Name"
  }
  return headerMap[selectedOption] || ""
}

const formatDate = (dateString) => {
  return dateString ? new Date(dateString).toISOString().split("T")[0] : "N/A"
}

const formatNumber = (number) => {
  return number ? Number(number).toFixed(2) : "0.00"
}

function SalesSummaryTable() {
  const [summaryReport, setSummaryReport] = useState([])
  const location = useLocation()
  const dispatch = useDispatch()
  const { summaryType = "Sales Summary" } = location.state || {}

  // Selectors
  const { start, end } = useSelector((state) => state.date)
  const cmp_id = useSelector((state) => state.secSelectedOrganization.secSelectedOrg._id)
  const voucherType = useSelector((state) => state.voucherType.selectedVoucher)
  const selectedOption = useSelector((state) => state.summaryFilter.selectedOption)
  const serialNumber = useSelector((state) => state.serialNumber.selectedSerialNumber)

  // Memoized filter keys
  const filterKeys = useMemo(() => {
    if (summaryType?.toLowerCase().includes("sale")) {
      return ["allType", "sale", "vanSale", "creditNote"]
    } else if (summaryType?.toLowerCase().includes("purchase")) {
      return ["allType", "purchase", "debitNote"]
    } else if (summaryType.toLowerCase().includes("order")) {
      return ["saleOrder"]
    }
    return []
  }, [summaryType])

  // Memoized URL
  const salesummaryUrl = useMemo(() => {
    if (start && end && voucherType.value !== "all") {
      return `/api/sUsers/salesSummary/${cmp_id}?startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=${voucherType.value}&summaryType=${summaryType}&selectedOption=${selectedOption}`
    }
    return null
  }, [start, end, cmp_id, voucherType.value, selectedOption, summaryType])

  // Serial number query
  const { data: serialNumberList } = useQuery({
    queryKey: ["serialNumbers", cmp_id, voucherType.value],
    queryFn: async () => {
      const res = await api.get(
        `/api/sUsers/getSeriesByVoucher/${cmp_id}?voucherType=${voucherType.value}`,
        { withCredentials: true }
      )
      return res.data
    },
    enabled: !!cmp_id && !!voucherType.value && voucherType.title !== "All Vouchers" && voucherType.value !== "allType",
    staleTime: 30000,
    retry: false
  })

  // Fetch sales summary data
  const { data: salesummaryData, loading } = useFetch(salesummaryUrl)

  // Initialize voucher type on mount
  useEffect(() => {
    if (voucherType.title === "All Vouchers") {
      if (summaryType === "Sales Summary" || summaryType === "Purchase Summary") {
        dispatch(setSelectedVoucher({ title: "All", value: "allType" }))
      } else if (summaryType === "Order Summary") {
        dispatch(setSelectedVoucher({ title: "Sale Order", value: "saleOrder" }))
      }
    }
  }, [dispatch, summaryType, voucherType.title])

  // Update summary report based on data and filters
  useEffect(() => {
    if (salesummaryData?.mergedsummary) {
      if (serialNumber.value !== "all") {
        const filteredSeriesList = salesummaryData.mergedsummary.filter(
          (item) => item.seriesID === serialNumber.value
        )
        setSummaryReport(filteredSeriesList)
      } else {
        setSummaryReport(salesummaryData.mergedsummary)
      }
    }
  }, [salesummaryData, serialNumber.value])

  // Get cell value based on selected option and field
  const getCellValue = useCallback((saleItem, field, selectedOption) => {
    const valueMap = {
      secondary: {
        "Ledger": saleItem?.itemName,
        "Stock Group": saleItem?.categoryName,
        "Stock Category": saleItem?.groupName,
        "Stock Item": saleItem?.product_code, // Updated for Stock Item
        "voucher": saleItem?.partyName
      },
      tertiary: {
        "Ledger": saleItem?.categoryName,
        "Stock Group": saleItem?.partyName,
        "Stock Category": saleItem?.itemName,
        "Stock Item": saleItem?.partyName, // Updated order
        "voucher": saleItem?.itemName
      },
      quaternary: {
        "Ledger": saleItem?.groupName,
        "Stock Group": saleItem?.itemName,
        "Stock Category": saleItem?.partyName,
        "Stock Item": saleItem?.groupName, // Updated order
        "voucher": saleItem?.groupName
      }
    }
    return valueMap[field]?.[selectedOption] || ""
  }, [])

  // Export to Excel function
  const exportToExcel = useCallback(() => {
    if (!summaryReport || summaryReport.length === 0) return

    const worksheetData = []

    // Create headers with Item MRP before HSN
    const headers = [
      getMainHeader(selectedOption),
      ...(selectedOption !== "voucher" ? ["Bill No"] : []),
      "Bill Date",
      getSecondaryHeader(selectedOption),
      getTertiaryHeader(selectedOption),
      getQuaternaryHeader(selectedOption),
      ...(selectedOption === "voucher" ? ["Category Name", "Product Code"] : []),
      "Gst No", "Item MRP", "Hsn", "Batch", "Quantity", "Rate", "Discount", "Amount",
      "Tax%", "Tax Amount", "Cess%", "Cess Amount", "AddtlnCess", "AddtlnCessAmt", "Net Amount"
    ]
    worksheetData.push(headers)

    // Add data rows
    summaryReport.forEach((record) => {
      record.sale.forEach((saleItem) => {
        const row = [
          record.itemType,
          ...(selectedOption !== "voucher" ? [saleItem?.billnumber] : []),
          saleItem?.billDate,
          getCellValue(saleItem, 'secondary', selectedOption),
          getCellValue(saleItem, 'tertiary', selectedOption),
          getCellValue(saleItem, 'quaternary', selectedOption),
          ...(selectedOption === "voucher" ? [saleItem?.categoryName || "", saleItem?.product_code || ""] : []),
          saleItem?.gstNo, 
          saleItem?.item_mrp || "", // Added Item MRP
          saleItem?.hsn, 
          saleItem?.batch || "",
          saleItem?.quantity, saleItem.rate, formatNumber(saleItem?.discount),
          formatNumber(saleItem?.amount), saleItem.taxPercentage,
          formatNumber(saleItem?.taxAmount), saleItem?.cessPercentage,
          saleItem?.cessAmount, saleItem?.addtlnCess,
          saleItem?.addtnlnCessAmount, formatNumber(saleItem?.netAmount)
        ]
        worksheetData.push(row)
      })
      worksheetData.push(new Array(headers.length).fill(""))
    })

    // Create workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(worksheetData)

    // Set column widths
    const colWidths = headers.map((header, colIdx) => {
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
      return { wch: maxLen + 2 }
    })
    ws["!cols"] = colWidths

    // Apply styles
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F81BD" } },
      alignment: { horizontal: "center", vertical: "center" }
    }

    headers.forEach((header, idx) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: idx })
      if (ws[cellAddress]) {
        ws[cellAddress].s = headerStyle
      }
    })

    const contentStyle = {
      alignment: { horizontal: "center", vertical: "center" }
    }

    const range = XLSX.utils.decode_range(ws["!ref"])
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        if (ws[cellAddress]) {
          ws[cellAddress].s = contentStyle
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Sales Summary")
    XLSX.writeFile(wb, `Sales_Summary_${selectedOption}_${formatDate(new Date())}.xlsx`)
  }, [summaryReport, selectedOption, getCellValue])

  // Serial number change handler
  const handleSerialNumberChange = useCallback((e) => {
    const selectedId = e.target.value
    const selectedItem = serialNumberList?.series?.find((item) => item._id === selectedId)
    
    dispatch(setSelectedSerialNumber({
      title: selectedItem?.seriesName || "All SerialNumber",
      value: selectedId
    }))
  }, [dispatch, serialNumberList?.series])

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0">
        <TitleDiv
          title={`${summaryType} Details`}
          from="/sUsers/summaryReport"
          summaryType={summaryType}
          rightSideContent={<RiFileExcel2Fill size={20} />}
          rightSideContentOnClick={exportToExcel}
        />
        <SelectDate />
        <section className="shadow-lg bg-white">
          <VoucherTypeFilter filterKeys={filterKeys} />
        </section>
        <div className="flex justify-between lg:justify-between gap-5 px-2 lg:gap-0 bg-white border-t shadow-lg">
          <SummmaryDropdown />
          {voucherType.value !== "allType" && serialNumberList && (
            <select
              onChange={handleSerialNumberChange}
              value={serialNumber.value}
              className="appearance-none border border-gray-200 rounded-md text-gray-500 px-4 py-2 pr-8 shadow-inner focus:outline-none cursor-pointer pl-5 min-w-[150px]"
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
        <div className="flex-1 flex flex-col bg-gray-50 rounded-lg shadow-lg mt-2">
          <div className="overflow-auto text-xs pb-5">
            <table className="w-full text-center border">
              <thead className="bg-gray-300">
                <tr>
                  <th className="p-2 font-semibold text-gray-600">
                    {getMainHeader(selectedOption)}
                  </th>
                  {selectedOption !== "voucher" && (
                    <th className="p-2 font-semibold text-gray-600 text-nowrap">Bill No</th>
                  )}
                  <th className="p-2 font-semibold text-gray-600">Bill Date</th>
                  <th className="p-2 font-semibold text-gray-600">
                    {getSecondaryHeader(selectedOption)}
                  </th>
                  <th className="p-2 font-semibold text-gray-600">
                    {getTertiaryHeader(selectedOption)}
                  </th>
                  <th className="p-2 font-semibold text-gray-600">
                    {getQuaternaryHeader(selectedOption)}
                  </th>
                  {selectedOption === "voucher" && (
                    <>
                      <th className="p-2 font-semibold text-gray-600">Category Name</th>
                      <th className="p-2 font-semibold text-gray-600">Product Code</th>
                    </>
                  )}
                  <th className="p-2 font-semibold text-gray-600">Gst No</th>
                  <th className="p-2 font-semibold text-gray-600">Item MRP</th>
                  <th className="p-2 font-semibold text-gray-600">HSN</th>
                  <th className="p-2 font-semibold text-gray-600">Batch</th>
                  <th className="p-2 font-semibold text-gray-600">Quantity</th>
                  <th className="p-2 font-semibold text-gray-600">Rate</th>
                  <th className="p-2 font-semibold text-gray-600">Discount</th>
                  <th className="p-2 font-semibold text-gray-600">Amount</th>
                  <th className="p-2 font-semibold text-gray-600">Tax%</th>
                  <th className="p-2 font-semibold text-gray-600">Tax Amount</th>
                  <th className="p-2 font-semibold text-gray-600">Cess%</th>
                  <th className="p-2 font-semibold text-gray-600">Cess Amount</th>
                  <th className="p-2 font-semibold text-gray-600">Add.Cess</th>
                  <th className="p-2 font-semibold text-gray-600">Add.Cess.Amt</th>
                  <th className="p-2 font-semibold text-gray-600">Net Amount</th>
                </tr>
              </thead>
              <tbody className="text-nowrap">
                {summaryReport?.map((party, partyIndex) => (
                  <>
                    {partyIndex !== 0 && (
                      <tr>
                        <td colSpan={selectedOption === "voucher" ? 24 : 22} className="h-1 bg-gray-300" />
                      </tr>
                    )}
                    {party?.sale.map((saleItem, saleIndex) => {
                      // console.log(saleItem);
                      
                      return (
                      <tr
                        key={`${partyIndex}-${saleIndex}`}
                        className="border-b hover:bg-gray-100 transition duration-200 text-sm"
                      >
                        {saleIndex === 0 && (
                          <td
                            className="px-1 py-2 text-gray-800 font-bold text-xs cursor-pointer border text-nowrap"
                            rowSpan={party.sale.length}
                          >
                            {party.itemType}
                          </td>
                        )}
                        {selectedOption !== "voucher" && (
                          <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer text-nowrap">
                            {saleItem?.billnumber}
                          </td>
                        )}
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer text-nowrap">
                          {saleItem.billDate}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer text-nowrap">
                          {getCellValue(saleItem, 'secondary', selectedOption)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {getCellValue(saleItem, 'tertiary', selectedOption)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {getCellValue(saleItem, 'quaternary', selectedOption)}
                        </td>
                        {selectedOption === "voucher" && (
                          <>
                            <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                              {saleItem?.categoryName || ""}
                            </td>
                            <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                              {saleItem?.product_code || ""}
                            </td>
                          </>
                        )}
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.gstNo || ""}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.item_mrp || ""}
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
                          {formatNumber(saleItem?.amount)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.taxPercentage}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {formatNumber(saleItem?.taxAmount)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.cessPercentage}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {formatNumber(saleItem?.cessAmount)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {formatNumber(saleItem?.addtlnCess)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {formatNumber(saleItem?.addtnlnCessAmount)}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.netAmount}
                        </td>
                      </tr>
                    )})}
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