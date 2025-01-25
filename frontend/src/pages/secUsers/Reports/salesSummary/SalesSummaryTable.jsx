/* eslint-disable no-prototype-builtins */
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import TitleDiv from "../../../../components/common/TitleDiv";
import SummmaryDropdown from "../../../../components/Filters/SummaryDropdown";
import SelectDate from "../../../../components/Filters/SelectDate";
function SalesSummaryTable() {
  const [selectedOption, setSelectedOption] = useState("Ledger");
  const [summaryReport, setSummaryReport] = useState([]);

  const location = useLocation();
  const summary = location?.state?.summary;

  useEffect(() => {
    if (summary && summary.length > 0) {
      // setSelectedIndex(null);
      handleLedger(selectedOption);
    }
  }, [summary]);

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
      : itemPrice * count;

    const discountedPrice = Number((basePrice - (discount || 0)).toFixed(2));
    const taxAmount = Number(((discountedPrice * igst) / 100).toFixed(2));

    console.log(basePrice, taxAmount);
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
      batch: "",
      groupName: item?.brand?.name,
      categoryName: item?.category?.name,
      quantity: aggregation.totalQuantity,
      rate: aggregation?.rate,
      discount: aggregation?.totalDiscount,
      taxPercentage: item?.igst,
      taxAmount: aggregation?.totalTaxAmount,
      netAmount: aggregation?.totalIndividualTotal,
      amount: aggregation?.totalBasePrice,
    });

    return saleObject.sale;
  };

  const handleLedger = (option) => {
    setSelectedOption(option);
    let check = [];
    // let arr = []
    if (option === "Ledger") {

      summary.map((item) => {
        let existingParty = check?.find((data) => {
          return data?.partyId === item?.party?._id;
        });

        if (existingParty) {
          item.items.map((it) => {
            if (it.hasGodownOrBatch) {
              if (isGodownOnly(it)) {
                processGodownMerging(it, existingParty, item);
              } else {
                it.GodownList.map((items) => {
                  if (items.added) {
                    const { basePrice, taxAmount } = calculateTaxAndPrice(
                      it.isTaxInclusive,
                      items?.selectedPriceRate,
                      items?.count,
                      it?.igst,
                      items?.discount
                    );

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
                      taxAmount: taxAmount,
                      netAmount: items.individualTotal,
                      amount: basePrice,
                    };
                    existingParty.saleAmount += items.individualTotal;
                    // Push the new sale entry to the sale array
                    existingParty.sale.push(newSale);
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
                existingParty.sale.push(newSale);
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
            let m = 0;
            if (it.hasGodownOrBatch) {
              if (isGodownOnly(it)) {
                processGodownMerging(it, saleObject, item);
              } else {
                const a = it.GodownList.map((items) => {
                  if (items.added) {
                    const { basePrice, taxAmount } = calculateTaxAndPrice(
                      it.isTaxInclusive,
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
                    saleObject.saleAmount += items.individualTotal || 0;

                    // Push the new sale entry to the sale array
                    saleObject.sale.push(newSale);
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
                saleObject.sale.push(a);
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
                  //       // Update the existing saleObject's values
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
                  //       // Populate the saleObject for the first time
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
                          (items?.selectedPriceRate * items?.count) /
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
              } 
              
              
              else {
                const godown = h.GodownList.map((items) => {
                  let pamount;
                  let ptax;
                  if (h.isTaxInclusive) {
                    pamount = (
                      (items?.selectedPriceRate * h?.count) /
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
                    );
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
              const saleObject = {
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
                  saleObject.sale.push({
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

                  saleObject.saleAmount += aggregation.totalIndividualTotal;
                } else {
                  const godown = h.GodownList.map((items) => {
                    if (items.added) {
                      let pamount;
                      let ptax;
                      if (h.isTaxInclusive) {
                        pamount = (
                          (items?.selectedPriceRate * items?.count) /
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
                      saleObject.saleAmount += items?.individualTotal;

                      // Push the new sale entry to the sale array
                      saleObject.sale.push(newSale);
                    }
                  });
                }
              } else {
                const godown = h.GodownList.map((items) => {
                  let pamount;
                  let ptax;
                  if (h.isTaxInclusive) {
                    pamount = (
                      (items?.selectedPriceRate * h?.count) /
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
                    );
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
  };

  return (
    <div>
      <div className="flex flex-col sticky top-0 ">
        <TitleDiv title={"Sales Summary Details"} from="/sUsers/salesSummary" />
        <SelectDate />
        <div className="flex px-2  bg-white shadow-lg border-t shadow-lg">
          <SummmaryDropdown
            selectedOption={selectedOption}
            handleLedger={handleLedger}
          />
        </div>
        <table></table>
      </div>

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
                <th className="p-2 font-semibold text-gray-600">Tax Amount</th>
                <th className="p-2 font-semibold text-gray-600">Net Amount</th>
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
                        {/* {saleItem?.billDate} */}
                        {
                          new Date(saleItem?.billDate)
                            .toISOString()
                            .split("T")[0]
                        }
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
                        {saleItem?.amount}
                      </td>
                      <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                        {saleItem?.taxPercentage}
                      </td>
                      <td className="px-1 py-2 text-gray-800 text-xs cursor-pointer">
                        {saleItem?.taxAmount}
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
    </div>
  );
}
export default SalesSummaryTable;
