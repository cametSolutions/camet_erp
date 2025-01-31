/* eslint-disable no-prototype-builtins */
import { useState, useEffect, useMemo } from "react";

import TitleDiv from "../../../../components/common/TitleDiv";
import SummmaryDropdown from "../../../../components/Filters/SummaryDropdown";
import SelectDate from "../../../../components/Filters/SelectDate";
import { useSelector } from "react-redux";
import useFetch from "../../../../customHook/useFetch";
import CustomBarLoader from "../../../../components/common/CustomBarLoader";
import * as XLSX from 'xlsx';
import { RiFileExcel2Fill } from "react-icons/ri";
function SalesSummaryTable() {
  const [summaryReport, setSummaryReport] = useState([]);
  const [summary, setSummary] = useState([]);

  

  // const location = useLocation();
  // const summary = location?.state?.summary;

  const { start, end } = useSelector((state) => state.date);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const selectedOption = useSelector(
    (state) => state.summaryFilter.selectedOption
  );

  const salesummaryUrl = useMemo(() => {
    if (start && end) {
      return `/api/sUsers/salesSummary/${cmp_id}?startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=sale`;
    }
    return null; // Or return an empty string if preferred
  }, [start, end, cmp_id]);

  const {
    data: salesummaryData,
    loading,
    // error: Error,
  } = useFetch(salesummaryUrl);

  useEffect(() => {
    if (salesummaryData && salesummaryData?.flattenedResults) {
      setSummary(salesummaryData.flattenedResults);
    }
  }, [salesummaryData, cmp_id]);

  useEffect(() => {
    if (summary && summary.length > 0) {
      // setSelectedIndex(null);
      handleFilter(selectedOption);
    }
  }, [summary, selectedOption]);

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
      : Number(itemPrice * count).toFixed(2);

    const discountedPrice = Number((basePrice - (discount || 0)).toFixed(2));
    const taxAmount = Number(((discountedPrice * igst) / 100).toFixed(2));

    return { basePrice, taxAmount };
  };

  /// checking godownOnly
  const isGodownOnly = (product) => {
    if (
      product.GodownList.every((item) => item.godown_id) &&
      product.GodownList.every((item) => !item.hasOwnProperty("batch"))
    ) {
      return true;
    } else {
      false;
    }
  };
  ////  process clubbing of godown
  const processGodownMerging = (item, saleObject, sale) => {
    // Initialize aggregation variables
    const aggregation = {
      totalQuantity: 0,
      totalDiscount: 0,
      totalIndividualTotal: 0,
      totalBasePrice: 0,
      totalTaxAmount: 0,
      rate: 0,
    };

    item.GodownList.forEach((items) => {
      if (items.added) {
        // Sum quantity, discount, and individual total
        aggregation.totalQuantity += items?.count || 0;
        aggregation.totalDiscount += items?.discount || 0;
        aggregation.totalIndividualTotal += items?.individualTotal || 0;
        aggregation.rate = items?.selectedPriceRate;

        // Calculate base price
        let basePrice, taxAmount;
        if (item.isTaxInclusive) {
          basePrice = Number(
            (
              (items?.selectedPriceRate * items?.count) /
              (1 + item?.igst / 100)
            ).toFixed(2)
          );

          const discountedPrice = Number(
            (basePrice - (items?.discount || 0)).toFixed(2)
          );

          taxAmount = Number(((discountedPrice * item.igst) / 100).toFixed(2));
        } else {
          basePrice = items.selectedPriceRate * items?.count;

          const discountedPrice = Number(
            (basePrice - (items?.discount || 0)).toFixed(2)
          );

          taxAmount = Number(((discountedPrice * item.igst) / 100).toFixed(2));
        }

        // Sum base price and tax amount
        aggregation.totalBasePrice += basePrice;
        aggregation.totalTaxAmount += taxAmount;
      }
    });

    // Use aggregation results as needed
    saleObject.sale.push({
      billnumber: sale?.salesNumber,
      billDate: sale?.date,
      itemName: item?.product_name,
      partyName: sale?.party?.partyName,
      batch: "",
      groupName: item?.brand?.name,
      categoryName: item?.category?.name,
      quantity: aggregation?.totalQuantity,
      rate: aggregation?.rate,
      discount: aggregation?.totalDiscount,
      taxPercentage: item?.igst,
      taxAmount: aggregation?.totalTaxAmount,
      netAmount: aggregation?.totalIndividualTotal,
      amount: aggregation?.totalBasePrice,
    });

    return saleObject.sale;
  };


  const handleFilter = (option) => {
    let check = [];
    // let arr = []
    if (option === "Ledger") {
      summary.map((item) => {
        let existingParty = check?.find((data) => {
          return data?.partyId === item?.party?._id;
        });

        if (existingParty) {
          item?.items?.map((it) => {
            if (it?.hasGodownOrBatch) {
              if (isGodownOnly(it)) {
                processGodownMerging(it, existingParty, item);
              } 
              
              else {
                it.GodownList?.map((items) => {
                  if (items?.added) {
                    const { basePrice, taxAmount } = calculateTaxAndPrice(
                      it?.isTaxInclusive,
                      items?.selectedPriceRate,
                      items?.count,
                      it?.igst,
                      items?.discount
                    );

                    const newSale = {
                      billnumber: item?.salesNumber,
                      billDate: item?.date,
                      itemName: it?.product_name,
                      batch: items?.batch,
                      groupName: it?.brand?.name,
                      categoryName: it?.category?.name,
                      quantity: items?.count,
                      rate: items?.selectedPriceRate,
                      discount: items?.discount,
                      taxPercentage: it?.igst,
                      taxAmount: taxAmount,
                      netAmount: items?.individualTotal,
                      amount: basePrice,
                    };
                    existingParty.saleAmount += items?.individualTotal;
                    // Push the new sale entry to the sale array
                    existingParty?.sale?.push(newSale);
                  }
                })
              }
            } else {
              it.GodownList?.map((items) => {
                const { basePrice, taxAmount } = calculateTaxAndPrice(
                  it?.isTaxInclusive,
                  items?.selectedPriceRate,
                  it?.count,
                  it?.igst,
                  it?.discount
                );
                const newSale = {
                  billnumber: item?.salesNumber,
                  billDate: item?.date,
                  itemName: it?.product_name,
                  categoryName: it?.category?.name,
                  groupName: it?.brand?.name,
                  quantity: it?.count,
                  rate: items?.selectedPriceRate,
                  discount: it?.discount,
                  taxPercentage: it?.igst,
                  taxAmount: taxAmount,
                  netAmount: items?.individualTotal,
                  amount: basePrice,
                };

                existingParty.saleAmount += items?.individualTotal;
                existingParty?.sale?.push(newSale);
              });
            }
          });
        } else {
          const saleObject = {
            partyName: item?.party?.partyName,
            partyId: item?.party?._id,
            sale: [],
            saleAmount: 0,
          };

          item.items.map((it) => {
            if (it?.hasGodownOrBatch) {
              if (isGodownOnly(it)) {
                processGodownMerging(it, saleObject, item);
              } 
              else {
                it?.GodownList?.map((items) => {
                  if (items?.added) {
                    const { basePrice, taxAmount } = calculateTaxAndPrice(
                      it?.isTaxInclusive,
                      items?.selectedPriceRate,
                      items?.count,
                      it?.igst,
                      items?.discount
                    );
                    const newSale = {
                      billnumber: item?.salesNumber,
                      billDate: item?.date,
                      itemName: it.product_name,
                      batch: items?.batch,
                      groupName: it?.brand?.name,
                      categoryName: it?.category.name,
                      quantity: items?.count,
                      rate: items?.selectedPriceRate,
                      discount: items?.discount,
                      taxPercentage: it?.igst,
                      taxAmount: taxAmount,
                      netAmount: items?.individualTotal,
                      amount: basePrice,
                    };
                    saleObject.saleAmount += items?.individualTotal || 0;

                    // Push the new sale entry to the sale array
                    saleObject?.sale?.push(newSale);
                  }
                });
              }
            } else {
              it.GodownList.map((items) => {
                const { basePrice, taxAmount } = calculateTaxAndPrice(
                  it.isTaxInclusive,
                  items?.selectedPriceRate,
                  it?.count,
                  it?.igst,
                  it?.discount
                );
                const a = {
                  billnumber: item?.salesNumber,
                  billDate: item?.date,
                  itemName: it?.product_name,
                  categoryName: it?.category?.name,
                  groupName: it?.brand?.name,
                  quantity: it?.count,
                  rate: items?.selectedPriceRate,
                  discount: it?.discount,
                  taxPercentage: it?.igst,
                  taxAmount: taxAmount,
                  netAmount: items?.individualTotal,
                  amount: basePrice,
                };

                saleObject.saleAmount += items?.individualTotal;
                saleObject?.sale?.push(a);
              });
            }
          });
          check.push(saleObject);
        }
      });
      setSummaryReport(check);
    } else if (option === "Stock Item") {
      summary.map((item) => {
        item.items.map((h) => {
          if (h?.product_name) {
            let existingParty = check.find((data) => {
              return data.itemName === h.product_name;
            });
            if (existingParty) {
              if (h.hasGodownOrBatch) {
                if (
                  isGodownOnly(h) // Ensure no item has batch
                ) {
                  processGodownMerging(h, existingParty, item);
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        h?.igst,
                        items?.discount
                      );

                      const newSale = {
                        billnumber: item?.salesNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        groupName: h?.brand?.name,
                        categoryName: h?.category?.name,
                        partyName: item?.party?.partyName,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discount,
                        taxPercentage: h?.igst,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice,
                      };
                      // existingParty.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      existingParty.sale.push(newSale);
                    }
                  });
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h.isTaxInclusive,
                    items?.selectedPriceRate,
                    h?.count,
                    h?.igst,
                    h?.discount
                  );

                  const a = {
                    billnumber: item?.salesNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    groupName: h?.brand?.name,
                    categoryName: h?.category?.name,
                    partyName: item?.party?.partyName,
                    quantity: h?.count,
                    rate: items?.selectedPriceRate,
                    discount: h?.discount,
                    taxPercentage: h?.igst,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice,
                  };

                  existingParty.sale.push(a);
                });
              }
            } else {
              const saleObject = {
                itemName: h?.product_name,

                sale: [],
                saleAmount: 0,
              };

              if (h.hasGodownOrBatch) {
                if (
                  isGodownOnly(h) // Ensure no item has batch
                ) {
                  processGodownMerging(h, saleObject, item);
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
                  const godown = h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        h?.igst,
                        items?.discount
                      );
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
                        billnumber: item?.salesNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        groupName: h?.brand?.name,
                        categoryName: h?.category?.name,
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discount,
                        taxPercentage: h?.igst,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice,
                      };

                      // Add the individual total to the sale amount
                      saleObject.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      saleObject.sale.push(newSale);
                    }
                  });
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h.isTaxInclusive,
                    items?.selectedPriceRate,
                    h?.count,
                    h?.igst,
                    h?.discount
                  );

                  const a = {
                    billnumber: item?.salesNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    partyName: item?.party?.partyName,
                    categoryName: h?.category?.name,
                    groupName: h?.brand?.name,
                    quantity: h?.count,
                    rate: items?.selectedPriceRate,
                    discount: h?.discount,
                    taxPercentage: h?.igst,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice,
                  };
                  saleObject.saleAmount += items?.individualTotal;
                  saleObject.sale.push(a);
                });
              }

              check.push(saleObject);
            }
          }
        });
      });
      setSummaryReport(check);
    } 
    
    else if (option === "Stock Group") {
      summary.map((item) => {
        item.items.map((h) => {
          if (h?.brand?.name) {
            let existingParty = check?.find((data) => {
              return data?.groupId === h?.brand?._id;
            });

            if (existingParty) {
              if (h?.hasGodownOrBatch) {
                if (isGodownOnly(h)) {
                  processGodownMerging(h, existingParty, item);
                } 
                
                else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h?.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        h?.igst,
                        items?.discount
                      );
  
                      const newSale = {
                        billnumber: item?.salesNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        categoryName: h?.category?.name,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discount,
                        taxPercentage: h?.igst,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice,
                      };

                      existingParty.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      existingParty?.sale?.push(newSale);
                    }
                  });
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h?.isTaxInclusive,
                    items?.selectedPriceRate,
                    h?.count,
                    h?.igst,
                    h?.discount
                  );
                  const a = {
                    billnumber: item?.salesNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    categoryName: h?.category?.name,
                    partyName: item?.party?.partyName,
                    quantity: h?.count,
                    rate: items?.selectedPriceRate,
                    discount: h?.discount || 0,
                    taxPercentage: h?.igst,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice,
                  };

                  existingParty.saleAmount += items?.individualTotal;
                  existingParty?.sale?.push(a);
                });
              }
            } else {
              const saleObject = {
                groupName: h?.brand?.name,
                groupId: h?.brand?._id,
                sale: [],
                saleAmount: 0,
              };

              if (h.hasGodownOrBatch) {
                if (isGodownOnly(h)) {
                  processGodownMerging(h, saleObject, item);
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h?.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        h?.igst,
                        items?.discount
                      );
                      const newSale = {
                        billnumber: item?.salesNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        categoryName: h?.category?.name,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discount,
                        taxPercentage: h?.igst,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice,
                      };

                      // Add the individual total to the sale amount
                      saleObject.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      saleObject?.sale?.push(newSale);
                    }
                  });
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h?.isTaxInclusive,
                    items?.selectedPriceRate,
                    h?.count,
                    h?.igst,
                    h?.discount
                  );
                  const a = {
                    billnumber: item?.salesNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    partyName: item?.party?.partyName,
                    categoryName: h?.category?.name,
                    quantity: h?.count,
                    rate: items?.selectedPriceRate,
                    discount: h?.discount,
                    taxPercentage: h?.igst,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice,
                  };
                  saleObject.saleAmount += items?.individualTotal;
                  saleObject?.sale?.push(a);
                });
              }

              check?.push(saleObject);
            }
          }
        });
      });
      setSummaryReport(check);
    }
    else if (option === "Stock Category") {
      summary.map((item) => {
        item?.items?.map((h) => {
          if (h?.brand?.name) {
            let existingParty = check?.find((data) => {
              return data.groupId === h?.category?._id;
            });

            if (existingParty) {
              if (h.hasGodownOrBatch) {
                if (isGodownOnly(h)) {
                  processGodownMerging(h, existingParty, item);
                } 
                
                else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        h?.igst,
                        items?.discount
                      );
  
                      const newSale = {
                        billnumber: item?.salesNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        categoryName: h?.category?.name,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discount,
                        taxPercentage: h?.igst,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice,
                      };

                      existingParty.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      existingParty.sale.push(newSale);
                    }
                  });
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h.isTaxInclusive,
                    items?.selectedPriceRate,
                    h?.count,
                    h?.igst,
                    h?.discount
                  );
                  const a = {
                    billnumber: item?.salesNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    categoryName: h?.category?.name,
                    partyName: item?.party?.partyName,
                    quantity: h?.count,
                    rate: items?.selectedPriceRate,
                    discount: h?.discount || 0,
                    taxPercentage: h?.igst,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice,
                  };

                  existingParty.saleAmount += items?.individualTotal;
                  existingParty.sale.push(a);
                });
              }
            } else {
              const saleObject = {

                categoryName: h?.category?.name,
                categoryId: h?.category?._id,
                sale: [],
                saleAmount: 0,
              };

              

              if (h.hasGodownOrBatch) {
                if (isGodownOnly(h)) {
                  processGodownMerging(h, saleObject, item);
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      const { basePrice, taxAmount } = calculateTaxAndPrice(
                        h?.isTaxInclusive,
                        items?.selectedPriceRate,
                        items?.count,
                        h?.igst,
                        items?.discount
                      );
                      const newSale = {
                        billnumber: item?.salesNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        categoryName: h?.category?.name,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discount,
                        taxPercentage: h?.igst,
                        taxAmount: taxAmount,
                        netAmount: items?.individualTotal,
                        amount: basePrice,
                      };

                      // Add the individual total to the sale amount
                      saleObject.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      saleObject?.sale?.push(newSale);
                    }
                  });
                }
              } else {
                h.GodownList.map((items) => {
                  const { basePrice, taxAmount } = calculateTaxAndPrice(
                    h?.isTaxInclusive,
                    items?.selectedPriceRate,
                    h?.count,
                    h?.igst,
                    h?.discount
                  );
                  const a = {
                    billnumber: item?.salesNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    partyName: item?.party?.partyName,
                    categoryName: h?.category?.name,
                    quantity: h?.count,
                    rate: items?.selectedPriceRate,
                    discount: h?.discount,
                    taxPercentage: h?.igst,
                    taxAmount: taxAmount,
                    netAmount: items?.individualTotal,
                    amount: basePrice,
                  };
                  saleObject.saleAmount += items?.individualTotal;
                  saleObject?.sale?.push(a);
                });
              }

              check.push(saleObject);
            }
          }
        });
      });
      setSummaryReport(check);
    }
  };



  ////////

 const exportToExcel = () => {
  
    if (!summaryReport || summaryReport.length === 0) return;
  
    // Function to format date
    const formatDate = (dateString) => {
      return dateString ? new Date(dateString).toISOString().split('T')[0] : 'N/A';
    };
  
    // Function to format numbers
    const formatNumber = (number) => {
      return number ? Number(number).toFixed(2) : '0.00';
    };
  
    // Prepare worksheet data
    const worksheetData = [];
  
    // Add headers based on selectedOption
    const headers = [
      getMainHeader(selectedOption),
      'Bill No',
      'Bill Date',
      getSecondaryHeader(selectedOption),
      getTertiaryHeader(selectedOption),
      getQuaternaryHeader(selectedOption),
      'Batch',
      'Quantity',
      'Rate',
      'Discount',
      'Amount',
      'Tax%',
      'Tax Amount',
      'Net Amount'
    ];
    worksheetData.push(headers);

    console.log(summaryReport);
    
  
    // Add data rows
    summaryReport.forEach(record => {
      record.sale.forEach(saleItem => {
        const row = [
          // Main identifier based on selectedOption
          selectedOption === 'Ledger' ? record.partyName :
          selectedOption === 'Stock Group' ? record.groupName :
          selectedOption === 'Stock Category' ? record.categoryName :
          selectedOption === 'Stock Item' ? record.itemName : '',
          
          saleItem.billnumber,
          formatDate(saleItem.billDate),
          
          // Secondary column based on selectedOption
          selectedOption === 'Ledger' ? saleItem.itemName :
          selectedOption === 'Stock Group' ? saleItem.categoryName :
          selectedOption === 'Stock Category' ? saleItem.groupName :
          selectedOption === 'Stock Item' ? saleItem.partyName : '',
          
          // Tertiary column based on selectedOption
          selectedOption === 'Ledger' ? saleItem.categoryName :
          selectedOption === 'Stock Group' ? saleItem.partyName :
          selectedOption === 'Stock Category' ? saleItem.itemName :
          selectedOption === 'Stock Item' ? saleItem.groupName : '',
          
          // Quaternary column based on selectedOption
          selectedOption === 'Ledger' ? saleItem.groupName :
          selectedOption === 'Stock Group' ? saleItem.itemName :
          selectedOption === 'Stock Category' ? saleItem.partyName :
          selectedOption === 'Stock Item' ? saleItem.categoryName : '',
          
          saleItem.batch || '',
          saleItem.quantity,
          saleItem.rate,
          formatNumber(saleItem.discount),
          formatNumber(saleItem.amount),
          saleItem.taxPercentage,
          formatNumber(saleItem.taxAmount),
          formatNumber(saleItem.netAmount)
        ];
        worksheetData.push(row);
      });
  
      // Add total row for each group
      const totalRow = new Array(14).fill('');
      totalRow[0] = `Total for ${getMainHeader(selectedOption)}`;
      totalRow[13] = formatNumber(record.saleAmount);
      worksheetData.push(totalRow);
      
      // Add empty row for separation
      worksheetData.push(new Array(14).fill(''));
    });
  
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  
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
      { wch: 8 },  // Tax%
      { wch: 12 }, // Tax Amount
      { wch: 12 }  // Net Amount
    ];
    ws['!cols'] = colWidths;
  
    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Summary');
  
    // Generate Excel file
    XLSX.writeFile(wb, `Sales_Summary_${selectedOption}_${formatDate(new Date())}.xlsx`);
  };
  
  // Helper functions for header names
  function getMainHeader(selectedOption) {
    switch (selectedOption) {
      case 'Ledger': return 'Party Name';
      case 'Stock Group': return 'Group Name';
      case 'Stock Category': return 'Category Name';
      case 'Stock Item': return 'Item Name';
      default: return '';
    }
  }
  
  function getSecondaryHeader(selectedOption) {
    switch (selectedOption) {
      case 'Ledger': return 'Item Name';
      case 'Stock Group': return 'Category Name';
      case 'Stock Category': return 'Group Name';
      case 'Stock Item': return 'Party Name';
      default: return '';
    }
  }
  
  function getTertiaryHeader(selectedOption) {
    switch (selectedOption) {
      case 'Ledger': return 'Category Name';
      case 'Stock Group': return 'Party Name';
      case 'Stock Category': return 'Item Name';
      case 'Stock Item': return 'Group Name';
      default: return '';
    }
  }
  
  function getQuaternaryHeader(selectedOption) {
    switch (selectedOption) {
      case 'Ledger': return 'Group Name';
      case 'Stock Group': return 'Item Name';
      case 'Stock Category': return 'Party Name';
      case 'Stock Item': return 'Category Name';
      default: return '';
    }
  }

  return (
    <div>
      <div className="flex flex-col sticky top-0 ">
        <TitleDiv title={"Sales Summary Details"} from="/sUsers/salesSummary"
        rightSideContent={<RiFileExcel2Fill size={20} />}
                  rightSideContentOnClick={exportToExcel}
         />
        {/* <button onClick={()=>{exportToExcel(summaryReport,selectedOption)}}>convet</button> */}
        <SelectDate />
        <div className="flex px-2  bg-white shadow-lg border-t shadow-lg">
          <SummmaryDropdown />
        </div>
      </div>

      {loading && <CustomBarLoader />}

      {!loading && summaryReport.length > 0 ? (
        <div className=" bg-gray-50 rounded-lg shadow-lg mt-2 ">
          <div className=" max-h-[600px] overflow-auto text-xs pb-5">
            <table className="w-full text-center border  ">
              <thead className=" bg-gray-300  ">
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
                      : ""}
                  </th>
                  <th className="p-2 font-semibold text-gray-600">Bill No</th>
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
                      : ""}
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
                      : ""}
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
                      : ""}
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
              <tbody>
                {summaryReport?.map((party, partyIndex) => (
                  <>
                    {/* Add a thicker border between parties */}
                    {partyIndex !== 0 && (
                      <tr>
                        <td
                          colSpan={14}
                          className="h-1 bg-gray-300" // Adds a gray row for visual separation
                        ></td>
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
                            className="px-1 py-2 text-gray-800 font-bold text-xs cursor-pointer border"
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
                              : ""}
                          </td>
                        ) : null}
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.billnumber}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.billDate
                            ? new Date(saleItem?.billDate)
                                .toISOString()
                                .split("T")[0]
                            : "N/A"}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {selectedOption === "Ledger"
                            ? saleItem?.itemName
                            : selectedOption === "Stock Group"
                            ? saleItem?.categoryName
                            : selectedOption === "Stock Category"
                            ? saleItem?.groupName
                            : selectedOption === "Stock Item"
                            ? saleItem?.partyName
                            : ""}
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
                            : ""}
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
                            : ""}
                        </td>

                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.batch}
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
                          {Number((saleItem?.amount)).toFixed(2)}

                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {saleItem?.taxPercentage}
                        </td>
                        <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                          {Number((saleItem?.taxAmount)).toFixed(2)}
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
  );
}
export default SalesSummaryTable;
