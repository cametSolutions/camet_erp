// /* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
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
      handleLedger(selectedOption,summary, setSummaryReport);
    }
  }, [summary]);





  const handleLedger = (option, summary, setSummaryReport) => {
    setSelectedOption(option);

   

    const aggregateSalesData = (items, aggregationStrategy) => {
      const aggregatedData = {};

      items.forEach((item) => {
        const key = aggregationStrategy(item);

        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            sale: [],
            saleAmount: 0,
            ...aggregationStrategy.getInitialObject(item),
          };
        }

        const currentGroup = aggregatedData[key];

        item.items.forEach((product) => {
          processProductSales(product, currentGroup, item);
        });
      });

      return Object.values(aggregatedData);
    };

    const processProductSales = (product, currentGroup, originalItem) => {
      const processGodownItems = (godownList) => {
        const godownOnlyItems = godownList.filter(
          (item) => item.godown_id && !item.batch
        );

        if (godownOnlyItems.length > 0) {
          const summedGodownData = godownOnlyItems.reduce(
            (acc, godownItem) => {
              const { selectedPriceRate, count, discount, individualTotal } =
                godownItem;

              const calculateAmount = (rate, count) => {
                return product.isTaxInclusive
                  ? Number((rate / (1 + product.igst / 100)).toFixed(2)) * count
                  : rate * count;
              };

              const calculateTax = (baseAmount) => {
                const discountedAmount = baseAmount - (discount || 0);
                return Number(
                  ((discountedAmount * product.igst) / 100).toFixed(2)
                );
              };

              const baseAmount = calculateAmount(selectedPriceRate, count);
              const taxAmount = calculateTax(baseAmount);

              acc.quantity += count;
              acc.discount += discount || 0;
              acc.baseAmount += baseAmount;
              acc.taxAmount += taxAmount;
              acc.netAmount += individualTotal;

              return acc;
            },
            {
              quantity: 0,
              discount: 0,
              baseAmount: 0,
              taxAmount: 0,
              netAmount: 0,
              rate: godownOnlyItems[0]?.selectedPriceRate,
            }
          );

          currentGroup.sale.push({
            billnumber: originalItem.salesNumber,
            billDate: originalItem.date,
            itemName: product.product_name,
            batch: "",
            groupName: product.brand?.name,
            categoryName: product.category?.name,
            partyName: originalItem.party?.partyName,
            quantity: summedGodownData.quantity,
            rate: summedGodownData.rate,
            discount: summedGodownData.discount,
            taxPercentage: product.igst,
            taxAmount: summedGodownData.taxAmount,
            netAmount: summedGodownData.netAmount,
            amount: summedGodownData.baseAmount,
          });

          currentGroup.saleAmount += summedGodownData.netAmount;
        }

        return godownList
          .filter((item) => item.added && item.batch)
          .map((item) => calculateSaleEntry(product, item, originalItem));
      };

      const calculateSaleEntry = (product, godownItem, originalItem) => {
        const { isTaxInclusive, igst } = product;
        const { selectedPriceRate, count, discount, batch, individualTotal } =
          godownItem;

        const calculateAmount = (rate, count) => {
          return isTaxInclusive
            ? Number((rate / (1 + igst / 100)).toFixed(2)) * count
            : rate * count;
        };

        const calculateTax = (baseAmount) => {
          const discountedAmount = baseAmount - (discount || 0);
          return Number(((discountedAmount * igst) / 100).toFixed(2));
        };

        const baseAmount = calculateAmount(selectedPriceRate, count);
        const taxAmount = calculateTax(baseAmount);

        currentGroup.saleAmount += individualTotal;

        return {
          billnumber: originalItem.salesNumber,
          billDate: originalItem.date,
          itemName: product.product_name,
          batch: batch || "",
          groupName: product.brand?.name,
          categoryName: product.category?.name,
          partyName: originalItem.party?.partyName,
          quantity: count,
          rate: selectedPriceRate,
          discount: discount,
          taxPercentage: igst,
          taxAmount: taxAmount,
          netAmount: individualTotal,
          amount: baseAmount,
        };
      };

      const saleEntries = processGodownItems(product.GodownList);
      currentGroup.sale.push(...saleEntries);
    };

    const aggregationStrategies = {
      Ledger: (item) => item.party?._id,
      "Stock Group": (item) => item.items[0]?.brand?._id,
      "Stock Category": (item) => item.items[0]?.category?.name,
      "Stock Item": (item) => item.items[0]?.product_name,
    };

    const aggregationInitializers = {
      Ledger: (item) => ({
        partyName: item.party?.partyName,
        partyId: item.party?._id,
      }),
      "Stock Group": (item) => ({
        groupName: item.items[0]?.brand?.name,
        groupId: item.items[0]?.brand?._id,
      }),
      "Stock Category": (item) => ({
        categoryName: item.items[0]?.category?.name,
      }),
      "Stock Item": (item) => ({
        itemName: item.items[0]?.product_name,
      }),
    };

    const strategy = aggregationStrategies[option];
    const initializer = aggregationInitializers[option];
    strategy.getInitialObject = initializer;

    const summaryReport = aggregateSalesData(summary, strategy);
    setSummaryReport(summaryReport);
  };

  const handleUserAndCompanyData = (data) => {
    setUserAndCompanyData(data);
  };


  console.log(summaryReport);
  

  return (
    <>
      {showDetails ? (
        <div className=" bg-gray-50 rounded-lg shadow-lg ">
          <div className="bg-[#219ebc] sticky top-0 z-50 ">
            <SummmaryDropdown
              selectedOption={selectedOption}
              // handleLedger={handleLedger}
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
                          {/* {
                            new Date(saleItem?.billDate)
                              .toISOString()
                              .split("T")[0]
                          } */}
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
