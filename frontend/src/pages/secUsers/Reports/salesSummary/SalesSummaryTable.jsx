/* eslint-disable no-prototype-builtins */
import { useState, useEffect, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import api from "@/api/api"
import TitleDiv from "../../../../components/common/TitleDiv"
import SummmaryDropdown from "../../../../components/Filters/SummaryDropdown"
import SelectDate from "../../../../components/Filters/SelectDate"
import { useDispatch, useSelector } from "react-redux"
// import { setSelectedVoucher } from "slices/filterSlices/voucherType"
import { setSelectedVoucher } from "../../../../../../frontend/slices/filterSlices/voucherType"
import { setSelectedSerialNumber } from "../../../../../../frontend/slices/filterSlices/serialNumberFilter"
import VoucherTypeFilter from "@/components/Filters/VoucherTypeFilter"
import useFetch from "../../../../customHook/useFetch"
import CustomBarLoader from "../../../../components/common/CustomBarLoader"
// import * as XLSX from "xlsx"
import * as XLSX from "xlsx-js-style"
import { RiFileExcel2Fill } from "react-icons/ri"
function SalesSummaryTable() {
  const [summaryReport, setSummaryReport] = useState([])
  const [summary, setSummary] = useState([])
  // const [selectedSerialNumber,setselectedSerialNumber]=
  const location = useLocation()
  const dispatch = useDispatch()
  const { summaryType="Sales Summary" } = location.state||{}
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
      return `/api/sUsers/salesSummary/${cmp_id}?startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=${voucherType.value}&summaryType=${summaryType}`
    }
    return null // Or return an empty string if preferred
  }, [start, end, cmp_id, voucherType.value])
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
      !!cmp_id && !!voucherType.value && voucherType.title !== "All Vouchers",
    // voucherType.value !== "allType",
    staleTime: 30000,
    retry: false
  })
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

  useEffect(() => {
    if (salesummaryData && salesummaryData?.flattenedResults) {
      if (serialNumber.value !== "all") {
        const filteredserieslist = salesummaryData.flattenedResults.filter(
          (item) => item.series_id === serialNumber.value
        )
        setSummary(filteredserieslist)
      } else {
        setSummary(salesummaryData.flattenedResults)
      }
    }
  }, [salesummaryData, cmp_id, serialNumber])
  useEffect(() => {
    if (summary && summary.length > 0) {
      // setSelectedIndex(null);
      handleFilter(selectedOption)
    }
  }, [summary, selectedOption])

  /// calculate tax
  const calculateTaxAndPrice = (
    isTaxInclusive,
    itemPrice,
    count,
    igst,
    discount
  ) => {
    const basePrice = isTaxInclusive
      ? Number(((itemPrice * count) / (1 + igst / 100)).toFixed(2))
      : Number(itemPrice * count).toFixed(2)

    const discountedPrice = Number((basePrice - (discount || 0)).toFixed(2))
    const taxAmount = Number(((discountedPrice * igst) / 100).toFixed(2))

    return { basePrice, taxAmount }
  }

  /// checking godownOnly
  const isGodownOnly = (product) => {
    if (
      product.GodownList.every((item) => item.godown_id) &&
      product.GodownList.every((item) => !item.hasOwnProperty("batch"))
    ) {
      return true
    } else {
      false
    }
  }
  ////  process clubbing of godown
  const processGodownMerging = (item, saleObject, sale) => {
    // Initialize aggregation variables
    const aggregation = {
      totalQuantity: 0,
      totalDiscount: 0,
      totalIndividualTotal: 0,
      totalBasePrice: 0,
      totalTaxAmount: 0,
      rate: 0
    }

    item.GodownList.forEach((items) => {
      if (items.added) {
        // Sum quantity, discount, and individual total
        aggregation.totalQuantity += items?.count || 0
        aggregation.totalDiscount += items?.discountAmount || 0
        aggregation.totalIndividualTotal += items?.individualTotal || 0
        aggregation.rate = items?.selectedPriceRate

        // Calculate base price
        let basePrice, taxAmount
        if (item.isTaxInclusive) {
          basePrice = Number(
            (
              (items?.selectedPriceRate * items?.count) /
              (1 + item?.igst / 100)
            ).toFixed(2)
          )

          const discountedPrice = Number(
            (basePrice - (items?.discountAmount || 0)).toFixed(2)
          )

          taxAmount = Number(
            ((discountedPrice * items.igstValue) / 100).toFixed(2)
          )
        } else {
          basePrice = items.selectedPriceRate * items?.count

          const discountedPrice = Number(
            (basePrice - (items?.discount || 0)).toFixed(2)
          )

          taxAmount = Number(((discountedPrice * item.igst) / 100).toFixed(2))
        }

        // Sum base price and tax amount
        aggregation.totalBasePrice += basePrice
        aggregation.totalTaxAmount += taxAmount
      }
    })

    // Use aggregation results as needed
    saleObject.sale.push({
      billnumber:
        sale?.salesNumber ||
        sale?.creditNoteNumber ||
        sale?.debitNoteNumber ||
        sale?.purchaseNumber,
      billDate: sale?.date,
      itemName: item?.product_name,
      partyName: sale?.party?.partyName,
      batch: "Nill",
      groupName: item?.brand?.brand, //brandname
      categoryName: item?.category?.category, //categoryname
      quantity: aggregation?.totalQuantity,
      rate: aggregation?.rate,
      discount: aggregation?.totalDiscount,
      taxPercentage: item?.igst,
      taxAmount: aggregation?.totalTaxAmount,
      netAmount: aggregation?.totalIndividualTotal,
      amount: aggregation?.totalBasePrice
    })
    return saleObject.sale
  }
  const handleFilter = (option) => {
    let check = []
    // let arr = []
    if (option === "Ledger") {
      summary.map((item) => {
        let existingParty = check?.find((data) => {
          return data?.partyId === item?.party?._id
        })

        if (existingParty) {
          item?.items?.map((it) => {
            if (it?.hasGodownOrBatch) {
              if (isGodownOnly(it)) {
                processGodownMerging(it, existingParty, item)
              } else {
                it.GodownList?.map((items) => {
                  if (items?.added) {
                    const { basePrice, taxAmount } = calculateTaxAndPrice(
                      it?.isTaxInclusive,
                      items?.selectedPriceRate,
                      items?.count,
                      items?.igstValue,
                      items?.discountAmount
                    )

                    const newSale = {
                      billnumber:
                        item?.salesNumber ||
                        item?.creditNoteNumber ||
                        item?.debitNoteNumber ||
                        item?.purchaseNumber,
                      billDate: item?.date,
                      itemName: it?.product_name,
                      batch: items?.batch,
                      groupName: it?.brand?.brand,
                      categoryName: it?.category?.category,
                      quantity: items?.count,
                      rate: items?.selectedPriceRate,
                      discount: items?.discountAmount,
                      taxPercentage: items?.igstValue,
                      taxAmount: taxAmount,
                      netAmount: items?.individualTotal,
                      amount: basePrice
                    }
                    existingParty.saleAmount += items?.individualTotal
                    // Push the new sale entry to the sale array
                    existingParty?.sale?.push(newSale)
                  }
                })
              }
            } else {
              it.GodownList?.map((items) => {
                const { basePrice, taxAmount } = calculateTaxAndPrice(
                  it?.isTaxInclusive,
                  items?.selectedPriceRate,
                  items?.count,
                  items?.igstValue,
                  items?.discountAmount
                )

                const newSale = {
                  billnumber:
                    item?.salesNumber ||
                    item?.creditNoteNumber ||
                    item?.debitNoteNumber ||
                    item?.purchaseNumber,
                  billDate: item?.date,
                  itemName: it?.product_name,
                  categoryName: it?.category?.category,
                  groupName: it?.brand?.brand,
                  quantity: items?.count,
                  rate: items?.selectedPriceRate,
                  discount: items?.discountAmount,
                  taxPercentage: items?.igstValue,
                  taxAmount: taxAmount,
                  netAmount: items?.individualTotal,
                  amount: basePrice
                }

                existingParty.saleAmount += items?.individualTotal
                existingParty?.sale?.push(newSale)
              })
            }
          })
        } else {
          const saleObject = {
            partyName: item?.party?.partyName,
            partyId: item?.party?._id,
            seriesId: item.series_id,
            sale: [],
            saleAmount: 0
          }

          item.items.map((it) => {
            if (it?.hasGodownOrBatch) {
              if (isGodownOnly(it)) {
                processGodownMerging(it, saleObject, item)
              } else {
                it?.GodownList?.map((items) => {
                  if (items?.added) {
                    const { basePrice, taxAmount } = calculateTaxAndPrice(
                      it?.isTaxInclusive,
                      items?.selectedPriceRate,
                      items?.count,
                      items?.igstValue,
                      items?.discountAmount
                    )
                    const newSale = {
                      billnumber:
                        item?.salesNumber ||
                        item?.crediNoteNumber ||
                        item?.debitNoteNumber ||
                        item?.purchaseNumber,
                      billDate: item?.date,
                      itemName: it.product_name,
                      batch: items?.batch,
                      groupName: it?.brand?.brand, //brandname
                      categoryName: it?.category?.category, //categoryname
                      quantity: items?.count,
                      rate: items?.selectedPriceRate,
                      discount: items?.discountAmount,
                      taxPercentage: items?.igstValue,
                      taxAmount: taxAmount,
                      netAmount: items?.individualTotal,
                      amount: basePrice
                    }
                    saleObject.saleAmount += items?.individualTotal || 0

                    // Push the new sale entry to the sale array
                    saleObject?.sale?.push(newSale)
                  }
                })
              }
            } else {
              it.GodownList.map((items) => {
                const { basePrice, taxAmount } = calculateTaxAndPrice(
                  it.isTaxInclusive,
                  items?.selectedPriceRate,
                  items?.count,
                  items?.igstValue,
                  items?.discountAmount
                )

                const a = {
                  billnumber:
                    item?.salesNumber ||
                    item?.creditNoteNumber ||
                    item?.debitNoteNumber ||
                    item?.purchaseNumber,
                  billDate: item?.date,
                  itemName: it?.product_name,
                  categoryName: it?.category?.category, //categoryname
                  groupName: it?.brand?.brand, //brandname
                  quantity: items?.count,
                  rate: items?.selectedPriceRate,
                  discount: items?.discountAmount,
                  taxPercentage: items?.igstValue,
                  taxAmount: taxAmount,
                  netAmount: items?.individualTotal,
                  amount: basePrice
                }

                saleObject.saleAmount += items?.individualTotal
                saleObject?.sale?.push(a)
              })
            }
          })
          check.push(saleObject)
        }
      })
      setSummaryReport(check)
    } else if (option === "Stock Item") {
      summary.map((item) => {
        item.items.map((h) => {
          if (h?.product_name) {
            let existingParty = check.find((data) => {
              return data.itemName === h.product_name
            })
            if (existingParty) {
              if (h.hasGodownOrBatch) {
                if (
                  isGodownOnly(h) // Ensure no item has batch
                ) {
                  processGodownMerging(h, existingParty, item)
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        items?.igstValue,
                        items?.discountAmount
                      )
                      const newSale = {
                        billnumber:
                          item?.salesNumber ||
                          item?.debitNoteNumber ||
                          item?.creditNoteNubmer ||
                          item?.purchaseNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        groupName: h?.brand?.brand, //brandname
                        categoryName: h?.category?.category, //categoryname
                        partyName: item?.party?.partyName,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discountAmount,
                        taxPercentage: items?.igstValue,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice
                      }
                      // existingParty.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      existingParty.sale.push(newSale)
                    }
                  })
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h.isTaxInclusive,
                    items?.selectedPriceRate,
                    items?.count,
                    items?.igstValue,
                    items?.discountAmount
                  )

                  const a = {
                    billnumber:
                      item?.salesNumber ||
                      item?.creditNoteNumber ||
                      item?.debitNoteNumber ||
                      item?.purchaseNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    groupName: h?.brand?.brand, //brandname
                    categoryName: h?.category?.category, //categoryname
                    partyName: item?.party?.partyName,
                    quantity: items?.count,
                    rate: items?.selectedPriceRate,
                    discount: items?.discountAmount,
                    taxPercentage: items?.igstValue,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice
                  }

                  existingParty.sale.push(a)
                })
              }
            } else {
              const saleObject = {
                itemName: h?.product_name,
                seriesId: item.series_id,
                sale: [],
                saleAmount: 0
              }
              if (h.hasGodownOrBatch) {
                if (
                  isGodownOnly(h) // Ensure no item has batch
                ) {
                  processGodownMerging(h, saleObject, item)
                  // const aggregation = {
                  //   totalQuantity: 0,
                  //   totalDiscount: 0,
                  //   totalIndividualTotal: 0,
                  //   totalBasePrice: 0,
                  //   totalTaxAmount: 0,
                  //   rate: 0,
                  // };

                  // h.GodownList.forEach((items) => {

                  //   if (items.added) {
                  //     // Sum quantity, discount, and individual total
                  //     aggregation.totalQuantity += items?.count || 0;
                  //     aggregation.totalDiscount += items?.discount || 0;
                  //     aggregation.totalIndividualTotal +=
                  //       items?.individualTotal || 0;
                  //     aggregation.rate = items?.selectedPriceRate;

                  //     // Calculate base price
                  //     let basePrice, taxAmount;
                  //     if (h.isTaxInclusive) {
                  //       basePrice = Number(
                  //         (
                  //           (items?.selectedPriceRate * items?.count) /
                  //           (1 + h?.igst / 100)
                  //         ).toFixed(2)
                  //       );

                  //       const discountedPrice = Number(
                  //         (basePrice - (items?.discount || 0)).toFixed(2)
                  //       );

                  //       taxAmount = Number(
                  //         ((discountedPrice * h.igst) / 100).toFixed(2)
                  //       );
                  //     } else {
                  //       basePrice = items.selectedPriceRate * items?.count;

                  //       const discountedPrice = Number(
                  //         (basePrice - (items?.discount || 0)).toFixed(2)
                  //       );

                  //       taxAmount = Number(
                  //         ((discountedPrice * h.igst) / 100).toFixed(2)
                  //       );
                  //     }

                  //     // Sum base price and tax amount
                  //     aggregation.totalBasePrice += basePrice;
                  //     aggregation.totalTaxAmount += taxAmount;
                  //   }
                  // });

                  // // Use aggregation results as needed
                  // saleObject.sale.push({
                  //   billnumber: item.salesNumber,
                  //   billDate: item.date,
                  //   itemName: h.product_name,
                  //   partyName: item?.party?.partyName,

                  //   batch: "",
                  //   groupName: h.brand?.name,
                  //   categoryName: h?.category.name,
                  //   quantity: aggregation.totalQuantity,
                  //   rate: aggregation.rate,
                  //   discount: aggregation.totalDiscount,
                  //   taxPercentage: h.igst,
                  //   taxAmount: aggregation.totalTaxAmount,
                  //   netAmount: aggregation.totalIndividualTotal,
                  //   amount: aggregation.totalBasePrice,
                  // });

                  // saleObject.saleAmount += aggregation.totalIndividualTotal;
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        items?.igstValue,
                        items?.discountAmount
                      )

                      // let pamount;
                      // let ptax;
                      // if (h.isTaxInclusive) {
                      //   pamount = (
                      //     (items?.selectedPriceRate * items?.count) /
                      //     (1 + h?.igst / 100)
                      //   ).toFixed(2);

                      //   const discountedPrice = Number(
                      //     (pamount - (items?.discount || 0))?.toFixed(2)
                      //   );
                      //   ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                      // } else {
                      //   pamount = items?.selectedPriceRate * items?.count;

                      //   const discountedPrice = Number(
                      //     (pamount - (items?.discount || 0))?.toFixed(2)
                      //   );
                      //   ptax = (h?.igst / 100) * discountedPrice;
                      // }
                      const newSale = {
                        billnumber:
                          item?.salesNumber ||
                          item?.creditNoteNumber ||
                          item?.debitNoteNumber ||
                          item?.purchaseNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        groupName: h?.brand?.brand, //brandname
                        categoryName: h?.category?.category, //categoryname
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discountAmount,
                        taxPercentage: items?.igstValue,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice
                      }
                      // Add the individual total to the sale amount
                      saleObject.saleAmount += items?.individualTotal

                      // Push the new sale entry to the sale array
                      saleObject.sale.push(newSale)
                    }
                  })
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h.isTaxInclusive,
                    items?.selectedPriceRate,
                    items?.count,
                    items?.igstValue,
                    items?.discountAmount
                  )
                  const a = {
                    billnumber:
                      item?.salesNumber ||
                      item?.debitNoteNumber ||
                      item?.crediNoteNumber ||
                      item?.purchaseNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    partyName: item?.party?.partyName,
                    categoryName: h?.category?.category, //categoryname
                    groupName: h?.brand?.brand, //brandname
                    quantity: items?.count,
                    rate: items?.selectedPriceRate,
                    discount: items?.discountAmount,
                    taxPercentage: items?.igstValue,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice
                  }
                  saleObject.saleAmount += items?.individualTotal
                  saleObject.sale.push(a)
                })
              }

              check.push(saleObject)
            }
          }
        })
      })
      setSummaryReport(check)
    } else if (option === "Stock Group") {
      summary.map((item) => {
        item.items.map((h) => {
          if (h?.brand?.brand) {
            let existingParty = check?.find((data) => {
              return data?.groupId === h?.brand?._id
            })

            if (existingParty) {
              if (h?.hasGodownOrBatch) {
                if (isGodownOnly(h)) {
                  processGodownMerging(h, existingParty, item)
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h?.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        items?.igstValue,
                        items?.discountAmount
                      )
                      const newSale = {
                        billnumber:
                          item?.salesNumber ||
                          item?.creditNoteNumber ||
                          item?.debitNoteNumber ||
                          item?.purchaseNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        categoryName: h?.category?.category, //categoryname
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discountAmount,
                        taxPercentage: items?.igstValue,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice
                      }

                      existingParty.saleAmount += items?.individualTotal

                      // Push the new sale entry to the sale array
                      existingParty?.sale?.push(newSale)
                    }
                  })
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h?.isTaxInclusive,
                    items?.selectedPriceRate,
                    items?.count,
                    items?.igstValue,
                    items?.discountAmount
                  )
                  const a = {
                    billnumber:
                      item?.salesNumber ||
                      item?.creditNoteNumber ||
                      item?.debitNoteNumber ||
                      item?.purchaseNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    categoryName: h?.category?.category, //categoryname
                    partyName: item?.party?.partyName,
                    quantity: items?.count,
                    rate: items?.selectedPriceRate,
                    discount: items?.discountAmount,
                    taxPercentage: items?.igstValue,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice
                  }

                  existingParty.saleAmount += items?.individualTotal
                  existingParty?.sale?.push(a)
                })
              }
            } else {
              if (!h.brand) {
                return
              }
              const saleObject = {
                groupName: h?.brand?.brand,
                groupId: h?.brand?._id,
                seriesId: item.series_id,
                sale: [],
                saleAmount: 0
              }
              if (h.hasGodownOrBatch) {
                if (isGodownOnly(h)) {
                  processGodownMerging(h, saleObject, item)
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h?.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        h?.igst,
                        items?.discount
                      )
                      const newSale = {
                        billnumber:
                          item?.salesNumber ||
                          item?.debitNoteNumber ||
                          item?.creditNoteNumber ||
                          item?.purchaseNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        categoryName: h?.category?.category, //categoryname
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discountAmount,
                        taxPercentage: items?.igstValue,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice
                      }

                      // Add the individual total to the sale amount
                      saleObject.saleAmount += items?.individualTotal

                      // Push the new sale entry to the sale array
                      saleObject?.sale?.push(newSale)
                    }
                  })
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h?.isTaxInclusive,
                    items?.selectedPriceRate,
                    items?.count,
                    items?.igstValue,
                    items?.discountAmount
                  )
                  const a = {
                    billnumber:
                      item?.salesNumber ||
                      item?.creditNoteNumber ||
                      item?.debitNoteNumber ||
                      item?.purchaseNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,

                    partyName: item?.party?.partyName,
                    categoryName: h?.category?.category, //categoryname
                    quantity: items?.count,
                    rate: items?.selectedPriceRate,
                    discount: items?.discountAmount,
                    taxPercentage: items?.igstValue,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice
                  }
                  saleObject.saleAmount += items?.individualTotal
                  saleObject?.sale?.push(a)
                })
              }
              check?.push(saleObject)
            }
          }
        })
      })
      setSummaryReport(check)
    } else if (option === "Stock Category") {
      summary.map((item) => {
        item?.items?.map((h) => {
          if (h?.brand?.brand) {
            let existingParty = check?.find((data) => {
              return data.categoryId === h?.category?._id
            })
            if (existingParty) {
              if (h.hasGodownOrBatch) {
                if (isGodownOnly(h)) {
                  processGodownMerging(h, existingParty, item)
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        items?.igstValue,
                        items?.discountAmount
                      )
                      const newSale = {
                        billnumber:
                          item?.salesNumber ||
                          item?.creditNoteNumber ||
                          item?.debitNoteNumber ||
                          item?.purchaseNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        categoryName: h?.category?.category, //categoryname
                        groupName: h?.brand?.brand,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discountAmount,
                        taxPercentage: items?.igstValue,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice
                      }

                      existingParty.saleAmount += items?.individualTotal

                      // Push the new sale entry to the sale array
                      existingParty.sale.push(newSale)
                    }
                  })
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h.isTaxInclusive,
                    items?.selectedPriceRate,
                    items?.count,
                    items?.igstValue,
                    items?.discountAmount
                  )
                  const a = {
                    billnumber:
                      item?.salesNumber ||
                      item?.debitNoteNumber ||
                      item?.creditNoteNumber ||
                      item?.purchaseNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    categoryName: h?.category?.category, //categoryname
                    groupName: h?.brand?.brand,
                    partyName: item?.party?.partyName,
                    quantity: items?.count,
                    rate: items?.selectedPriceRate,
                    discount: items?.discountAmount || 0,
                    taxPercentage: items?.igstValue,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice
                  }

                  existingParty.saleAmount += items?.individualTotal
                  existingParty.sale.push(a)
                })
              }
            } else {
              if (!h.category) {
                return
              }
              const saleObject = {
                categoryName: h?.category?.category,
                categoryId: h?.category?._id,
                seriesId: item.series_id,
                sale: [],
                saleAmount: 0
              }
              if (h.hasGodownOrBatch) {
                if (isGodownOnly(h)) {
                  processGodownMerging(h, saleObject, item)
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h?.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        items?.igstValue,
                        items?.discountAmount
                      )

                      const newSale = {
                        billnumber:
                          item?.salesNumber ||
                          item?.creditNoteNumber ||
                          item?.debitNoteNumber ||
                          item?.purchaseNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        categoryName: h?.category?.category, //categoryname
                        groupName: h?.brand?.brand,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discountAmount,
                        taxPercentage: items?.igstValue,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice
                      }

                      // Add the individual total to the sale amount
                      saleObject.saleAmount += items?.individualTotal

                      // Push the new sale entry to the sale array
                      saleObject?.sale?.push(newSale)
                    }
                  })
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h?.isTaxInclusive,
                    items?.selectedPriceRate,
                    items?.count,
                    items?.igst,
                    items?.discountAmount
                  )

                  const a = {
                    billnumber:
                      item?.salesNumber ||
                      item?.creditNoteNumber ||
                      item?.debitNoteNumber ||
                      item?.purchaseNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    partyName: item?.party?.partyName,
                    categoryName: h?.category?.category, //categoryname
                    groupName: h?.brand?.brand,
                    quantity: items?.count,
                    rate: items?.selectedPriceRate,
                    discount: items?.discountAmount,
                    taxPercentage: items?.igstValue,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice
                  }
                  saleObject.saleAmount += items?.individualTotal
                  saleObject?.sale?.push(a)
                })
              }

              check.push(saleObject)
            }
          }
        })
      })
      setSummaryReport(check)
    } else if (selectedOption === "voucher") {
      summary.map((item) => {
        let existingParty = check?.find((data) => {
          return (
            data?.vocherSeries === item?.salesNumber ||
            item?.crediNoteNumber ||
            item?.debitNoteNumber ||
            item?.purchaseNumber
          )
        })

        if (existingParty) {
          item?.items?.map((it) => {
            if (it?.hasGodownOrBatch) {
              if (isGodownOnly(it)) {
                processGodownMerging(it, existingParty, item)
              } else {
                it.GodownList?.map((items) => {
                  if (items?.added) {
                    const { basePrice, taxAmount } = calculateTaxAndPrice(
                      it?.isTaxInclusive,
                      items?.selectedPriceRate,
                      items?.count,
                      items?.igstValue,
                      items?.discountAmount
                    )

                    const newSale = {
                      billnumber:
                        item?.salesNumber ||
                        item?.creditNoteNumber ||
                        item?.debitNoteNumber ||
                        item?.purchaseNumber,
                      billDate: item?.date,
                      itemName: it?.product_name,
                      batch: items?.batch,
                      groupName: it?.brand?.brand,
                      partyName: item?.party?.partyName,
                      categoryName: it?.category?.category,
                      quantity: items?.count,
                      rate: items?.selectedPriceRate,
                      discount: items?.discountAmount,
                      taxPercentage: items?.igstValue,
                      taxAmount: taxAmount,
                      netAmount: items?.individualTotal,
                      amount: basePrice
                    }
                    existingParty.saleAmount += items?.individualTotal
                    // Push the new sale entry to the sale array
                    existingParty?.sale?.push(newSale)
                  }
                })
              }
            } else {
              it.GodownList?.map((items) => {
                const { basePrice, taxAmount } = calculateTaxAndPrice(
                  it?.isTaxInclusive,
                  items?.selectedPriceRate,
                  items?.count,
                  items?.igstValue,
                  items?.discountAmount
                )

                const newSale = {
                  billnumber:
                    item?.salesNumber ||
                    item?.creditNoteNumber ||
                    item?.debitNoteNumber ||
                    item?.purchaseNumber,
                  billDate: item?.date,
                  itemName: it?.product_name,
                  partyName: item?.party?.partyName,
                  categoryName: it?.category?.category,
                  groupName: it?.brand?.brand,
                  quantity: items?.count,
                  rate: items?.selectedPriceRate,
                  discount: items?.discountAmount,
                  taxPercentage: items?.igstValue,
                  taxAmount: taxAmount,
                  netAmount: items?.individualTotal,
                  amount: basePrice
                }

                existingParty.saleAmount += items?.individualTotal
                existingParty?.sale?.push(newSale)
              })
            }
          })
        } else {
          const saleObject = {
            partyName: item?.party?.partyName,
            partyId: item?.party?._id,
            vocherSeries:
              item?.salesNumber ||
              item?.purchaseNumber ||
              item?.crediNoteNumber ||
              item?.debitNoteNumber,
            seriesId: item.series_id,
            sale: [],
            saleAmount: 0
          }

          item.items.map((it) => {
            if (it?.hasGodownOrBatch) {
              if (isGodownOnly(it)) {
                processGodownMerging(it, saleObject, item)
              } else {
                it?.GodownList?.map((items) => {
                  if (items?.added) {
                    const { basePrice, taxAmount } = calculateTaxAndPrice(
                      it?.isTaxInclusive,
                      items?.selectedPriceRate,
                      items?.count,
                      items?.igstValue,
                      items?.discountAmount
                    )
                    const newSale = {
                      billnumber:
                        item?.salesNumber ||
                        item?.crediNoteNumber ||
                        item?.debitNoteNumber ||
                        item?.purchaseNumber,
                      billDate: item?.date,
                      itemName: it.product_name,
                      batch: items?.batch,
                      partyName: item?.party?.partyName,
                      groupName: it?.brand?.brand, //brandname
                      categoryName: it?.category?.category, //categoryname
                      quantity: items?.count,
                      rate: items?.selectedPriceRate,
                      discount: items?.discountAmount,
                      taxPercentage: items?.igstValue,
                      taxAmount: taxAmount,
                      netAmount: items?.individualTotal,
                      amount: basePrice
                    }
                    saleObject.saleAmount += items?.individualTotal || 0

                    // Push the new sale entry to the sale array
                    saleObject?.sale?.push(newSale)
                  }
                })
              }
            } else {
              it.GodownList.map((items) => {
                const { basePrice, taxAmount } = calculateTaxAndPrice(
                  it.isTaxInclusive,
                  items?.selectedPriceRate,
                  items?.count,
                  items?.igstValue,
                  items?.discountAmount
                )

                const a = {
                  billnumber:
                    item?.salesNumber ||
                    item?.creditNoteNumber ||
                    item?.debitNoteNumber ||
                    item?.purchaseNumber,
                  billDate: item?.date,
                  itemName: it?.product_name,
                  partyName: item?.party?.partyName,
                  categoryName: it?.category?.category, //categoryname
                  groupName: it?.brand?.brand, //brandname
                  quantity: items?.count,
                  rate: items?.selectedPriceRate,
                  discount: items?.discountAmount,
                  taxPercentage: items?.igstValue,
                  taxAmount: taxAmount,
                  netAmount: items?.individualTotal,
                  amount: basePrice
                }

                saleObject.saleAmount += items?.individualTotal
                saleObject?.sale?.push(a)
              })
            }
          })
          check.push(saleObject)
        }
      })
      setSummaryReport(check)
    }
  }
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
      "Batch",
      "Quantity",
      "Rate",
      "Discount",
      "Amount",
      "Tax%",
      "Tax Amount",
      "Net Amount"
    ]
    worksheetData.push(headers)

    // Add data rows
    summaryReport.forEach((record) => {
      record.sale.forEach((saleItem) => {
        const row = [
          // Main identifier based on selectedOption
          selectedOption === "Ledger"
            ? record.partyName
            : selectedOption === "Stock Group"
            ? record.groupName
            : selectedOption === "Stock Category"
            ? record.categoryName
            : selectedOption === "Stock Item"
            ? record.itemName
            : selectedOption === "voucher"
            ? record.vocherSeries
            : "",

          ...(selectedOption !== "voucher" ? [saleItem.billnumber] : []),
          formatDate(saleItem.billDate),

          // Secondary column based on selectedOption
          selectedOption === "Ledger"
            ? saleItem.itemName
            : selectedOption === "Stock Group"
            ? saleItem.categoryName
            : selectedOption === "Stock Category"
            ? saleItem.groupName
            : selectedOption === "Stock Item"
            ? saleItem.partyName
            : selectedOption === "voucher"
            ? saleItem.partyName
            : "",

          // Tertiary column based on selectedOption
          selectedOption === "Ledger"
            ? saleItem.categoryName
            : selectedOption === "Stock Group"
            ? saleItem.partyName
            : selectedOption === "Stock Category"
            ? saleItem.itemName
            : selectedOption === "Stock Item"
            ? saleItem.groupName
            : selectedOption === "voucher"
            ? saleItem.itemName
            : "",

          // Quaternary column based on selectedOption
          selectedOption === "Ledger"
            ? saleItem.groupName
            : selectedOption === "Stock Group"
            ? saleItem.itemName
            : selectedOption === "Stock Category"
            ? saleItem.partyName
            : selectedOption === "Stock Item"
            ? saleItem.categoryName
            : selectedOption === "voucher"
            ? saleItem.groupName
            : "",
          //if voucher,insert extra column before batch
          ...(selectedOption === "voucher"
            ? [
                selectedOption === "Ledger"
                  ? saleItem.groupName
                  : selectedOption === "Stock Group"
                  ? saleItem.itemName
                  : selectedOption === "Stock Category"
                  ? saleItem.partyName
                  : selectedOption === "Stock Item"
                  ? saleItem.categoryName
                  : selectedOption === "voucher"
                  ? saleItem.categoryName
                  : ""
              ]
            : []),

          saleItem.batch || "",
          saleItem.quantity,
          saleItem.rate,
          formatNumber(saleItem.discount),
          formatNumber(saleItem.amount),
          saleItem.taxPercentage,
          formatNumber(saleItem.taxAmount),
          formatNumber(saleItem.netAmount)
        ]
        worksheetData.push(row)
      })

      // Add total row for each group
      const totalRow = new Array(14).fill("")
      totalRow[0] = `Total for ${getMainHeader(selectedOption)}`
      totalRow[13] = formatNumber(record.saleAmount)
      worksheetData.push(totalRow)

      // Add empty row for separation
      worksheetData.push(new Array(14).fill(""))
    })

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(worksheetData)

    // Add column widths
    const colWidths = [
      { wch: 20 }, // Main identifier
      { wch: 12 }, // Bill No
      { wch: 12 }, // Bill Date
      { wch: 20 }, // Secondary column
      { wch: 20 }, // Tertiary column
      { wch: 20 }, // Quaternary column
      { wch: 12 }, // Batch
      { wch: 10 }, // Quantity
      { wch: 10 }, // Rate
      { wch: 10 }, // Discount
      { wch: 12 }, // Amount
      { wch: 8 }, // Tax%
      { wch: 12 }, // Tax Amount
      { wch: 12 } // Net Amount
    ]
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
        <hr />
        <section className="shadow-lg bg-white">
          <VoucherTypeFilter filterKeys={filterKeys} />
        </section>
        <div className="flex justify-between lg:justify-between gap-5 px-2 lg:gap-0  bg-white  border-t shadow-lg">
          <SummmaryDropdown />{" "}
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
                setSummaryReport([])
              }}
              value={serialNumber.value}
              className="appearance-none border border-white rounded-md  px-4 py-2 pr-8 shadow-inner focus:outline-none cursor-pointer  pl-5 min-w-[150px]"
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

      {!loading && summaryReport.length > 0 ? (
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
                  <th className="p-2 font-semibold text-gray-600">Batch</th>
                  <th className="p-2 font-semibold text-gray-600">Quantity</th>
                  <th className="p-2 font-semibold text-gray-600">Rate</th>
                  <th className="p-2 font-semibold text-gray-600">Discount</th>
                  <th className="p-2 font-semibold text-gray-600">Amount</th>
                  <th className="p-2 font-semibold text-gray-600">Tax%</th>
                  <th className="p-2 font-semibold text-gray-600">
                    Tax Amount
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
                          colSpan={15}
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
                            {selectedOption === "Ledger"
                              ? party?.partyName
                              : selectedOption === "Stock Group"
                              ? party?.groupName
                              : selectedOption === "Stock Category"
                              ? party?.categoryName
                              : selectedOption === "Stock Item"
                              ? party?.itemName
                              : selectedOption === "voucher"
                              ? saleItem.billnumber
                              : ""}
                          </td>
                        ) : null}
                        {selectedOption !== "voucher" && (
                          <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer text-nowrap">
                            {saleItem?.billnumber}
                          </td>
                        )}

                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer text-nowrap">
                          {saleItem?.billDate
                            ? new Date(saleItem?.billDate)
                                .toISOString()
                                .split("T")[0]
                            : "N/A"}
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
                          {saleItem?.batch || "Nill"}
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
