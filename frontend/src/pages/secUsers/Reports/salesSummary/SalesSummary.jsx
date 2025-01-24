// /* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */

//  corrected
import { useEffect, useMemo, useState } from "react";
import TitleDiv from "../../../../components/common/TitleDiv";
import FindUserAndCompany from "../../../../components/Filters/FindUserAndCompany";
import SummmaryDropdown from "../../../../components/Filters/SummaryDropdown";
import SelectDate from "../../../../components/Filters/SelectDate";

import { useSelector } from "react-redux";

// import { useNavigate, useParams } from "react-router-dom"
import useFetch from "../../../../customHook/useFetch";

import { BarLoader } from "react-spinners";

function SalesSummary() {
  
  const [userAndCompanyData, setUserAndCompanyData] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Ledger");
  const [showDetails, setShowDetails] = useState(false);
  const [summary, setSummary] = useState([]);
  const [summaryReport, setSummaryReport] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  // const [datasummary, setdataSummary] = useState([])

  const { start, end } = useSelector((state) => state.date);
  const { _id: partyID } = useSelector(
    (state) => state.partyFilter.selectedParty
  );

  const salesummaryUrl = useMemo(() => {
    if (userAndCompanyData && start && end && selectedOption) {
      return `/api/sUsers/salesSummary/${
        userAndCompanyData?.org?._id
      }?party_id=${
        partyID ?? ""
      }&startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=sale&selectedOption=${selectedOption}`;
    }
    return null; // Or return an empty string if preferred
  }, [userAndCompanyData, start, end, selectedOption]);

  const {
    data: salesummaryData,
    loading: Loading,
    error: Error,
  } = useFetch(salesummaryUrl);
  useEffect(() => {
    if (salesummaryData && salesummaryData?.flattenedResults) {
      setSummary(salesummaryData.flattenedResults);
    }
  }, [salesummaryData]);
  useEffect(() => {
    if (summary && summary.length > 0) {
      setSelectedIndex(null);
      handleLedger(selectedOption);
    }
  }, [summary]);
  // const handleViewDetails = () => {
  //   // Perform any logic before showing details (e.g., API call to fetch data)

  //   setShowDetails(true) // Show the details page
  // }

  // const handleBack = () => {
  //   setShowDetails(false) // Hide details page and go back
  // }

  // function calculateTaxAndPrice(item, items, isTaxInclusive) {
  //   let pamount, ptax;
  //   if (isTaxInclusive) {
  //     pamount = (
  //       (items?.selectedPriceRate * items?.count) /
  //       (1 + item?.igst / 100)
  //     ).toFixed(2);

  //     const discountedPrice = Number(
  //       (pamount - (items?.discount || 0))?.toFixed(2)
  //     );
  //     ptax = ((discountedPrice * item?.igst) / 100).toFixed(2);
  //   } else {
  //     pamount = items.selectedPriceRate * items?.count;
  //     const discountedPrice = Number(
  //       (pamount - (items?.discount || 0))?.toFixed(2)
  //     );
  //     ptax = (item?.igst / 100) * discountedPrice;
  //   }

  //   return { pamount, ptax };
  // }

  // function createSaleEntry(item, it, items, pamount, ptax) {
  //   return {
  //     billnumber: item?.salesNumber,
  //     billDate: item?.date,
  //     itemName: it?.product_name,
  //     batch: items?.batch || "",
  //     groupName: it?.brand?.name,
  //     categoryName: it?.category.name,
  //     quantity: items?.count,
  //     rate: items?.selectedPriceRate,
  //     discount: items?.discount,
  //     taxPercentage: it?.igst,
  //     taxAmount: ptax,
  //     netAmount: items?.individualTotal,
  //     amount: pamount,
  //   };
  // }

  const handleLedger = (option) => {
    setSelectedOption(option);
    let check = [];
    // let arr = []
    if (option === "Ledger") {
      summary.map((item) => {
        let existingParty = check.find((data) => {
          return data.partyId === item.party?._id;
        });

        if (existingParty) {
          const sale = item.items.map((it) => {
            if (it.hasGodownOrBatch) {
              if (
                it.GodownList.every((item) => item.godown_id) && // Check all have godown_id
                it.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
              ) {
                // Initialize aggregation variables
                const aggregation = {
                  totalQuantity: 0,
                  totalDiscount: 0,
                  totalIndividualTotal: 0,
                  totalBasePrice: 0,
                  totalTaxAmount: 0,
                  rate: 0,
                };

                it.GodownList.forEach((items) => {
                  if (items.added) {
                    // Sum quantity, discount, and individual total
                    aggregation.totalQuantity += items?.count || 0;
                    aggregation.totalDiscount += items?.discount || 0;
                    aggregation.totalIndividualTotal +=
                      items?.individualTotal || 0;
                    aggregation.rate = items?.selectedPriceRate;

                    // Calculate base price
                    let basePrice, taxAmount;
                    if (it.isTaxInclusive) {
                      basePrice = Number(
                        (
                          (items?.selectedPriceRate * items?.count) /
                          (1 + it?.igst / 100)
                        ).toFixed(2)
                      );

                      const discountedPrice = Number(
                        (basePrice - (items?.discount || 0)).toFixed(2)
                      );

                      taxAmount = Number(
                        ((discountedPrice * it.igst) / 100).toFixed(2)
                      );
                    } else {
                      basePrice = items.selectedPriceRate * items?.count;

                      const discountedPrice = Number(
                        (basePrice - (items?.discount || 0)).toFixed(2)
                      );

                      taxAmount = Number(
                        ((discountedPrice * it.igst) / 100).toFixed(2)
                      );
                    }

                    // Sum base price and tax amount
                    aggregation.totalBasePrice += basePrice;
                    aggregation.totalTaxAmount += taxAmount;
                  }
                });

                // Use aggregation results as needed
                existingParty.sale.push({
                  billnumber: item.salesNumber,
                  billDate: item.date,
                  itemName: it.product_name,
                  batch: "",
                  groupName: it.brand?.name,
                  categoryName: it?.category.name,
                  quantity: aggregation.totalQuantity,
                  rate: aggregation.rate,
                  discount: aggregation.totalDiscount,
                  taxPercentage: it.igst,
                  taxAmount: aggregation.totalTaxAmount,
                  netAmount: aggregation.totalIndividualTotal,
                  amount: aggregation.totalBasePrice,
                });
              } else {
                const a = it.GodownList.map((items) => {
                  if (items.added) {
                    let pamount;
                    let ptax;
                    if (it.isTaxInclusive) {
                      pamount = (
                        (items?.selectedPriceRate * items?.count) /
                        (1 + it?.igst / 100)
                      ).toFixed(2);

                      const discountedPrice = Number(
                        (pamount - (items?.discount || 0))?.toFixed(2)
                      );
                      ptax = ((discountedPrice * it.igst) / 100).toFixed(2);
                    } else {
                      pamount = items.selectedPriceRate * items?.count;

                      const discountedPrice = Number(
                        (pamount - items?.discount)?.toFixed(2)
                      );

                      ptax = (it?.igst / 100) * discountedPrice;
                    }
                    const newSale = {
                      billnumber: item.salesNumber,
                      billDate: item.date,
                      itemName: it.product_name,
                      batch: items.batch,
                      groupName: it.brand?.name,
                      categoryName: it?.category.name,
                      quantity: items.count,
                      rate: items.selectedPriceRate,
                      discount: items.discount,
                      taxPercentage: it.igst,
                      taxAmount: ptax,
                      netAmount: items.individualTotal,
                      amount: pamount,
                    };
                    existingParty.saleAmount += items.individualTotal;
                    // Push the new sale entry to the sale array
                    existingParty.sale.push(newSale);
                  }
                });
              }
            } else {
              const godown = it.GodownList.map((items) => {
                let pamount;
                let ptax;
                if (it.isTaxInclusive) {
                  pamount = (
                    (items?.selectedPriceRate * it?.count) /
                    (1 + it?.igst / 100)
                  ).toFixed(2);
                  ptax = it?.igstAmt || 0;
                } else {
                  pamount = items.selectedPriceRate * it?.count;
                  ptax = it?.igstAmt || 0;
                }
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
                  taxAmount: ptax,
                  netAmount: items?.individualTotal,
                  amount: pamount,
                };

                existingParty.saleAmount += items?.individualTotal;
                existingParty.sale.push(a);
              });
            }
          });
        } else {
          const object = {
            partyName: item?.party?.partyName,
            partyId: item?.party?._id,
            sale: [],
            saleAmount: 0,
          };

          item.items.map((it) => {
            let m = 0;
            if (it.hasGodownOrBatch) {
              if (
                it.GodownList.every((item) => item.godown_id) &&
                it.GodownList.every((item) => !item.hasOwnProperty("batch"))
              ) {
                // Initialize aggregation variables
                const aggregation = {
                  totalQuantity: 0,
                  totalDiscount: 0,
                  totalIndividualTotal: 0,
                  totalBasePrice: 0,
                  totalTaxAmount: 0,
                  rate: 0,
                };

                it.GodownList.forEach((items) => {
                  if (items.added) {
                    // Sum quantity, discount, and individual total
                    aggregation.totalQuantity += items?.count || 0;
                    aggregation.totalDiscount += items?.discount || 0;
                    aggregation.totalIndividualTotal +=
                      items?.individualTotal || 0;
                    aggregation.rate = items?.selectedPriceRate;

                    // Calculate base price
                    let basePrice, taxAmount;
                    if (it.isTaxInclusive) {
                      basePrice = Number(
                        (
                          (items?.selectedPriceRate * items?.count) /
                          (1 + it?.igst / 100)
                        ).toFixed(2)
                      );

                      const discountedPrice = Number(
                        (basePrice - (items?.discount || 0)).toFixed(2)
                      );

                      taxAmount = Number(
                        ((discountedPrice * it.igst) / 100).toFixed(2)
                      );
                    } else {
                      basePrice = items.selectedPriceRate * items?.count;

                      const discountedPrice = Number(
                        (basePrice - (items?.discount || 0)).toFixed(2)
                      );

                      taxAmount = Number(
                        ((discountedPrice * it.igst) / 100).toFixed(2)
                      );
                    }

                    // Sum base price and tax amount
                    aggregation.totalBasePrice += basePrice;
                    aggregation.totalTaxAmount += taxAmount;
                  }
                });

                // Use aggregation results as needed
                object.sale.push({
                  billnumber: item.salesNumber,
                  billDate: item.date,
                  itemName: it.product_name,
                  batch: "",
                  groupName: it.brand?.name,
                  categoryName: it?.category.name,
                  quantity: aggregation.totalQuantity,
                  rate: aggregation.rate,
                  discount: aggregation.totalDiscount,
                  taxPercentage: it.igst,
                  taxAmount: aggregation.totalTaxAmount,
                  netAmount: aggregation.totalIndividualTotal,
                  amount: aggregation.totalBasePrice,
                });

                // Add more processing if required
              } else {
                const a = it.GodownList.map((items) => {
                  if (items.added) {
                    let pamount;
                    let ptax;
                    if (it.isTaxInclusive) {
                      pamount = (
                        (items?.selectedPriceRate * it?.count) /
                        (1 + it?.igst / 100)
                      ).toFixed(2);

                      const discountedPrice = Number(
                        (pamount - (items?.discount || 0))?.toFixed(2)
                      );

                      ptax = ((discountedPrice * it?.igst) / 100).toFixed(2);
                    } else {
                      pamount = items.selectedPriceRate * items?.count;
                      const discountedPrice = Number(
                        (pamount - (items?.discount || 0))?.toFixed(2)
                      );
                      ptax = (it?.igst / 100) * discountedPrice;
                    }
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
                      taxAmount: ptax,
                      netAmount: items?.individualTotal,
                      amount: pamount,
                    };
                    object.saleAmount += items.individualTotal || 0;

                    // Push the new sale entry to the sale array
                    object.sale.push(newSale);
                  }
                });
              }
            } else {
              it.GodownList.map((items) => {
                let pamount;
                let ptax;
                if (it.isTaxInclusive) {
                  pamount = (
                    (items?.selectedPriceRate * it?.count) /
                    (1 + it?.igst / 100)
                  ).toFixed(2);
                  ptax = it?.igstAmt || 0;
                } else {
                  pamount = items.selectedPriceRate * it.count;
                  const discountedPrice = Number(
                    (pamount - (it?.discount || 0))?.toFixed(2)
                  );
                  ptax =( it?.igstAmt/100)*discountedPrice || 0;
                }
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
                  taxAmount: ptax,
                  netAmount: items?.individualTotal,
                  amount: pamount,
                };

                object.saleAmount += items?.individualTotal;
                object.sale.push(a);
              });
            }
          });
          check.push(object);
        }
      });
      setSummaryReport(check);
    } else if (option === "Stock Group") {
      summary.map((item) => {
        item.items.map((h) => {
          if (h?.brand?.name) {
            let existingParty = check.find((data) => {
              return data.groupId === h.brand?._id;
            });

            if (existingParty) {
              if (h.hasGodownOrBatch) {
                if (
                  h.GodownList.every((item) => item.godown_id) && // Check all have godown_id
                  h.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
                ) {
                  const godown = h.GodownList.reduce((acc, items) => {
                    if (items.added) {
                      if (Object.keys(acc).length > 0) {
                        // Update the existing object's values
                        acc.quantity += items?.count;
                        acc.discount += h?.discount;
                        acc.netAmount += items?.individualTotal;
                        acc.taxAmount += h?.igstAmt;
                        existingParty.saleAmount += items?.individualTotal;
                      } else {
                        let pamount;
                        let ptax;
                        if (h.isTaxInclusive) {
                          pamount = (
                            items?.selectedPriceRate*items?.count /
                            (1 + h?.igst / 100)
                          ).toFixed(2);
                          const discountedPrice = Number(
                            (pamount - (items?.discount || 0))?.toFixed(2)
                          );
                          ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                        } else {
                          pamount = items?.selectedPriceRate * items?.count;
                          const discountedPrice = Number(
                            (pamount - (items?.discount || 0))?.toFixed(2)
                          )
                          ptax = (h?.igst / 100) * discountedPrice;
                        }
                        // Populate the object for the first time
                        Object.assign(acc, {
                          billnumber: item?.salesNumber,
                          billDate: item?.date,
                          itemName: h?.product_name,
                          categoryName: h?.category?.name,

                          partyName: item?.party?.partyName,
                          quantity: items?.count,
                          rate: items?.selectedPriceRate,
                          discount: items?.discount,
                          taxPercentage: h?.igst,
                          taxAmount: h?.igstAmt,
                          netAmount: items?.individualTotal,
                          amount: pamount,
                        });

                        existingParty.saleAmount += items?.individualTotal;
                      }
                      return acc;
                    }
                  }, {});
                  existingParty.sale.push(godown);
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      let pamount;
                      let ptax;
                      if (h.isTaxInclusive) {
                        pamount = (
                          items?.selectedPriceRate*items?.count /
                          (1 + h?.igst / 100)
                        ).toFixed(2);
                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        );
                        ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                      } else {
                        pamount = items?.selectedPriceRate * items?.count;
                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        )
                        ptax = (h?.igst / 100) * discountedPrice;
                      }
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
                        taxAmount: h?.igstAmt,
                        netAmount: items?.individualTotal,
                        amount: pamount,
                      };

                      existingParty.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      existingParty.sale.push(newSale);
                    }
                  });
                }
              } else {
                h.GodownList.map((items) => {
                  let pamount;
                  let ptax;
                  if (h.isTaxInclusive) {
                    pamount = (
                      items?.selectedPriceRate*items?.count /
                      (1 + h?.igst / 100)
                    ).toFixed(2);
                    const discountedPrice = Number(
                      (pamount - (items?.discount || 0))?.toFixed(2)
                    );
                    ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                  } else {
                    pamount = items?.selectedPriceRate * items?.count;
                    const discountedPrice = Number(
                      (pamount - (items?.discount || 0))?.toFixed(2)
                    )
                    ptax = (h?.igst / 100) * discountedPrice;
                  }
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
                    taxAmount: h?.igstAmt,
                    netAmount: items?.individualTotal,
                    amount: pamount,
                  };

                  existingParty.saleAmount += items?.individualTotal;
                  existingParty.sale.push(a);
                });
              }
            } else {
              const object = {
                groupName: h?.brand?.name,
                groupId: h?.brand?._id,
                sale: [],
                saleAmount: 0,
              };

              let m = 0;
              if (h.hasGodownOrBatch) {
                if (
                  h.GodownList.every((item) => item.godown_id) && // Check all have godown_id
                  h.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
                ) {
                  const godown = h.GodownList.reduce((acc, items) => {
                    if (items.added) {
                      if (Object.keys(acc).length > 0) {
                        // Update the existing object's values
                        acc.quantity += items?.count;
                        acc.discount += items?.discount;
                        acc.netAmount += items?.individualTotal;
                        acc.taxAmount += h?.igstAmt;

                        m += items?.individualTotal;
                      } else {
                        let pamount;
                        if (h.isTaxInclusive) {
                          pamount = (
                            items?.selectedPriceRate*items?.count /
                            (1 + h?.igst / 100)
                          ).toFixed(2);
                          const discountedPrice = Number(
                            (pamount - (items?.discount || 0))?.toFixed(2)
                          );
                          ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                        } else {
                          pamount = items?.selectedPriceRate * items?.count;
                          const discountedPrice = Number(
                            (pamount - (items?.discount || 0))?.toFixed(2)
                          )
                          ptax = (h?.igst / 100) * discountedPrice;
                        }
                        // Populate the object for the first time
                        Object.assign(acc, {
                          billnumber: item?.salesNumber,
                          billDate: item?.date,
                          itemName: h?.product_name,
                          partyName: item?.party?.partyName,
                          categoryName: h?.category?.name,
                          quantity: items?.count,
                          rate: items?.selectedPriceRate,
                          discount: items?.discount,
                          taxPercentage: h?.igst,
                          taxAmount: h?.igstAmt,
                          netAmount: items?.individualTotal,
                          amount: pamount,
                        });
                        m += items?.individualTotal;
                      }
                      return acc;
                    }
                  }, {});
                  object.saleAmount += m;
                  object.sale.push(godown);
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      let pamount;
                      let ptax;
                      if (h.isTaxInclusive) {
                        pamount = (
                          items?.selectedPriceRate*items?.count /
                          (1 + h?.igst / 100)
                        ).toFixed(2);
                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        );
                        ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                      } else {
                        pamount = items?.selectedPriceRate * items?.count;
                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        )
                        ptax = (h?.igst / 100) * discountedPrice;
                      }
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
                        taxAmount: h?.igstAmt,
                        netAmount: items?.individualTotal,
                        amount: pamount,
                      };

                      // Add the individual total to the sale amount
                      object.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      object.sale.push(newSale);
                    }
                  });
                }
              } else {
                h.GodownList.map((items) => {
                  let pamount;
                  let ptax;
                  if (h.isTaxInclusive) {
                    pamount = (
                      items?.selectedPriceRate*items?.count /
                      (1 + h?.igst / 100)
                    ).toFixed(2);
                    const discountedPrice = Number(
                      (pamount - (items?.discount || 0))?.toFixed(2)
                    );
                    ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                  } else {
                    pamount = items?.selectedPriceRate * items?.count;
                    const discountedPrice = Number(
                      (pamount - (items?.discount || 0))?.toFixed(2)
                    )
                    ptax = (h?.igst / 100) * discountedPrice;
                  }
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
                    taxAmount: h?.igstAmt,
                    netAmount: items?.individualTotal,
                    amount: pamount,
                  };
                  object.saleAmount += items?.individualTotal;
                  object.sale.push(a);
                });
              }

              check.push(object);
            }
          }
        });
      });
      setSummaryReport(check);
    } else if (option === "Stock Category") {
      summary.map((item) => {
        const z = item.items.map((h) => {
          if (h?.category) {
            let existingParty = check.find((data) => {
              return data.categoryName === h.category;
            });
            if (existingParty) {
              if (h.hasGodownOrBatch) {
                if (
                  h.GodownList.every((item) => item.godown_id) && // Check all have godown_id
                  h.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
                ) {
                  const godown = h.GodownList.reduce((acc, items) => {
                    if (items.added) {
                      if (Object.keys(acc).length > 0) {
                        // Update the existing object's values
                        acc.quantity += items?.count;
                        acc.discount += items?.discount;
                        acc.netAmount += items?.individualTotal;
                        acc.taxAmount += items?.igstAmt;
                        existingParty.saleAmount += items?.individualTotal;
                      } else {
                        let pamount;
                        let ptax;
                        if (h.isTaxInclusive) {
                          pamount = (
                            items?.selectedPriceRate*items?.count /
                            (1 + h?.igst / 100)
                          ).toFixed(2);
                          const discountedPrice = Number(
                            (pamount - (items?.discount || 0))?.toFixed(2)
                          );
                          ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                        } else {
                          pamount = items?.selectedPriceRate * items?.count;
                          const discountedPrice = Number(
                            (pamount - (items?.discount || 0))?.toFixed(2)
                          )
                          ptax = (h?.igst / 100) * discountedPrice;
                        }

                        // Populate the object for the first time
                        Object.assign(acc, {
                          billnumber: item?.salesNumber,
                          billDate: item?.date,
                          itemName: h?.product_name,
                          partyName: item?.party?.partyName,
                          groupName: h?.brand?.name,
                          quantity: items?.count,
                          rate: items?.selectedPriceRate,
                          discount: items?.discount,
                          taxPercentage: h?.igst,
                          taxAmount: items?.igstAmt,
                          netAmount: items?.individualTotal,
                          amount: pamount,
                        });
                        existingParty.saleAmount += items?.individualTotal;
                      }
                      return acc;
                    }
                  }, {});
                  existingParty.sale.push(godown);
                } else {
                  h.GodownList.map((items) => {
                    if (items.added) {
                      let pamount;
                      let ptax;
                      if (h.isTaxInclusive) {
                        pamount = (
                          items?.selectedPriceRate*items?.count /
                          (1 + h?.igst / 100)
                        ).toFixed(2);
                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        );
                        ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                      } else {
                        pamount = items?.selectedPriceRate * items?.count;
                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        )
                        ptax = (h?.igst / 100) * discountedPrice;
                      }
                      const newSale = {
                        billnumber: item?.salesNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        groupName: h?.brand?.name,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discount,
                        taxPercentage: h?.igst,
                        taxAmount: h?.igstAmt,
                        netAmount: items?.individualTotal,
                        amount: pamount,
                      };
                      existingParty.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      existingParty.sale.push(newSale);
                    }
                  });
                }
              } else {
                const godown = h.GodownList.map((items) => {
                  let pamount;
                  let ptax;
                  if (h.isTaxInclusive) {
                    pamount = (
                      items?.selectedPriceRate*items?.count /
                      (1 + h?.igst / 100)
                    ).toFixed(2);
                    const discountedPrice = Number(
                      (pamount - (items?.discount || 0))?.toFixed(2)
                    );
                    ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                  } else {
                    pamount = items?.selectedPriceRate * items?.count;
                    const discountedPrice = Number(
                      (pamount - (items?.discount || 0))?.toFixed(2)
                    )
                    ptax = (h?.igst / 100) * discountedPrice;
                  }
                  const a = {
                    billnumber: item?.salesNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    groupName: h?.brand?.name,
                    partyName: item?.party?.partyName,
                    quantity: h?.count,
                    rate: items?.selectedPriceRate,
                    discount: h?.discount,
                    taxPercentage: h?.igst,
                    taxAmount: h?.igstAmt,
                    netAmount: items?.individualTotal,
                    amount: pamount,
                  };

                  existingParty.saleAmount += items?.individualTotal;
                  existingParty.sale.push(a);
                });
              }
            } else {
              const object = {
                categoryName: h?.category?.name,

                sale: [],
                saleAmount: 0,
              };

              let m = 0;
              if (h.hasGodownOrBatch) {
                if (
                  h.GodownList.every((item) => item.godown_id) && // Check all have godown_id
                  h.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
                ) {
                  const godown = h.GodownList.reduce((acc, items) => {
                    if (items.added) {
                      if (Object.keys(acc).length > 0) {
                        // Update the existing object's values
                        acc.quantity += items?.count;
                        acc.discount += items?.discount;
                        acc.netAmount += items?.individualTotal;
                        acc.taxAmount += items?.igstAmt;
                        m += items?.individualTotal;
                      } else {
                        let pamount;
                        let ptax;
                        if (h.isTaxInclusive) {
                          pamount = (
                            items?.selectedPriceRate*items?.count /
                            (1 + h?.igst / 100)
                          ).toFixed(2);
                          const discountedPrice = Number(
                            (pamount - (items?.discount || 0))?.toFixed(2)
                          );
                          ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                        } else {
                          pamount = items?.selectedPriceRate * items?.count;
                          const discountedPrice = Number(
                            (pamount - (items?.discount || 0))?.toFixed(2)
                          )
                          ptax = (h?.igst / 100) * discountedPrice;
                        }
                        // Populate the object for the first time
                        Object.assign(acc, {
                          billnumber: item?.salesNumber,
                          billDate: item?.date,
                          itemName: h?.product_name,
                          groupName: h?.brand?.name,
                          partyName: item?.party?.partyName,
                          quantity: items?.count,
                          rate: items?.selectedPriceRate,
                          discount: items?.discount,
                          taxPercentage: h?.igst,
                          taxAmount: items?.igstAmt,
                          netAmount: items?.individualTotal,
                          amount: pamount,
                        });
                        m += items?.individualTotal;
                      }
                      return acc;
                    }
                  }, {});
                  object.saleAmount += m;
                  object.sale.push(godown);
                } else {
                  const godown = h.GodownList.map((items) => {
                    if (items.added) {
                      let pamount;
                      let ptax;
                      if (h.isTaxInclusive) {
                        pamount = (
                          items?.selectedPriceRate*items?.count /
                          (1 + h?.igst / 100)
                        ).toFixed(2);
                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        );
                        ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                      } else {
                        pamount = items?.selectedPriceRate * items?.count;
                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        )
                        ptax = (h?.igst / 100) * discountedPrice;
                      }
                      const newSale = {
                        billnumber: item?.salesNumber,
                        billDate: item?.date,
                        itemName: h?.product_name,
                        batch: items?.batch,
                        partyName: item?.party?.partyName,
                        groupName: h?.brand?.name,
                        quantity: items?.count,
                        rate: items?.selectedPriceRate,
                        discount: items?.discount,
                        taxPercentage: h?.igst,
                        taxAmount: h?.igstAmt,
                        netAmount: items?.individualTotal,
                        amount: pamount,
                      };

                      // Add the individual total to the sale amount
                      object.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      object.sale.push(newSale);
                    }
                  });
                }
              } else {
                const godown = h.GodownList.map((items) => {
                  let pamount;
                  let ptax;
                  if (h.isTaxInclusive) {
                    pamount = (
                      items?.selectedPriceRate*items?.count /
                      (1 + h?.igst / 100)
                    ).toFixed(2);
                    const discountedPrice = Number(
                      (pamount - (items?.discount || 0))?.toFixed(2)
                    );
                    ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                  } else {
                    pamount = items?.selectedPriceRate * items?.count;
                    const discountedPrice = Number(
                      (pamount - (items?.discount || 0))?.toFixed(2)
                    )
                    ptax = (h?.igst / 100) * discountedPrice;
                  }
                  const a = {
                    billnumber: item?.salesNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,
                    partyName: item?.party?.partyName,
                    groupName: h?.brand?.name,
                    quantity: h?.count,
                    rate: items?.selectedPriceRate,
                    discount: h?.discount,
                    taxPercentage: h?.igst,
                    taxAmount: h?.igstAmt,
                    netAmount: items?.individualTotal,
                    amount: pamount,
                  };
                  object.saleAmount += items?.individualTotal;
                  object.sale.push(a);
                });
              }

              check.push(object);
            }
          }
        });
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
                  h.GodownList.every((item) => item.godown_id) && // Check all have godown_id
                  h.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
                ) {
                  // Initialize aggregation variables
                  const aggregation = {
                    totalQuantity: 0,
                    totalDiscount: 0,
                    totalIndividualTotal: 0,
                    totalBasePrice: 0,
                    totalTaxAmount: 0,
                    rate: 0,
                  };

                  h.GodownList.forEach((items) => {

                    if (items.added) {
                      // Sum quantity, discount, and individual total
                      aggregation.totalQuantity += items?.count || 0;
                      aggregation.totalDiscount += items?.discount || 0;
                      aggregation.totalIndividualTotal +=
                        items?.individualTotal || 0;
                      aggregation.rate = items?.selectedPriceRate;

                      // Calculate base price
                      let basePrice, taxAmount;
                      if (h.isTaxInclusive) {
                        basePrice = Number(
                          (
                            (items?.selectedPriceRate * items?.count) /
                            (1 + h?.igst / 100)
                          ).toFixed(2)
                        );

                        const discountedPrice = Number(
                          (basePrice - (items?.discount || 0)).toFixed(2)
                        );

                        taxAmount = Number(
                          ((discountedPrice * h.igst) / 100).toFixed(2)
                        );
                      } else {
                        basePrice = items.selectedPriceRate * items?.count;

                        const discountedPrice = Number(
                          (basePrice - (items?.discount || 0)).toFixed(2)
                        );

                        taxAmount = Number(
                          ((discountedPrice * h.igst) / 100).toFixed(2)
                        );
                      }

                      // Sum base price and tax amount
                      aggregation.totalBasePrice += basePrice;
                      aggregation.totalTaxAmount += taxAmount;
                    }
                  });

                  // Use aggregation results as needed
                  existingParty.sale.push({
                    billnumber: item.salesNumber,
                    billDate: item.date,
                    partyName: item.party?.partyName,
                    batch: "",
                    groupName: h.brand?.name,
                    categoryName: h?.category.name,
                    quantity: aggregation.totalQuantity,
                    rate: aggregation.rate,
                    discount: aggregation.totalDiscount,
                    taxPercentage: h.igst,
                    taxAmount: aggregation.totalTaxAmount,
                    netAmount: aggregation.totalIndividualTotal,
                    amount: aggregation.totalBasePrice,
                  });
                  console.log(aggregation.totalIndividualTotal);

                  existingParty.saleAmount += aggregation.totalIndividualTotal;
                  // existingParty.sale.push(godown);

                  // const godown = h.GodownList.reduce((acc, items) => {
                  //   if (items.added) {
                  //     if (Object.keys(acc).length > 0) {
                  //       // Update the existing object's values
                  //       acc.quantity += items?.count;
                  //       acc.discount += items?.discount;
                  //       acc.netAmount += items?.individualTotal;
                  //       acc.taxAmount += items?.igstAmt;
                  //       existingParty.saleAmount += items?.individualTotal;
                  //     } else {
                  //       let pamount;
                  //       let ptax;
                  //       if (h.isTaxInclusive) {
                  //         pamount = (
                  //           items?.selectedPriceRate /
                  //           (1 + h?.igst / 100)
                  //         ).toFixed(2);
                  //         ptax = ((pamount * h.igst) / 100).toFixed(2);
                  //       } else {
                  //         pamount = items?.selectedPriceRate;
                  //         ptax = (h?.igst / 100) * pamount;
                  //       }
                  //       // Populate the object for the first time
                  //       Object.assign(acc, {
                  //         billnumber: item?.salesNumber,
                  //         billDate: item?.date,
                  //         groupName: h?.brand?.name,
                  //         partyName: item?.party?.partyName,
                  //         categoryName: h?.category?.name,
                  //         quantity: items?.count,
                  //         rate: items?.selectedPriceRate,
                  //         discount: items?.discount,
                  //         taxPercentage: h?.igst,
                  //         taxAmount: ptax,
                  //         netAmount: items?.individualTotal,
                  //         amount: pamount,
                  //       });
                  //       existingParty.saleAmount += items?.individualTotal;
                  //     }
                  //   }
                  //   return acc;
                  // }, {});
                } else {

                  console.log("dkfjgdlk");
                  
                  const a = h.GodownList.map((items) => {
                    if (items.added) {
                      let pamount;
                      let ptax;
                      if (h.isTaxInclusive) {
                        pamount = (
                          items?.selectedPriceRate*items?.count /
                          (1 + h?.igst / 100)
                        ).toFixed(2);
                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        );
                        ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                      } else {
                        pamount = items?.selectedPriceRate * items?.count;
                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        )
                        ptax = (h?.igst / 100) * discountedPrice;
                      }
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
                        taxAmount: ptax,
                        netAmount: items?.individualTotal,
                        amount: pamount,
                      };
                      existingParty.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      existingParty.sale.push(newSale);
                    }
                  });
                }
              } else {
                
                const godown = h.GodownList.map((items) => {
                  let pamount;
                  let ptax;
                  if (h.isTaxInclusive) {
                    pamount = (
                      items?.selectedPriceRate*h?.count /
                      (1 + h?.igst / 100)
                    ).toFixed(2);

                    const discountedPrice = Number(
                      (pamount - (h?.discount || 0))?.toFixed(2)
                    );
                    ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                  } else {
                    pamount = items?.selectedPriceRate * h?.count;
                    const discountedPrice = Number(
                      (pamount - (h?.discount || 0))?.toFixed(2)
                    )
                    ptax = (h?.igst / 100) * discountedPrice;
                  }
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
                    taxAmount: ptax,
                    netAmount: items?.individualTotal,
                    amount: pamount,
                  };

                  existingParty.saleAmount += items?.individualTotal;
                  existingParty.sale.push(a);
                });
              }
            } else {
              const object = {
                itemName: h?.product_name,

                sale: [],
                saleAmount: 0,
              };

              let m = 0;
              if (h.hasGodownOrBatch) {
                if (
                  h.GodownList.every((item) => item.godown_id) && // Check all have godown_id
                  h.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
                ) {
                  const aggregation = {
                    totalQuantity: 0,
                    totalDiscount: 0,
                    totalIndividualTotal: 0,
                    totalBasePrice: 0,
                    totalTaxAmount: 0,
                    rate: 0,
                  };

                  h.GodownList.forEach((items) => {
                    console.log(items);

                    if (items.added) {
                      // Sum quantity, discount, and individual total
                      aggregation.totalQuantity += items?.count || 0;
                      aggregation.totalDiscount += items?.discount || 0;
                      aggregation.totalIndividualTotal +=
                        items?.individualTotal || 0;
                      aggregation.rate = items?.selectedPriceRate;

                      // Calculate base price
                      let basePrice, taxAmount;
                      if (h.isTaxInclusive) {
                        basePrice = Number(
                          (
                            (items?.selectedPriceRate * items?.count) /
                            (1 + h?.igst / 100)
                          ).toFixed(2)
                        );

                        const discountedPrice = Number(
                          (basePrice - (items?.discount || 0)).toFixed(2)
                        );

                        taxAmount = Number(
                          ((discountedPrice * h.igst) / 100).toFixed(2)
                        );
                      } else {
                        basePrice = items.selectedPriceRate * items?.count;

                        const discountedPrice = Number(
                          (basePrice - (items?.discount || 0)).toFixed(2)
                        );

                        taxAmount = Number(
                          ((discountedPrice * h.igst) / 100).toFixed(2)
                        );
                      }

                      // Sum base price and tax amount
                      aggregation.totalBasePrice += basePrice;
                      aggregation.totalTaxAmount += taxAmount;
                    }
                  });

                  // Use aggregation results as needed
                  object.sale.push({
                    billnumber: item.salesNumber,
                    billDate: item.date,
                    // itemName: h.product_name,
                    partyName: item?.party?.partyName,

                    batch: "",
                    groupName: h.brand?.name,
                    categoryName: h?.category.name,
                    quantity: aggregation.totalQuantity,
                    rate: aggregation.rate,
                    discount: aggregation.totalDiscount,
                    taxPercentage: h.igst,
                    taxAmount: aggregation.totalTaxAmount,
                    netAmount: aggregation.totalIndividualTotal,
                    amount: aggregation.totalBasePrice,
                  });

                  object.saleAmount += aggregation.totalIndividualTotal;
                } else {
                  const godown = h.GodownList.map((items) => {
                    if (items.added) {
                      let pamount;
                      let ptax;
                      if (h.isTaxInclusive) {
                        pamount = (
                          items?.selectedPriceRate*items?.count /
                          (1 + h?.igst / 100)
                        ).toFixed(2);

                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        );
                        ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                      } else {
                        pamount = items?.selectedPriceRate * items?.count;

                        const discountedPrice = Number(
                          (pamount - (items?.discount || 0))?.toFixed(2)
                        );
                        ptax = (h?.igst / 100) * discountedPrice;
                      }
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
                        taxAmount: ptax,
                        netAmount: items?.individualTotal,
                        amount: pamount,
                      };

                      // Add the individual total to the sale amount
                      object.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      object.sale.push(newSale);
                    }
                  });
                }
              } else {
                
                const godown = h.GodownList.map((items) => {
                  let pamount;
                  let ptax;
                  if (h.isTaxInclusive) {
                    
                    pamount = (
                      items?.selectedPriceRate*h?.count /
                      (1 + h?.igst / 100)
                    ).toFixed(2);

                    


                    const discountedPrice = Number(
                      (pamount - (h?.discount || 0))?.toFixed(2)
                    );

                    
                    ptax = ((discountedPrice * h.igst) / 100).toFixed(2);
                  } else {
                    pamount = items?.selectedPriceRate * h?.count;
                    const discountedPrice = Number(
                      (pamount - (h?.discount || 0))?.toFixed(2)
                    )
                    ptax = (h?.igst / 100) * discountedPrice;
                  }
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
                    taxAmount: ptax,
                    netAmount: items?.individualTotal,
                    amount: pamount,
                  };
                  object.saleAmount += items?.individualTotal;
                  object.sale.push(a);
                });
              }

              check.push(object);
            }
          }
        });
      });
      setSummaryReport(check);
    }
  };

  const handleUserAndCompanyData = (data) => {
    setUserAndCompanyData(data);
  };

  return (
    <>
      {showDetails ? (
        <div className=" bg-gray-50 rounded-lg shadow-lg ">
          <div className="bg-[#219ebc] sticky top-0 z-50 ">
            <SummmaryDropdown
              selectedOption={selectedOption}
              handleLedger={handleLedger}
            />
          </div>
          <div className="flex justify-end m-1 cursor-pointer">
            <button
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-2 py-.5 rounded-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200"
              onClick={() => setShowDetails(false)}
            >
              Go Back
            </button>
          </div>

          <div className="text-center text-xl font-bold ">
            <h1>{selectedOption} Summary</h1>
          </div>

          <div className=" max-h-[600px] overflow-auto">
            <table className="w-full text-center border">
              <thead className="sticky top-0 bg-gray-300 z-40">
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
                        className="border-b hover:bg-pink-100 transition duration-200 text-sm "
                      >
                        {/* Display Party Name only for the first item in the sale array */}
                        {saleIndex === 0 ? (
                          <td
                            className="px-1 py-2 text-gray-800 font-bold"
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
                        <td className="px-1 py-2 text-gray-800">
                          {saleItem?.billnumber}
                        </td>
                        <td className="px-1 py-2 text-gray-800">
                          {/* {saleItem?.billDate} */}
                          {
                            new Date(saleItem?.billDate)
                              .toISOString()
                              .split("T")[0]
                          }
                        </td>
                        <td className="px-1 py-2 text-gray-800">
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
                        <td className="px-1 py-2 text-gray-800">
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
                        <td className="px-1 py-2 text-gray-800">
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

                        <td className="px-1 py-2 text-gray-800">
                          {saleItem?.batch}
                        </td>
                        <td className="px-1 py-2 text-gray-800">
                          {saleItem?.quantity}
                        </td>
                        <td className="px-1 py-2 text-gray-800">
                          {saleItem?.rate}
                        </td>
                        <td className="px-1 py-2 text-gray-800">
                          {saleItem?.discount}
                        </td>
                        <td className="px-1 py-2 text-gray-800">
                          {saleItem?.amount}
                        </td>
                        <td className="px-1 py-2 text-gray-800">
                          {saleItem?.taxPercentage}
                        </td>
                        <td className="px-1 py-2 text-gray-800">
                          {saleItem?.taxAmount}
                        </td>
                        <td className="px-1 py-2 text-gray-800">
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
        <div>
          <div className="sticky top-0 z-50">
            <FindUserAndCompany getUserAndCompany={handleUserAndCompanyData} />
            <TitleDiv title="Sales Summary" from={"/sUsers/reports"} />
            <section className="shadow-lg border-b">
              <SelectDate />
            </section>

            {Loading && (
              <section className="w-full">
                <BarLoader color="#9900ff" width="100%" />
              </section>
            )}
            <div
              style={{ backgroundColor: "#219ebc" }}
              className=" opacity-80  flex flex-col   pb-11 shadow-xl justify-center pt-2"
            >
              <SummmaryDropdown
                selectedOption={selectedOption}
                handleLedger={handleLedger}
              />

              <div
                className={`   text-center  text-white  flex justify-center items-center flex-col mt-5`}
              >
                {/* <h2 className="text-3xl sm:text-4xl font-bold">₹{grandTotal}</h2> */}
                <p className="text-sm mt-4 font-semibold opacity-90">
                  {new Date(start).toDateString()} -{" "}
                  {new Date(end).toDateString()}
                </p>
                {/* <p className="text-sm mt-4 font-bold opacity-90">{title}</p> */}
              </div>
            </div>
          </div>

          {!Loading && summaryReport.length <= 0 && (
            <section>
              <p className="text-gray-500 text-center font-bold  mt-20">
                Oops!.. No data found
              </p>
            </section>
          )}

          <div>
            {summaryReport && summaryReport.length > 0 && (
              <>
                <div className="flex justify-end mt-1">
                  <button
                    className="px-2 py-0.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200 cursor-pointer mx-3"
                    onClick={() => setShowDetails(true)} // Reset or handle your state
                  >
                    View Details
                  </button>
                </div>

                <div className="mt-2">
                  {summaryReport &&
                    summaryReport.length > 0 &&
                    selectedIndex === null &&
                    summaryReport.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center mb-3 p-3 bg-white rounded-lg shadow-md transform transition duration-300 hover:shadow-xl hover:scale-55 hover:-translate-y-1"
                      >
                        <span className="text-gray-800 font-medium">
                          {item?.partyName ||
                            item?.groupName ||
                            item?.categoryName ||
                            item?.itemName}
                        </span>
                        <span className="text-gray-600 font-semibold">
                          {item.saleAmount}
                        </span>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SalesSummary;
