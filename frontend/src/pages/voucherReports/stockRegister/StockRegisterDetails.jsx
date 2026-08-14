import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import TitleDiv from "@/components/common/TitleDiv"
import * as XLSX from "xlsx-js-style"
import { RiFileExcel2Fill } from "react-icons/ri"
import SelectDate from "@/components/Filters/SelectDate"
import { PropagateLoader } from "react-spinners"
import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/api/api"
import { useSelector, useDispatch } from "react-redux"
import { addDate } from "../../../../slices/filterSlices/date"
import { ChevronDown, ChevronRight, Search, X } from "lucide-react"

const PAGE_LIMIT = 30

const buildStockRegisterUrl = ({
  cmp_id,
  start,
  end,
  title,
  tenure,
  selectedBrand,
  selectedCategory,
  searchTerm,
  page,
  limit,
  exportAll = false
}) => {
  const params = new URLSearchParams({
    start,
    end,
    title: title || "",
    tenureStart: tenure?.start || "",
    tenureEnd: tenure?.end || "",
    page: String(page),
    limit: String(limit)
  })

  if (selectedBrand && selectedBrand !== "All") {
    params.set("brand", selectedBrand)
  }

  if (selectedCategory && selectedCategory !== "All") {
    params.set("category", selectedCategory)
  }

  if (searchTerm?.trim()) {
    params.set("search", searchTerm.trim())
  }

  if (exportAll) {
    params.set("export", "true")
  }

  return `/api/sUsers/stockregisterSummary/${cmp_id}?${params.toString()}`
}

const numberValue = (value) => Number(value || 0)

const formatQuantity = (value) => {
  const number = numberValue(value)
  if (Number.isInteger(number)) return number.toString()
  return number.toFixed(2).replace(/\.?0+$/, "")
}

const formatAmount = (value) => numberValue(value).toFixed(2)

const getRowKey = (row, index) =>
  row?._stockRegisterKey ||
  `${row?.itemName || "stock-item"}-${row?.brand || "no-brand"}-${
    row?.category || "no-category"
  }-${index}`

const getMappedRowKey = (row, index) =>
  row?._stockRegisterKey ||
  `${row?.itemName || "stock-item"}-${row?.batch || "batch"}-${
    row?.godown || "godown"
  }-${index}`

const selectClassName =
  "h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none shadow-sm transition focus:border-[rgb(51,98,135)] focus:ring-2 focus:ring-blue-100"

const headerCellClassName =
  "border border-blue-200 px-3 py-2 text-center text-xs font-semibold uppercase tracking-normal"

const bodyNumberCellClassName =
  "border-b border-r border-gray-100 px-3 py-2 text-right tabular-nums text-gray-700"

const detailNumberCellClassName =
  "border-b border-r border-blue-100 px-3 py-2 text-right tabular-nums text-gray-700"

export default function StockRegisterDetails() {
  const [tenure, setTenure] = useState({
    start: "",
    end: ""
  })
  const [brand, setBrand] = useState([])
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [category, setCategory] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedItemName, setSelectedItemName] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const tableScrollRef = useRef(null)
  const loadMoreRef = useRef(null)
  const dispatch = useDispatch()

  const { start, end, initial, title } = useSelector((state) => state.date)

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  )

  const queryFilters = useMemo(
    () => ({
      cmp_id,
      start,
      end,
      title,
      tenure,
      selectedBrand,
      selectedCategory,
      searchTerm: debouncedSearchTerm
    }),
    [
      cmp_id,
      start,
      end,
      title,
      tenure,
      selectedBrand,
      selectedCategory,
      debouncedSearchTerm
    ]
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ["stockRegister", queryFilters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(
        buildStockRegisterUrl({
          ...queryFilters,
          page: pageParam,
          limit: PAGE_LIMIT
        }),
        { withCredentials: true }
      )
      return res.data
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.result?.pagination
      if (!pagination) return undefined

      if (typeof pagination.hasNextPage === "boolean") {
        return pagination.hasNextPage ? pagination.page + 1 : undefined
      }

      return pagination.page < pagination.totalPages
        ? pagination.page + 1
        : undefined
    },
    enabled:
      !!cmp_id &&
      !!start &&
      !!tenure?.start &&
      !!tenure?.end,
    staleTime: 30000,
    retry: false
  })

  const pages = data?.pages || []

  const individualArray = useMemo(() => {
    const seen = new Set()

    return pages
      .flatMap((page) => page?.result?.individualArray || [])
      .filter((item, index) => {
        const key = getRowKey(item, index)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  }, [pages])

  const mappedArray = useMemo(() => {
    const seen = new Set()

    return pages
      .flatMap((page) => page?.result?.mappedArray || [])
      .filter((item, index) => {
        const key = getMappedRowKey(item, index)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  }, [pages])

  const pagination = pages[pages.length - 1]?.result?.pagination

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
  }, [dispatch, initial])

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
    }
  }, [end, initial, start, title])

  useEffect(() => {
    const filterOptions = pages[0]?.result?.filterOptions
    const fallbackItems = pages.flatMap(
      (page) => page?.result?.individualArray || []
    )

    const uniqueBrands =
      filterOptions?.brands ||
      [...new Set(fallbackItems.map((p) => p?.brand).filter(Boolean))]
    const uniqueCategory =
      filterOptions?.categories ||
      [...new Set(fallbackItems.map((p) => p?.category).filter(Boolean))]

    setBrand(uniqueBrands)
    setCategory(uniqueCategory)
  }, [pages])

  useEffect(() => {
    setSelectedItemName(null)
    tableScrollRef.current?.scrollTo({ top: 0, left: 0 })
  }, [
    cmp_id,
    start,
    end,
    title,
    tenure,
    selectedBrand,
    selectedCategory,
    debouncedSearchTerm
  ])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 350)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return
    fetchNextPage()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    const sentinel = loadMoreRef.current
    const root = tableScrollRef.current

    if (!sentinel || !root || !hasNextPage) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore()
        }
      },
      {
        root,
        rootMargin: "180px 0px",
        threshold: 0.1
      }
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [handleLoadMore, hasNextPage, individualArray.length])

  const getExportRows = async () => {
    const res = await api.get(
      buildStockRegisterUrl({
        ...queryFilters,
        page: 1,
        limit: "all",
        exportAll: true
      }),
      { withCredentials: true }
    )

    return res?.data?.result?.individualArray || []
  }

  const exportToExcel = async () => {
    try {
      setIsExporting(true)
      const exportRows = await getExportRows()

      if (!exportRows || exportRows?.length === 0) return

      const formatDate = (dateString) =>
        dateString ? new Date(dateString).toISOString()?.split("T")[0] : "N/A"

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

      exportRows.forEach((record) => {
        const row = [
          record.itemName,
          record.opening?.quantity,
          record.opening?.rate,
          record.opening?.amount,
          record.inward?.quantity,
          record.inward?.rate,
          record.inward?.amount,
          record.outward?.quantity,
          record.outward?.rate,
          record.outward?.amount,
          record.closing?.quantity,
          record.closing?.rate,
          record.closing?.amount
        ]
        worksheetData.push(row)
      })

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(worksheetData)

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
        { s: { r: 0, c: 1 }, e: { r: 0, c: 3 } },
        { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } },
        { s: { r: 0, c: 7 }, e: { r: 0, c: 9 } },
        { s: { r: 0, c: 10 }, e: { r: 0, c: 12 } }
      ]

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

      const borderAll = {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }

      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "336287" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: borderAll
      }

      const contentStyle = {
        alignment: { horizontal: "center", vertical: "center" },
        border: borderAll
      }

      for (let R = 0; R <= 1; R++) {
        for (let C = 0; C < worksheetData[0].length; C++) {
          const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
          if (ws[cellRef]) {
            ws[cellRef].s = headerStyle
          }
        }
      }

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
    } finally {
      setIsExporting(false)
    }
  }

  const renderMovementCells = (record, detail = false) => {
    const cellClassName = detail
      ? detailNumberCellClassName
      : bodyNumberCellClassName

    return (
      <>
        <td className={cellClassName}>{formatQuantity(record?.opening?.quantity)}</td>
        <td className={cellClassName}>{formatAmount(record?.opening?.rate)}</td>
        <td className={cellClassName}>{formatAmount(record?.opening?.amount)}</td>
        <td className={cellClassName}>{formatQuantity(record?.inward?.quantity)}</td>
        <td className={cellClassName}>{formatAmount(record?.inward?.rate)}</td>
        <td className={cellClassName}>{formatAmount(record?.inward?.amount)}</td>
        <td className={cellClassName}>{formatQuantity(record?.outward?.quantity)}</td>
        <td className={cellClassName}>{formatAmount(record?.outward?.rate)}</td>
        <td className={cellClassName}>{formatAmount(record?.outward?.amount)}</td>
        <td className={cellClassName}>{formatQuantity(record?.closing?.quantity)}</td>
        <td className={cellClassName}>{formatAmount(record?.closing?.rate)}</td>
        <td className={cellClassName}>{formatAmount(record?.closing?.amount)}</td>
      </>
    )
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gray-50">
      <TitleDiv
        title="Stock Details"
        rightSideContent={
          <div className="flex items-center gap-2">
            {isExporting && (
              <span className="hidden text-xs font-medium text-gray-500 sm:inline">
                Exporting
              </span>
            )}
            <RiFileExcel2Fill size={20} />
          </div>
        }
        rightSideContentOnClick={isExporting ? undefined : exportToExcel}
      />

      <div className="shrink-0 bg-white">
        <SelectDate />

        <div className="mx-3 mb-3 rounded-md border border-gray-100 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2">
              <label
                htmlFor="stock-search"
                className="text-sm font-medium text-gray-700"
              >
                Search Item
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="stock-search"
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search item name"
                  className="h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-700 outline-none shadow-sm transition placeholder:text-gray-400 focus:border-[rgb(51,98,135)] focus:ring-2 focus:ring-blue-100"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Clear item search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="brand" className="text-sm font-medium text-gray-700">
                Brand
              </label>
              <select
                id="brand"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className={selectClassName}
              >
                <option value="All">All</option>
                {brand.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={selectClassName}
              >
                <option value="All">All</option>
                {category.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end text-xs text-gray-500 lg:justify-end">
              {pagination?.total ? (
                <span>
                  Showing {individualArray.length} of {pagination.total} records
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 px-2 pb-2 sm:px-3 sm:pb-3">
        <div
          ref={tableScrollRef}
          className="h-full overflow-x-auto overflow-y-auto overscroll-contain rounded-md border border-gray-200 bg-white shadow-sm scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-400"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarGutter: "stable both-edges"
          }}
        >
          <table className="w-full min-w-[1180px] border-collapse text-sm">
            <thead className="sticky top-0 z-30 bg-[rgb(51,98,135)] text-white shadow-sm">
              <tr>
                <th
                  rowSpan="2"
                  className={`${headerCellClassName} min-w-[260px] bg-[rgb(51,98,135)]`}
                >
                  Item
                </th>
                <th colSpan="3" className={headerCellClassName}>
                  Opening
                </th>
                <th colSpan="3" className={headerCellClassName}>
                  Inward
                </th>
                <th colSpan="3" className={headerCellClassName}>
                  Outward
                </th>
                <th colSpan="3" className={headerCellClassName}>
                  Closing
                </th>
              </tr>
              <tr>
                {["Quantity", "Rate", "Amount"].map((label) => (
                  <React.Fragment key={`opening-${label}`}>
                    <th className={`${headerCellClassName} min-w-[92px]`}>
                      {label}
                    </th>
                  </React.Fragment>
                ))}
                {["Quantity", "Rate", "Amount"].map((label) => (
                  <React.Fragment key={`inward-${label}`}>
                    <th className={`${headerCellClassName} min-w-[92px]`}>
                      {label}
                    </th>
                  </React.Fragment>
                ))}
                {["Quantity", "Rate", "Amount"].map((label) => (
                  <React.Fragment key={`outward-${label}`}>
                    <th className={`${headerCellClassName} min-w-[92px]`}>
                      {label}
                    </th>
                  </React.Fragment>
                ))}
                {["Quantity", "Rate", "Amount"].map((label) => (
                  <React.Fragment key={`closing-${label}`}>
                    <th className={`${headerCellClassName} min-w-[92px]`}>
                      {label}
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={13} className="h-56 p-4 text-center">
                    <div className="flex h-full items-center justify-center">
                      <PropagateLoader
                        color="#3b82f6"
                        size={10}
                        speedMultiplier={1}
                      />
                    </div>
                  </td>
                </tr>
              ) : individualArray.length > 0 ? (
                individualArray.map((row, rowIndex) => {
                  const isExpanded = selectedItemName === row.itemName
                  const itemDetails = mappedArray.filter(
                    (m) => m?.itemName === row?.itemName
                  )

                  return (
                    <React.Fragment key={getRowKey(row, rowIndex)}>
                      <tr
                        onClick={() =>
                          setSelectedItemName((prev) =>
                            prev === row.itemName ? null : row.itemName
                          )
                        }
                        className={`group cursor-pointer transition hover:bg-blue-50 ${
                          rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td
                          className={`border-b border-r border-gray-100 px-3 py-2 text-left font-medium text-gray-800 ${
                            rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } group-hover:bg-blue-50`}
                        >
                          <span className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 shrink-0 text-gray-500" />
                            )}
                            <span className="break-words">{row.itemName}</span>
                          </span>
                        </td>
                        {renderMovementCells(row)}
                      </tr>

                      {isExpanded &&
                        itemDetails.map((m, idx) => (
                          <tr
                            key={getMappedRowKey(m, idx)}
                            className="bg-blue-50/70"
                          >
                            <td className="border-b border-r border-blue-100 bg-blue-50 px-3 py-2 text-left text-xs font-medium text-gray-700">
                              <span className="block pl-6">
                                {m?.batch || "Primary Batch"} |{" "}
                                {m?.godown || "Godown"}
                              </span>
                            </td>
                            {renderMovementCells(m, true)}
                          </tr>
                        ))}
                    </React.Fragment>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={13} className="h-56 p-4 text-center">
                    <div className="flex h-full items-center justify-center text-sm font-medium text-gray-500">
                      No stock records found
                    </div>
                  </td>
                </tr>
              )}

              {individualArray.length > 0 && (
                <tr ref={loadMoreRef}>
                  <td colSpan={13} className="p-3 text-center text-xs text-gray-500">
                    {isFetchingNextPage ? (
                      <div className="flex items-center justify-center py-2">
                        <PropagateLoader
                          color="#3b82f6"
                          size={8}
                          speedMultiplier={1}
                        />
                      </div>
                    ) : hasNextPage ? (
                      "Loading more records..."
                    ) : (
                      "All records loaded"
                    )}
                  </td>
                </tr>
              )}

              {isFetching && !isFetchingNextPage && !isLoading && (
                <tr>
                  <td colSpan={13} className="p-2 text-center text-xs text-gray-400">
                    Refreshing stock records...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
